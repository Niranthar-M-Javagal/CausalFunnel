import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Small dot for the timeline
function TimelineDot({ type }) {
  return (
    <span className={`absolute -left-[25px] top-2 w-3 h-3 rounded-full ring-2 ring-zinc-900 ${
      type === 'click' ? 'bg-violet-500' : 'bg-emerald-500'
    }`} />
  );
}

export default function SessionDetails({ sessionId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) { setEvents([]); return; }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/events`);
        const json = await res.json();
        setEvents(json.data || []);
      } catch (err) {
        console.error('Failed to fetch timeline:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800 text-zinc-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        <p className="text-sm">Select a session to see its timeline</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 min-h-[400px] space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white">Session timeline</h3>
        <p className="text-[11px] text-zinc-600 font-mono mt-1 truncate">{sessionId}</p>
      </div>

      {loading && (
        <div className="py-12 text-center text-sm text-zinc-600 animate-pulse">
          Fetching events…
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="py-12 text-center text-sm text-zinc-600">
          No events for this session.
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="relative border-l border-zinc-700 ml-3 pl-6 space-y-4">
          {events.map((event, i) => (
            <div key={event._id || i} className="relative">
              <TimelineDot type={event.eventType} />

              <div className="bg-zinc-800/60 rounded-xl px-4 py-3 border border-zinc-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    event.eventType === 'click'
                      ? 'bg-violet-900/60 text-violet-400'
                      : 'bg-emerald-900/60 text-emerald-400'
                  }`}>
                    {event.eventType === 'click' ? 'click' : 'page view'}
                  </span>
                  <p className="text-sm text-zinc-200 font-medium">{event.pageUrl}</p>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="block text-xs text-zinc-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  {event.eventType === 'click' && (
                    <span className="inline-block text-[11px] font-mono bg-zinc-700 rounded px-2 py-0.5 text-zinc-400">
                      {event.x}, {event.y}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}