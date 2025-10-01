/**
 * Custom text-based highlighter
 * Replaces web-highlighter library with simple DOM manipulation
 */

interface HighlightOptions {
  text: string;
  id: string;
  className?: string;
  containerSelector?: string;
}

interface HighlightResult {
  success: boolean;
  element?: HTMLElement;
  error?: string;
}

/**
 * Find text in visible elements and wrap it with a highlight span
 */
export function findAndHighlightText(options: HighlightOptions): HighlightResult {
  const { text, id, className = '', containerSelector = 'body' } = options;

  // Get container to search within
  let container: Element | Document = document.body;

  if (containerSelector && containerSelector !== 'body') {
    const foundContainer = document.querySelector(containerSelector);
    if (foundContainer) {
      container = foundContainer;
    }
  }

  // Find all text nodes in visible elements
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Check if parent or any ancestor is hidden
        let element: HTMLElement | null = parent;
        while (element) {
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          // Check for hidden attribute (common in Moodle expand/collapse)
          if (element.hasAttribute('hidden')) {
            return NodeFilter.FILTER_REJECT;
          }
          // Stop at body to avoid checking too many ancestors
          if (element.tagName === 'BODY') break;
          element = element.parentElement;
        }

        // Skip if parent is already a highlight
        if (parent.hasAttribute('data-highlight-id')) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip buttons, links, scripts, styles
        const tagName = parent.tagName.toLowerCase();
        if (['button', 'a', 'script', 'style', 'noscript'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // Search for the text
  let targetText = text.trim();
  let foundNode: Text | null = null;
  let startOffset = 0;

  // Strategy 1: Try to find exact match, prioritizing summary divs over full divs
  // to ensure we highlight the initially visible text
  const prioritizeNode = (node: Text): number => {
    const parent = node.parentElement;
    if (!parent) return 999;

    // Check if in summary div (higher priority)
    const summaryParent = parent.closest('[class*="summary_"]');
    if (summaryParent) {
      const style = window.getComputedStyle(summaryParent);
      const isVisible = style.display !== 'none' && !summaryParent.hasAttribute('hidden');
      if (isVisible) return 0; // Highest priority
    }

    // Check if in full div (lower priority)
    const fullParent = parent.closest('[class*="full_"]');
    if (fullParent) {
      const style = window.getComputedStyle(fullParent);
      const isVisible = style.display !== 'none' && !fullParent.hasAttribute('hidden');
      if (isVisible) return 1; // Lower priority
    }

    return 2; // Other locations
  };

  // Sort text nodes by priority (summary visible > full visible > others)
  const sortedNodes = [...textNodes].sort((a, b) => prioritizeNode(a) - prioritizeNode(b));

  for (const textNode of sortedNodes) {
    const nodeText = textNode.textContent || '';
    const index = nodeText.indexOf(targetText);

    if (index !== -1) {
      foundNode = textNode;
      startOffset = index;
      break;
    }
  }

  // Strategy 2: Try with common prefix corrections for corrupted data
  if (!foundNode) {
    // Try single letter prefixes (use sorted nodes to prioritize visible elements)
    const prefixes = ['O', 'T', 'A', 'I', 'H', 'W', 'F', 'S', 'B', 'C', 'M', 'N', 'E', 'D', 'L', 'P', 'R'];
    for (const prefix of prefixes) {
      const correctedText = prefix + targetText;
      for (const textNode of sortedNodes) {
        const nodeText = textNode.textContent || '';
        const index = nodeText.indexOf(correctedText);
        if (index !== -1) {
          foundNode = textNode;
          startOffset = index;
          targetText = correctedText;
          break;
        }
      }
      if (foundNode) break;
    }
  }

  // Strategy 2.5: Try common word prefixes for heavily corrupted data
  if (!foundNode) {
    const wordPrefixes = ['However, ', 'Therefore, ', 'Moreover, ', 'Furthermore, ', 'Additionally, ', 'Nonetheless, ', 'Nevertheless, ', 'For example, ', 'In addition, ', 'On the other hand, '];
    for (const prefix of wordPrefixes) {
      const correctedText = prefix + targetText;
      for (const textNode of sortedNodes) {
        const nodeText = textNode.textContent || '';
        const index = nodeText.indexOf(correctedText);
        if (index !== -1) {
          foundNode = textNode;
          startOffset = index;
          targetText = correctedText;
          break;
        }
      }
      if (foundNode) break;
    }
  }

  // Strategy 3: Try fuzzy match by searching for the last 50 characters of the text
  // This helps when the beginning is corrupted but the end is intact
  if (!foundNode && targetText.length > 50) {
    const textEnd = targetText.substring(targetText.length - 50);
    for (const textNode of textNodes) {
      const nodeText = textNode.textContent || '';
      if (nodeText.includes(textEnd)) {
        // Found the end part, now find where the full text should be
        const endIndex = nodeText.indexOf(textEnd) + textEnd.length;
        const startGuess = Math.max(0, endIndex - targetText.length - 10); // Allow some buffer
        const candidate = nodeText.substring(startGuess, endIndex);

        // Check if candidate ends with our text end
        if (candidate.includes(textEnd)) {
          foundNode = textNode;
          startOffset = nodeText.indexOf(textEnd) - (targetText.length - 50);
          if (startOffset < 0) startOffset = 0;
          break;
        }
      }
    }
  }

  if (!foundNode) {
    return { success: false, error: 'Text not found in visible elements' };
  }

  // Create a range for the found text
  const range = document.createRange();
  range.setStart(foundNode, startOffset);
  range.setEnd(foundNode, startOffset + targetText.length);

  // Create highlight span
  const highlightSpan = document.createElement('span');
  highlightSpan.className = `highlight-mengshou-wrap ${className}`;
  highlightSpan.setAttribute('data-highlight-id', id);
  highlightSpan.setAttribute('data-highlight-split-type', 'none');
  highlightSpan.style.cursor = 'pointer';

  // Wrap the text
  try {
    range.surroundContents(highlightSpan);
    return { success: true, element: highlightSpan };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Remove a highlight by ID
 */
export function removeHighlight(id: string): boolean {
  const highlights = document.querySelectorAll(`[data-highlight-id="${id}"]`);

  if (highlights.length === 0) {
    return false;
  }

  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      // Move children out of the highlight span
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      // Remove the empty highlight span
      parent.removeChild(highlight);
    }
  });

  return true;
}

/**
 * Remove all highlights
 */
export function removeAllHighlights(): number {
  const highlights = document.querySelectorAll('[data-highlight-id]');
  const count = highlights.length;

  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }
  });

  return count;
}

/**
 * Check if a highlight exists
 */
export function highlightExists(id: string): boolean {
  return document.querySelector(`[data-highlight-id="${id}"]`) !== null;
}

/**
 * Get all highlight elements
 */
export function getAllHighlights(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[data-highlight-id]')) as HTMLElement[];
}
