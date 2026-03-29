/* ── XPath-based Range Serialization ──────────────────────── */

/**
 * Get an XPath expression for a DOM node.
 */
function getXPath(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentNode;
    const siblings = Array.from(parent.childNodes).filter(
      (n) => n.nodeType === Node.TEXT_NODE
    );
    const index = siblings.indexOf(node) + 1;
    return `${getXPath(parent)}/text()[${index}]`;
  }

  if (node === document.body) return '/html/body';
  if (node === document.documentElement) return '/html';

  const parent = node.parentNode;
  const siblings = Array.from(parent.children).filter(
    (n) => n.tagName === node.tagName
  );
  const index = siblings.indexOf(node) + 1;
  const tagName = node.tagName.toLowerCase();

  return `${getXPath(parent)}/${tagName}[${index}]`;
}

/**
 * Resolve an XPath expression to a DOM node.
 */
function resolveXPath(xpath) {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  } catch {
    return null;
  }
}

/**
 * Serialize a Range into a storable object.
 */
export function serializeRange(range) {
  return {
    startContainerXPath: getXPath(range.startContainer),
    startOffset: range.startOffset,
    endContainerXPath: getXPath(range.endContainer),
    endOffset: range.endOffset,
  };
}

/**
 * Deserialize a stored range info object back into a live DOM Range.
 */
export function deserializeRange(rangeInfo) {
  try {
    const startContainer = resolveXPath(rangeInfo.startContainerXPath);
    const endContainer = resolveXPath(rangeInfo.endContainerXPath);

    if (!startContainer || !endContainer) return null;

    const range = document.createRange();
    range.setStart(startContainer, rangeInfo.startOffset);
    range.setEnd(endContainer, rangeInfo.endOffset);
    return range;
  } catch {
    return null;
  }
}
