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

    const { query, action = 'search' } = JSON.parse(req.body);

    if (!query) {
      return res.json({ error: 'Query is required' }, 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      error('OPENAI_API_KEY not configured');
      return res.json({ error: 'Server configuration error' }, 500);
    }

    const openai = new OpenAI({ apiKey });

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

    // Call OpenAI with structured output
    let data;
    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: userPrompt });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: `citation_${action}`,
            strict: true,
            schema
          }
        }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const parsedData = JSON.parse(content);

      // Format response to match Gemini's structure for compatibility
      data = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(parsedData)
            }]
          }
        }]
      };
    } catch (apiError) {
      error(`OpenAI API error: ${apiError.message}`);
      return res.json({ error: 'Citation search failed', details: apiError.message }, 500);
    }

    log('Citation search successful');

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
