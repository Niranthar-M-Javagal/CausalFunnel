import React, { useEffect, useState } from 'react';
import SessionsList from '../components/SessionsList';
import SessionDetails from '../components/SessionDetails';
import HeatmapView from '../components/HeatmapView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/sessions`);
        const result = await response.json();
        const sessionData = result.data || [];

        setSessions(sessionData);

        if (sessionData.length > 0) {
          setSelectedSessionId(prev => {
            const stillExists = prev && sessionData.some(s => s.sessionId === prev);
            return stillExists ? prev : sessionData[0].sessionId;
          });
        } else {
          setSelectedSessionId(null);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-sm tracking-tighter select-none">
              CF
            </div>
            <div>
              <p className="font-semibold text-white text-base leading-none">CausalFunnel</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-none">Analytics dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-zinc-500 font-mono">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} loaded
            </span>
            <button
              onClick={() => setRefreshTrigger(n => n + 1)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs sit inside the header, below the title row */}
        <div className="max-w-7xl mx-auto px-6 flex gap-0">
          {[
            { id: 'sessions', label: 'Sessions' },
            { id: 'heatmap', label: 'Heatmap' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'sessions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
              <SessionsList
                sessions={sessions}
                activeSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-2">
              <SessionDetails sessionId={selectedSessionId} />
            </div>
          </div>
        ) : (
          <HeatmapView />
        )}
      </main>
    </div>
  );
}