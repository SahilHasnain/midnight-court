import { Client, Databases } from 'node-appwrite';

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
    let usage;
    try {
      usage = await databases.getDocument(dbId, collectionId, 'single_user');
    } catch (e) {
      error(`Failed to get usage: ${e.message}`);
      return res.json({ error: 'Usage tracking error' }, 500);
    }

    if (usage.used >= usage.limit) {
      return res.json({ error: 'AI_LIMIT_EXCEEDED', message: 'AI usage limit reached. You have used all your AI requests.' }, 429);
    }

    // Parse body - Appwrite sends it as string
    let payload;
    try {
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      error(`Body parse error: ${parseError.message}`);
      return res.json({ error: 'Invalid JSON in request body' }, 400);
    }

    const { prompt, schema, model = 'gemini-2.5-flash-lite' } = payload;

    if (!prompt) {
      return res.json({ error: 'Prompt is required' }, 400);
    }

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      error('GEMINI_KEY not configured');
      return res.json({ error: 'Server configuration error' }, 500);
    }

    log(`Calling Gemini API with model: ${model}`);

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    if (schema) {
      requestBody.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: schema
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      error(`Gemini API error: ${response.status} - ${errorData}`);
      return res.json({ error: 'Gemini API request failed', details: errorData }, response.status);
    }

    const data = await response.json();
    log('Gemini API call successful');

    // Increment usage counter
    try {
      const usage = await databases.getDocument(dbId, collectionId, 'single_user');
      await databases.updateDocument(dbId, collectionId, 'single_user', {
        used: usage.used + 1
      });
      log(`Usage incremented: ${usage.used + 1}/${usage.limit}`);
    } catch (e) {
      error(`Failed to update usage: ${e.message}`);
    }

    return res.json(data);
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
