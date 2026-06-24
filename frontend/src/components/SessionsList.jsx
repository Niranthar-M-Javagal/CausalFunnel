import React from 'react';

export default function SessionsList({ sessions, activeSessionId, onSelectSession, loading }) {
  const formatTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDuration = (start, end) => {
    const secs = Math.max(1, Math.floor((new Date(end) - new Date(start)) / 1000));
    return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-white">Sessions</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Click one to inspect its timeline</p>
      </div>

      <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
        {loading && (
          <div className="p-10 text-center text-sm text-zinc-600 animate-pulse">
            Loading sessions…
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="p-10 text-center text-sm text-zinc-600">
            No sessions yet. Head to <span className="text-violet-400">/demo</span> to start recording.
          </div>
        )}

        {!loading && sessions.map(session => {
          const isActive = session.sessionId === activeSessionId;
          return (
            <button
              key={session.sessionId}
              onClick={() => onSelectSession(session.sessionId)}
              className={`w-full text-left px-5 py-4 flex flex-col gap-2 transition-colors border-l-2 ${
                isActive
                  ? 'bg-violet-950/50 border-l-violet-500'
                  : 'hover:bg-zinc-800/50 border-l-transparent'
              }`}
            >
              {/* Session ID + duration */}
              <div className="flex justify-between items-center gap-2">
                <span className="font-mono text-xs text-zinc-400 truncate max-w-[160px]">
                  {session.sessionId}
                </span>
                <span className="shrink-0 text-[11px] px-2 py-0.5 bg-zinc-800 rounded-md text-zinc-400 font-medium">
                  {formatDuration(session.startedAt, session.endedAt)}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 text-xs">
                <span className="text-zinc-500">
                  <span className="text-zinc-200 font-semibold">{session.totalEvents}</span> events
                </span>
                <span className="text-zinc-500">
                  <span className="text-zinc-200 font-semibold">{session.pageViews}</span> views
                </span>
                <span className="text-zinc-500">
                  <span className="text-violet-400 font-semibold">{session.clicks}</span> clicks
                </span>
              </div>

              <div className="text-[11px] text-zinc-600">Started {formatTime(session.startedAt)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}