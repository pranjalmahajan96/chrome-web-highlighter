import React, { useState } from 'react';
import { getApiKey } from '../../utils/storage';

export default function SummaryPanel({ highlights }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (highlights.length === 0) {
      setError('No highlights to summarize.');
      return;
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      setError('Please add your OpenAI API key in Settings (⚙️) first.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    const highlightTexts = highlights
      .map((h, i) => `${i + 1}. "${h.text}" (from: ${h.title})`)
      .join('\n');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant. Summarize the following highlighted text snippets from web pages into a concise, well-structured summary. Group related ideas together.',
            },
            {
              role: 'user',
              content: `Please summarize these highlights:\n\n${highlightTexts}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.choices[0]?.message?.content || 'No summary generated.');
    } catch (err) {
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-panel">
      <button
        className="summarize-btn"
        onClick={handleSummarize}
        disabled={loading || highlights.length === 0}
      >
        {loading ? (
          <>
            <span className="spinner small" />
            Summarizing...
          </>
        ) : (
          <>🤖 Summarize All Highlights</>
        )}
      </button>

      {error && <div className="summary-error">{error}</div>}

      {summary && (
        <div className="summary-result">
          <h3 className="summary-heading">AI Summary</h3>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {!summary && !error && !loading && (
        <div className="summary-hint">
          <p>
            Click the button above to get an AI-generated summary of all your
            saved highlights. Requires an OpenAI API key (set in ⚙️ Settings).
          </p>
        </div>
      )}
    </div>
  );
}
