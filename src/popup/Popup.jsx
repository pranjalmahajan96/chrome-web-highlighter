import React, { useState, useEffect } from 'react';
import HighlightList from './components/HighlightList';
import SummaryPanel from './components/SummaryPanel';
import SettingsPanel from './components/SettingsPanel';
import { getAllHighlights } from '../utils/storage';

export default function Popup() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('highlights');
  const [showSettings, setShowSettings] = useState(false);

  const fetchHighlights = async () => {
    setLoading(true);
    const { highlights: data } = await getAllHighlights();
    setHighlights(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleDelete = (id) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="popup-header">
        <div className="header-left">
          <div className="logo-icon">✨</div>
          <div>
            <h1 className="header-title">Web Highlighter</h1>
            <p className="header-subtitle">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
        <button
          className={`settings-btn ${showSettings ? 'active' : ''}`}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel />}

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          📝 Highlights
        </button>
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          🤖 AI Summary
        </button>
      </nav>

      {/* Content */}
      <main className="popup-content">
        {activeTab === 'highlights' ? (
          <HighlightList
            highlights={highlights}
            loading={loading}
            onDelete={handleDelete}
          />
        ) : (
          <SummaryPanel highlights={highlights} />
        )}
      </main>
    </div>
  );
}
