export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { prompt, schema, model = 'gemini-2.5-flash-lite' } = JSON.parse(req.body);

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
    
    return res.json(data);
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
