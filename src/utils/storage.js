/* ── Storage utility wrappers ─────────────────────────────── */

export function sendMessage(type, payload = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, resolve);
  });
}

export const saveHighlight = (data) => sendMessage('SAVE_HIGHLIGHT', data);
export const getHighlights = (url) => sendMessage('GET_HIGHLIGHTS', { url });
export const getAllHighlights = () => sendMessage('GET_ALL_HIGHLIGHTS');
export const deleteHighlight = (id, url) => sendMessage('DELETE_HIGHLIGHT', { id, url });

export async function getApiKey() {
  const { openaiKey = '' } = await chrome.storage.local.get('openaiKey');
  return openaiKey;
}

export async function setApiKey(key) {
  await chrome.storage.local.set({ openaiKey: key });
}
