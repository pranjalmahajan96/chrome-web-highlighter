import React from 'react';

export default function SavePopup({ position, onSave, onClose }) {
  return (
    <div
      className="wh-save-popup"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
      }}
    >
      <button className="wh-save-btn" onClick={onSave}>
        <span className="wh-save-icon">💾</span>
        Save Highlight
      </button>
      <button className="wh-close-btn" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
