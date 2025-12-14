import React from "react";

/**
 * Parse markdown-style bold formatting (**text**) and convert to React elements
 * Handles **bold text** patterns and converts them to <strong> tags
 */
export function parseMarkdownBold(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^\*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the bold text
    parts.push(
      React.createElement("strong", { key: `bold-${match.index}` }, match[1]),
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no matches were found, return original text
  return parts.length === 0 ? text : parts;
}
