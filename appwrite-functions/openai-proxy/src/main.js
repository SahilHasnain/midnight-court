import { Client, Databases } from 'node-appwrite';
import OpenAI from 'openai';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID;
const collectionId = 'ai_usage';

export default async ({ req, res, log, error }) => {
    if (req.method !== 'POST') {
        return res.json({ error: 'Method not allowed' }, 405);
    }

    try {
        // Check usage limits
        let usage;
        try {
            usage = await databases.getDocument(dbId, collectionId, 'single_user');
        } catch (e) {
            error(`Failed to get usage: ${e.message}`);
            return res.json({ error: 'Usage tracking error' }, 500);
        }

        if (usage.used >= usage.limit) {
            return res.json(
                {
                    error: 'AI_LIMIT_EXCEEDED',
                    message: 'AI usage limit reached. You have used all your AI requests.'
                },
                429
            );
        }

        // Parse request body
        let payload;
        try {
            payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (parseError) {
            error(`Body parse error: ${parseError.message}`);
            return res.json({ error: 'Invalid JSON in request body' }, 400);
        }

        const {
            prompt,
            systemPrompt = '',
            schema,
            schemaName = 'response',
            model = 'gpt-4o-mini',
            temperature = 0.7,
            maxTokens = 4096,
            useStructuredOutput = false
        } = payload;

        if (!prompt) {
            return res.json({ error: 'Prompt is required' }, 400);
        }

        // Initialize OpenAI client
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            error('OPENAI_API_KEY not configured');
            return res.json({ error: 'Server configuration error' }, 500);
        }

        const openai = new OpenAI({ apiKey });

        log(`Calling OpenAI API with model: ${model}`);

        // Build messages array
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        // Prepare API call options
        const apiOptions = {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
        };

        // Add structured output support if schema provided
        if (useStructuredOutput && schema) {
            // OpenAI structured outputs using response_format
            apiOptions.response_format = {
                type: 'json_schema',
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema: schema
                }
            };
        } else if (schema) {
            // Legacy JSON mode - less strict
            apiOptions.response_format = { type: 'json_object' };

            // Add schema to system prompt for guidance
            const schemaPrompt = `You must respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
            if (messages[0]?.role === 'system') {
                messages[0].content += `\n\n${schemaPrompt}`;
            } else {
                messages.unshift({ role: 'system', content: schemaPrompt });
            }
        }

        // Call OpenAI API
        let data;
        try {
            const response = await openai.chat.completions.create(apiOptions);

            log('OpenAI API call successful');

            // Parse structured output if using json_schema mode
            if (useStructuredOutput && schema) {
                const content = response.choices[0]?.message?.content;
                if (content) {
                    try {
                        const parsed = JSON.parse(content);
                        // Add parsed field for compatibility
                        response.choices[0].message.parsed = parsed;
                    } catch (parseErr) {
                        error(`Failed to parse structured output: ${parseErr.message}`);
                    }
                }
            }

            data = response;
        } catch (apiError) {
            error(`OpenAI API error: ${apiError.message}`);
            return res.json(
                {
                    error: 'OpenAI API request failed',
                    details: apiError.message
                },
                apiError.status || 500
            );
        }

        // Increment usage counter
        try {
            const currentUsage = await databases.getDocument(dbId, collectionId, 'single_user');
            await databases.updateDocument(dbId, collectionId, 'single_user', {
                used: currentUsage.used + 1
            });
            log(`Usage incremented: ${currentUsage.used + 1}/${currentUsage.limit}`);
        } catch (e) {
            error(`Failed to update usage: ${e.message}`);
            // Don't fail the request if usage tracking fails
        }

        return res.json(data);
    } catch (err) {
        error(`Exception: ${err.message}`);
        return res.json({ error: err.message }, 500);
    }
};
