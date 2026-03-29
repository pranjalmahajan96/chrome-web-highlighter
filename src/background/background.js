/* ── Background Service Worker ─────────────────────────────── */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handlers = {
    SAVE_HIGHLIGHT: () => saveHighlight(message.payload),
    GET_HIGHLIGHTS: () => getHighlightsForUrl(message.payload.url),
    GET_ALL_HIGHLIGHTS: () => getAllHighlights(),
    DELETE_HIGHLIGHT: () => deleteHighlight(message.payload),
  };

  const handler = handlers[message.type];
  if (handler) {
    handler().then(sendResponse);
    return true; // keep message channel open for async response
  }
});

async function saveHighlight({ text, url, title, rangeInfo }) {
  const { highlights = {} } = await chrome.storage.local.get('highlights');
  const id = `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const highlight = {
    id,
    text,
    url,
    title,
    timestamp: Date.now(),
    rangeInfo,
  };

  if (!highlights[url]) highlights[url] = [];
  highlights[url].push(highlight);

  await chrome.storage.local.set({ highlights });
  return { success: true, highlight };
}

async function getHighlightsForUrl(url) {
  const { highlights = {} } = await chrome.storage.local.get('highlights');
  return { highlights: highlights[url] || [] };
}

async function getAllHighlights() {
  const { highlights = {} } = await chrome.storage.local.get('highlights');

  const all = Object.values(highlights)
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp);

  return { highlights: all };
}

async function deleteHighlight({ id, url }) {
  const { highlights = {} } = await chrome.storage.local.get('highlights');

  if (highlights[url]) {
    highlights[url] = highlights[url].filter((h) => h.id !== id);
    if (highlights[url].length === 0) delete highlights[url];
    await chrome.storage.local.set({ highlights });
  }

  return { success: true };
}
