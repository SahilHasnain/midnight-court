import { Client, Databases } from "node-appwrite";
import OpenAI from "openai";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID;
const collectionId = "ai_usage";

// Daily limit per service
const DAILY_LIMIT = 10;

/**
 * Get today's usage document ID in format: daily_YYYY-MM-DD
 */
const getTodayUsageDocId = () => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const day = String(today.getUTCDate()).padStart(2, "0");
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
          date: docId.replace("daily_", ""),
        });
      } catch (createError) {
        throw new Error(`Failed to create daily usage: ${createError.message}`);
      }
    }
    throw e;
  }
};

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  try {
    // Get today's usage document ID
    const todayDocId = getTodayUsageDocId();

    // Check daily usage limits
    let usage;
    try {
      usage = await getDailyUsage(
        databases,
        dbId,
        collectionId,
        todayDocId,
        log
      );
    } catch (e) {
      error(`Failed to get daily usage: ${e.message}`);
      return res.json({ error: "Usage tracking error" }, 500);
    }

    if (usage.used >= usage.limit) {
      return res.json(
        {
          error: "AI_LIMIT_EXCEEDED",
          message: `Daily AI usage limit reached. You have used all ${usage.limit} requests today. Resets at midnight UTC.`,
        },
        429
      );
    }

    // Parse request body
    let payload;
    try {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      error(`Body parse error: ${parseError.message}`);
      return res.json({ error: "Invalid JSON in request body" }, 400);
    }

    const {
      prompt,
      systemPrompt = "",
      schema,
      schemaName = "response",
      model = "gpt-4o-mini",
      temperature = 0.7,
      maxTokens = 4096,
      useStructuredOutput = false,
    } = payload;

    if (!prompt) {
      return res.json({ error: "Prompt is required" }, 400);
    }

    // Initialize OpenAI client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      error("OPENAI_API_KEY not configured");
      return res.json({ error: "Server configuration error" }, 500);
    }

    const openai = new OpenAI({ apiKey });

    log(`Calling OpenAI Chat API with model: ${model}`);

    // Build messages array
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    // Call OpenAI Chat Completions API
    let data;
    try {
      const requestConfig = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      // Add structured output if requested
      if (useStructuredOutput && schema) {
        requestConfig.response_format = {
          type: "json_schema",
          json_schema: {
            name: schemaName,
            strict: true,
            schema: schema,
          },
        };
      }

      const completion = await openai.chat.completions.create(requestConfig);

      log("OpenAI Chat API call successful");

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("OpenAI response missing content");
      }

      // Parse if structured output was requested
      let parsed = null;
      if (useStructuredOutput && schema) {
        try {
          parsed = JSON.parse(content);
        } catch (err) {
          error(`Failed to parse structured response: ${err.message}`);
          throw new Error(`Failed to parse AI response: ${err.message}`);
        }
      }

      data = {
        choices: [
          {
            message: {
              content: content,
              parsed: parsed,
            },
          },
        ],
      };
    } catch (apiError) {
      if (apiError instanceof OpenAI.APIError) {
        error(`OpenAI API error: ${apiError.status} - ${apiError.message}`);
        return res.json(
          {
            error: "OpenAI API request failed",
            details: `${apiError.status} - ${apiError.message}`,
          },
          apiError.status || 500
        );
      }
      error(`OpenAI API error: ${apiError.message}`);
      return res.json(
        {
          error: "OpenAI API request failed",
          details: apiError.message,
        },
        500
      );
    }

    // Increment daily usage counter
    try {
      const currentUsage = await databases.getDocument(
        dbId,
        collectionId,
        todayDocId
      );
      await databases.updateDocument(dbId, collectionId, todayDocId, {
        used: currentUsage.used + 1,
      });
      log(
        `Daily usage incremented: ${currentUsage.used + 1}/${
          currentUsage.limit
        } (${todayDocId})`
      );
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
