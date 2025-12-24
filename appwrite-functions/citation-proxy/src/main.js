import { Client, Databases } from 'node-appwrite';
import OpenAI from 'openai';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID;
const collectionId = 'ai_usage';

// Daily limit per service
const DAILY_LIMIT = 10;

/**
 * Get today's usage document ID in format: daily_YYYY-MM-DD
 */
const getTodayUsageDocId = () => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, '0');
  const day = String(today.getUTCDate()).padStart(2, '0');
  return `daily_${year}-${month}-${day}`;
};

/**
 * Get or create today's usage document
 */
const getDailyUsage = async (databases, dbId, collectionId, docId, log) => {
  try {
    return await databases.getDocument(dbId, collectionId, docId);
  } catch (e) {
    // Document doesn't exist, create it
    if (e.code === 404) {
      log(`Creating new daily usage document: ${docId}`);
      try {
        return await databases.createDocument(dbId, collectionId, docId, {
          used: 0,
          limit: DAILY_LIMIT,
          date: docId.replace('daily_', '')
        });
      } catch (createError) {
        throw new Error(`Failed to create daily usage: ${createError.message}`);
      }
    }
    throw e;
  }
};

export default async ({ req, res, log, error }) => {
  if (req.method !== 'POST') {
    return res.json({ error: 'Method not allowed' }, 405);
  }

  try {
    // Get today's usage document ID
    const todayDocId = getTodayUsageDocId();

    // Check daily usage limits
    let usage;
    try {
      usage = await getDailyUsage(databases, dbId, collectionId, todayDocId, log);
    } catch (e) {
      error(`Failed to get daily usage: ${e.message}`);
      return res.json({ error: 'Usage tracking error' }, 500);
    }

    if (usage.used >= usage.limit) {
      return res.json(
        {
          error: 'AI_LIMIT_EXCEEDED',
          message: `Daily AI usage limit reached. You have used all ${usage.limit} requests today. Resets at midnight UTC.`
        },
        429
      );
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
              required: ["type", "name", "fullTitle", "summary", "relevance"],
              additionalProperties: false
            }
          },
          totalFound: { type: "number" },
          searchTime: { type: "string" }
        },
        required: ["query", "citations", "totalFound"],
        additionalProperties: false
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
        },
        additionalProperties: false
      };
    }

    // Build messages array
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }

    messages.push({
      role: "user",
      content: userPrompt
    });

    // Call OpenAI Chat Completions API with structured output
    let data;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 4000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: `citation_${action}`,
            strict: true,
            schema
          }
        }
      });

      log('Citation search successful');

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("OpenAI response missing content");
      }

      // Parse the JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (err) {
        error(`Failed to parse citation response: ${err.message}`);
        throw new Error(`Failed to parse AI response: ${err.message}`);
      }

      // Format response to match Gemini's structure for compatibility
      data = {
        candidates: [{
          content: {
            parts: [{
              text: content
            }]
          }
        }],
        output_parsed: parsedData,
        output_text: content
      };
    } catch (apiError) {
      if (apiError instanceof OpenAI.APIError) {
        error(`OpenAI API error: ${apiError.status} - ${apiError.message}`);
        return res.json({
          error: 'Citation search failed',
          details: `${apiError.status} - ${apiError.message}`
        }, apiError.status || 500);
      }
      error(`OpenAI API error: ${apiError.message}`);
      return res.json({ error: 'Citation search failed', details: apiError.message }, 500);
    }

    // Increment daily usage counter
    try {
      const currentUsage = await databases.getDocument(dbId, collectionId, todayDocId);
      await databases.updateDocument(dbId, collectionId, todayDocId, {
        used: currentUsage.used + 1
      });
      log(`Daily usage incremented: ${currentUsage.used + 1}/${currentUsage.limit} (${todayDocId})`);
    } catch (e) {
      error(`Failed to update usage: ${e.message}`);
    }

    return res.json(data);
  } catch (err) {
    error(`Exception: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
