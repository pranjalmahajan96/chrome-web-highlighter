import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import SavePopup from './SavePopup';
import { saveHighlight, getHighlights } from '../utils/storage';
import { serializeRange, deserializeRange } from '../utils/rangeUtils';

/* ── Highlight Rendering ───────────────────────────────────── */

function applyHighlight(range, highlightId) {
  const nodes = [];
  const iterator = document.createNodeIterator(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        return range.intersectsNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let curr;
  while ((curr = iterator.nextNode())) {
    nodes.push(curr);
  }

  nodes.forEach((node) => {
    const start = node === range.startContainer ? range.startOffset : 0;
    const end = node === range.endContainer ? range.endOffset : node.textContent.length;
    
    // Only wrap the part of the text node within the range
    if (start < end) {
      const partToWrap = node.splitText(start);
      partToWrap.splitText(end - start);
      
      const span = document.createElement('span');
      span.className = 'web-highlighter-mark';
      span.dataset.highlightId = highlightId;
      
      partToWrap.parentNode.insertBefore(span, partToWrap);
      span.appendChild(partToWrap);
    }
  });
  return true;
}

function removeHighlightFromPage(highlightId) {
  const marks = document.querySelectorAll(
    `.web-highlighter-mark[data-highlight-id="${highlightId}"]`
  );
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  });
}

/* ── Restore stored highlights on page load ────────────────── */

async function restoreHighlights() {
  const { highlights } = await getHighlights(window.location.href);
  highlights.forEach((hl) => {
    const range = deserializeRange(hl.rangeInfo);
    if (range) applyHighlight(range, hl.id);
  });
}

/* ── Content Script App ────────────────────────────────────── */

function ContentApp() {
  const [popup, setPopup] = useState(null);
  const [savedRange, setSavedRange] = useState(null);
  const [selectedText, setSelectedText] = useState('');

  const handleMouseUp = useCallback((e) => {
    // If the event comes from our shadow DOM, the target will be the host element
    if (e.target.id === 'web-highlighter-root') {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSavedRange(range.cloneRange());
      setSelectedText(text);
      setPopup({
        x: Math.min(rect.left + rect.width / 2 - 75, window.innerWidth - 180),
        y: Math.max(rect.top - 50, 10),
      });
    } else {
      setPopup(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!savedRange || !selectedText) return;

    const rangeInfo = serializeRange(savedRange);

    const result = await saveHighlight({
      text: selectedText,
      url: window.location.href,
      title: document.title,
      rangeInfo,
    });

    if (result?.success) {
      // Clear selection FIRST for a smoother visual transition
      window.getSelection().removeAllRanges();
      applyHighlight(savedRange, result.highlight.id);
    }

    setPopup(null);
    setSavedRange(null);
    setSelectedText('');
  }, [savedRange, selectedText]);

  const handleClose = useCallback(() => {
    setPopup(null);
    setSavedRange(null);
    setSelectedText('');
    // Clear selection so mouseup doesn't immediately re-trigger
    window.getSelection().removeAllRanges();
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Listen for deletion messages from popup
  useEffect(() => {
    const listener = (message) => {
      if (message.type === 'HIGHLIGHT_DELETED') {
        removeHighlightFromPage(message.highlightId);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (!popup) return null;

  return <SavePopup position={popup} onSave={handleSave} onClose={handleClose} />;
}

/* ── Mount into Shadow DOM ─────────────────────────────────── */

function init() {
  // Restore existing highlights
  restoreHighlights();

  // Create shadow DOM container for our React UI
  const host = document.createElement('div');
  host.id = 'web-highlighter-root';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0; pointer-events: none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles into shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .wh-save-popup {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(15, 15, 25, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 6px 6px 6px 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
      animation: wh-slide-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    @keyframes wh-slide-in {
      from { opacity: 0; transform: translateY(8px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .wh-save-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      letter-spacing: 0.01em;
    }

    .wh-save-btn:hover {
      background: linear-gradient(135deg, #818cf8, #a78bfa);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .wh-save-icon { font-size: 14px; }

    .wh-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.5);
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .wh-close-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.9);
    }
  `;
  shadow.appendChild(style);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<ContentApp />);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
} else {
  init();
}
