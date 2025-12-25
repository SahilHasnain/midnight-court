/**
 * Markdown Formatter Utility
 * Converts markdown syntax to styled text components for React Native
 * Handles legal-specific color coding:
 * - _text_ → gold color (legal concepts)
 * - ~text~ → red color (violations)
 * - _text_ → blue color (statutes)
 */

import { colors } from "@/theme/colors";
import { Text } from "react-native";

/**
 * Parse markdown text and return an array of text segments with styling
 * @param {string} text - Text with markdown formatting
 * @returns {Array<{text: string, style: object}>} Array of text segments with styles
 */
export function parseMarkdown(text) {
  if (!text || typeof text !== "string") {
    return [{ text: "", style: {} }];
  }

  const segments = [];
  let currentIndex = 0;

  // Regex patterns for markdown syntax
  // Order matters: check for _text_ (gold) before _text_ (blue)
  const patterns = [
    { regex: /_([^_]+)_/g, style: { color: colors.gold, fontWeight: "600" } }, // Gold for legal concepts
    { regex: /~([^~]+)~/g, style: { color: "#ff4444", fontWeight: "600" } }, // Red for violations
    { regex: /_([^_]+)_/g, style: { color: "#4A90E2", fontWeight: "600" } }, // Blue for statutes
  ];

  // Find all matches for all patterns
  const allMatches = [];
  patterns.forEach((pattern, patternIndex) => {
    const regex = new RegExp(pattern.regex.source, "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        style: pattern.style,
        fullMatch: match[0],
        patternIndex,
      });
    }
  });

  // Sort matches by start position
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first match)
  const nonOverlappingMatches = [];
  let lastEnd = -1;
  allMatches.forEach((match) => {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  });

  // Build segments
  nonOverlappingMatches.forEach((match) => {
    // Add plain text before this match
    if (currentIndex < match.start) {
      const plainText = text.substring(currentIndex, match.start);
      if (plainText) {
        segments.push({ text: plainText, style: {} });
      }
    }

    // Add styled text
    segments.push({ text: match.text, style: match.style });
    currentIndex = match.end;
  });

  // Add remaining plain text
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      segments.push({ text: remainingText, style: {} });
    }
  }

  // If no matches found, return the whole text as plain
  if (segments.length === 0) {
    segments.push({ text, style: {} });
  }

  return segments;
}

/**
 * Render markdown text as React Native Text components
 * @param {string} text - Text with markdown formatting
 * @param {object} baseStyle - Base style to apply to all text
 * @returns {React.Element} Text component with nested styled text
 */
export function renderMarkdownText(text, baseStyle = {}) {
  const segments = parseMarkdown(text);

  return (
    <Text style={baseStyle}>
      {segments.map((segment, index) => (
        <Text key={index} style={segment.style}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

/**
 * Format an array of text points with markdown
 * @param {Array<string>} points - Array of text points
 * @param {object} baseStyle - Base style for each point
 * @returns {Array<React.Element>} Array of formatted text components
 */
export function formatMarkdownPoints(points, baseStyle = {}) {
  if (!Array.isArray(points)) {
    return [];
  }

  return points.map((point, index) => renderMarkdownText(point, baseStyle));
}

/**
 * Strip markdown formatting from text (for plain text display)
 * @param {string} text - Text with markdown formatting
 * @returns {string} Plain text without markdown
 */
export function stripMarkdown(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/_([^_]+)_/g, "$1") // Remove _text_
    .replace(/~([^~]+)~/g, "$1") // Remove ~text~
    .replace(/_([^_]+)_/g, "$1"); // Remove _text_
}

/**
 * Get color legend for markdown formatting
 * @returns {Array<{color: string, label: string, example: string}>}
 */
export function getColorLegend() {
  return [
    {
      color: colors.gold,
      label: "Legal Concepts",
      example: "_fundamental right_",
      description: "Key legal terms and concepts",
    },
    {
      color: "#ff4444",
      label: "Violations",
      example: "~breach of contract~",
      description: "Legal violations or issues",
    },
    {
      color: "#4A90E2",
      label: "Statutes",
      example: "_Article 21_",
      description: "Legal provisions and statutes",
    },
  ];
}

export const markdownFormatter = {
  parseMarkdown,
  renderMarkdownText,
  formatMarkdownPoints,
  stripMarkdown,
  getColorLegend,
};
