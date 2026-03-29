import React from 'react';
import HighlightCard from './HighlightCard';

export default function HighlightList({ highlights, loading, onDelete }) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Loading highlights...</p>
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🖍️</div>
        <h3>No highlights yet</h3>
        <p>Select text on any webpage and click "Save Highlight" to get started.</p>
      </div>
    );
  }

  // Group by URL
  const grouped = highlights.reduce((acc, hl) => {
    if (!acc[hl.url]) acc[hl.url] = { title: hl.title, items: [] };
    acc[hl.url].items.push(hl);
    return acc;
  }, {});

  return (
    <div className="highlight-list">
      {Object.entries(grouped).map(([url, group]) => (
        <div key={url} className="highlight-group">
          <div className="group-header">
            <span className="group-title" title={group.title}>
              {group.title || 'Untitled Page'}
            </span>
            <a
              className="group-link"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
            >
              ↗
            </a>
          </div>
          {group.items.map((hl) => (
            <HighlightCard key={hl.id} highlight={hl} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
