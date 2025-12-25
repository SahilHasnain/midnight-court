/**
 * Citation API - Proxy via Appwrite Functions
 */
import { Alert } from "react-native";

const callCitationFunction = async (payload) => {
  const url = process.env.EXPO_PUBLIC_CITATION_FUNCTION_URL;
  if (!url) {
    throw new Error(
      "Citation function URL not configured (EXPO_PUBLIC_CITATION_FUNCTION_URL)"
    );
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch (_e) {
      bodyText = "";
    }

    // Try to parse as JSON for specific error handling
    try {
      const errorData = JSON.parse(bodyText);
      if (errorData.error === "AI_LIMIT_EXCEEDED") {
        Alert.alert(
          "Usage Limit Reached",
          errorData.message || "You have reached your AI usage limit."
        );
        throw new Error("AI_LIMIT_EXCEEDED");
      }
    } catch (_e) {
      // Not JSON, continue with generic error
    }

    throw new Error(
      `Citation function failed: ${response.status}${
        bodyText ? ` - ${bodyText}` : ""
      }`
    );
  }

  // Handle both Appwrite execution wrapper and direct JSON response
  let parsed;
  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType.includes("application/json")) {
    parsed = await response.json();
  } else {
    const text = await response.text();
    try {
      parsed = JSON.parse(text);
    } catch (_err) {
      throw new Error(
        `Invalid JSON from citation function: ${
          text?.slice(0, 200) || "(empty)"
        }`
      );
    }
  }

  // If this is an Appwrite execution wrapper
  if (
    parsed &&
    typeof parsed === "object" &&
    "status" in parsed &&
    ("responseBody" in parsed || "stderr" in parsed)
  ) {
    if (parsed.status === "failed") {
      throw new Error(
        `Function execution failed: ${parsed.stderr || "unknown error"}`
      );
    }
    const body = parsed.responseBody;
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch (_err) {
        throw new Error(`Invalid responseBody JSON: ${body.slice(0, 200)}`);
      }
    }
    return body;
  }

  // Direct JSON response from proxy
  if (parsed && parsed.error) {
    if (parsed.error === "AI_LIMIT_EXCEEDED") {
      Alert.alert(
        "Usage Limit Reached",
        parsed.message || "You have reached your AI usage limit."
      );
      throw new Error("AI_LIMIT_EXCEEDED");
    }
    throw new Error(
      `Citation proxy error: ${parsed.error}${
        parsed.details ? ` - ${parsed.details}` : ""
      }`
    );
  }

  return parsed;
};

/**
 * Find legal citations using Gemini AI via Appwrite
 */
export const findCitations = async (query) => {
  if (!query || query.trim().length < 2) {
    return {
      query,
      citations: [],
      totalFound: 0,
      searchTime: "0ms",
    };
  }

  console.log("🤖 Citation search:", query);
  const startTime = Date.now();

  try {
    const response = await callCitationFunction({
      query,
      action: "search",
    });

    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from citation search");
    }

    const result = JSON.parse(response.candidates[0].content.parts[0].text);

    // Filter valid citations
    const validCitations = result.citations.filter(
      (citation) =>
        citation.name &&
        citation.fullTitle &&
        citation.summary &&
        typeof citation.relevance === "number"
    );

    const searchTime = `${Date.now() - startTime}ms`;

    console.log(`✅ Found ${validCitations.length} citations in ${searchTime}`);

    return {
      query: result.query || query,
      citations: validCitations,
      totalFound: validCitations.length,
      searchTime,
    };
  } catch (error) {
    console.error("❌ Citation search failed:", error);
    throw error;
  }
};

/**
 * Get detailed information about a specific citation
 */
export const getCitationDetails = async (citationName) => {
  console.log("🤖 Fetching citation details:", citationName);

  try {
    const response = await callCitationFunction({
      query: citationName,
      action: "details",
    });

    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response");
    }

    const result = JSON.parse(response.candidates[0].content.parts[0].text);
    console.log("✅ Citation details retrieved");
    return result;
  } catch (error) {
    console.error("❌ Failed to get citation details:", error);
    throw error;
  }
};

/**
 * Verify if a citation is accurate
 */
export const verifyCitation = async (citation) => {
  console.log("🔍 Verifying citation:", citation);
  return getCitationDetails(citation);
};

/**
 * Get related citations
 */
export const getRelatedCitations = async (citation) => {
  console.log("🔗 Finding related citations:", citation);
  return findCitations(`related citations for ${citation}`);
};

/**
 * Search citations by topic
 */
export const searchByTopic = async (topic) => {
  console.log("📚 Searching by topic:", topic);
  return findCitations(topic);
};
