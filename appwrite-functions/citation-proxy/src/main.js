export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { query, action = 'search' } = JSON.parse(req.body);

    if (!query) {
      return res.json({ error: 'Query is required' }, 400);
    }

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      error('GEMINI_KEY not configured');
      return res.json({ error: 'Server configuration error' }, 500);
    }

    log(`Citation ${action}: ${query}`);

    // Build prompt based on action
    let systemPrompt = '';
    let userPrompt = '';
    let schema = null;

    if (action === 'search') {
      systemPrompt = `You are an expert legal researcher specializing in Indian law.
Return output that exactly matches this JSON shape and keys:
{
    "query": "original user query",
    "citations": [
        {
            "type": "article" | "case" | "act" | "section",
            "name": "short name (REQUIRED, e.g., Article 21)",
            "year": "year or empty string if not applicable",
            "fullTitle": "full name or title (REQUIRED)",
            "summary": "2-3 sentence summary (REQUIRED)",
            "relevance": 0-100 (REQUIRED number),
            "url": "optional URL or empty string"
        }
    ],
    "totalFound": number,
    "searchTime": "placeholder string"
}`;

      userPrompt = `Find all relevant Indian legal citations for: "${query}"

Include:
- Constitutional articles (number + title)
- Supreme Court and High Court cases (with year)
- Acts and statutes (with relevant sections)
- Brief summaries explaining relevance

IMPORTANT: Every citation MUST have name, fullTitle, summary, and relevance.`;

      schema = {
        type: "object",
        properties: {
          query: { type: "string" },
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["article", "case", "act", "section"] },
                name: { type: "string" },
                year: { type: "string" },
                fullTitle: { type: "string" },
                summary: { type: "string" },
                relevance: { type: "number" },
                url: { type: "string" }
              },
              required: ["type", "name", "fullTitle", "summary", "relevance"]
            }
          },
          totalFound: { type: "number" },
          searchTime: { type: "string" }
        },
        required: ["query", "citations", "totalFound"]
      };
    } else if (action === 'details') {
      systemPrompt = `You are an expert legal analyst specializing in Indian law.`;
      userPrompt = `Provide comprehensive details about: "${query}"

Include full citation, year, summary, legal significance, and key principles.`;

      schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          fullTitle: { type: "string" },
          year: { type: "string" },
          summary: { type: "string" },
          significance: { type: "string" },
          keyPrinciples: { type: "array", items: { type: "string" } }
        }
      };
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      error(`Gemini API error: ${response.status} - ${errorData}`);
      return res.json({ error: 'Citation search failed', details: errorData }, response.status);
    }

    const data = await response.json();
    log('Citation search successful');
    
    return res.json(data);
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
