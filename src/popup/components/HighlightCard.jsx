import React, { useState } from 'react';
import { deleteHighlight } from '../../utils/storage';

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function HighlightCard({ highlight, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setDeleting(true);
    await deleteHighlight(highlight.id, highlight.url);

    // Notify content script to remove the highlight from the page
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'HIGHLIGHT_DELETED',
          highlightId: highlight.id,
        });
      }
    } catch {
      // Tab might not be accessible
    }

    onDelete(highlight.id);
  };

  return (
    <div className={`highlight-card ${deleting ? 'deleting' : ''}`}>
      <div className="card-content">
        <p className="card-text">"{highlight.text}"</p>
        <span className="card-time">{timeAgo(highlight.timestamp)}</span>
      </div>
      <button
        className={`card-delete-btn ${confirming ? 'confirming' : ''}`}
        onClick={handleDelete}
        title={confirming ? 'Click again to confirm' : 'Delete highlight'}
      >
        {confirming ? '✓' : '🗑️'}
      </button>
    </div>
  );
}
