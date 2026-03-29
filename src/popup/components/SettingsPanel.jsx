import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '../../utils/storage';

export default function SettingsPanel() {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => setKey(k || ''));
  }, []);

  const handleSave = async () => {
    await setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-panel">
      <label className="settings-label">
        OpenAI API Key
        <div className="settings-input-row">
          <input
            type="password"
            className="settings-input"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
          />
          <button className="settings-save-btn" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
        <span className="settings-hint">
          Your key is stored locally and never shared.
        </span>
      </label>
    </div>
  );
}
