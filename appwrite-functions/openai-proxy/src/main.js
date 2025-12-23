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

        log(`Calling OpenAI Responses API with model: ${model}`);

        // Call OpenAI Responses API
        let data;
        try {
            if (useStructuredOutput && schema) {
                // Use Responses API with structured JSON output
                const response = await openai.responses.create({
                    model,
                    input: prompt,
                    instructions: systemPrompt || undefined,
                    temperature,
                    max_output_tokens: maxTokens,
                    text: {
                        format: {
                            type: 'json_schema',
                            json_schema: {
                                name: schemaName,
                                strict: true,
                                schema: schema
                            }
                        }
                    }
                });

                log('OpenAI Responses API call successful (structured)');

                // Format response to maintain compatibility with chat API
                data = {
                    choices: [{
                        message: {
                            content: response.output_text,
                            parsed: response.output_parsed || JSON.parse(response.output_text)
                        }
                    }],
                    output_text: response.output_text,
                    output_parsed: response.output_parsed
                };
            } else {
                // Use Responses API for simple text generation
                const response = await openai.responses.create({
                    model,
                    input: prompt,
                    instructions: systemPrompt || undefined,
                    temperature,
                    max_output_tokens: maxTokens
                });

                log('OpenAI Responses API call successful');

                // Format response to maintain compatibility with chat API
                data = {
                    choices: [{
                        message: {
                            content: response.output_text
                        }
                    }],
                    output_text: response.output_text
                };
            }
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
