import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const PAGE_OPTIONS = ['/demo'];

// Each click renders as a radial blob on a dark canvas.
// Colors shift from orange-core → yellow → transparent, like a real thermal map.
function HeatBlob({ point }) {
  const left = point.viewportWidth > 0 ? (point.x / point.viewportWidth) * 100 : 50;
  const top  = point.viewportHeight > 0 ? (point.y / point.viewportHeight) * 100 : 50;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: 64,
        height: 64,
        background: 'radial-gradient(circle, rgba(251,146,60,0.85) 0%, rgba(234,179,8,0.5) 35%, rgba(239,68,68,0.15) 65%, transparent 100%)',
        mixBlendMode: 'screen',
      }}
      title={`X: ${point.x}, Y: ${point.y}`}
    />
  );
}

export default function HeatmapView() {
  const [selectedUrl, setSelectedUrl] = useState('/demo');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/heatmap?pageUrl=${encodeURIComponent(selectedUrl)}`);
        const json = await res.json();
        setPoints(json.data || []);
      } catch (err) {
        console.error('Heatmap fetch failed:', err);
        setPoints([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedUrl]);

  return (
    <div className="space-y-5">

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">Click heatmap</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Warmer = more clicks</p>
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
            Page
          </label>
          <select
            value={selectedUrl}
            onChange={e => setSelectedUrl(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          >
            {PAGE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Canvas */}
      {loading ? (
        <div className="h-[520px] flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800">
          <span className="text-sm text-zinc-500 animate-pulse">Loading…</span>
        </div>
      ) : (
        <div className="relative w-full h-[520px] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

          {/* Subtle grid lines to give the canvas depth */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Faint page skeleton so you know where things are */}
          <div className="absolute top-5 left-5 right-5 h-8 rounded-lg bg-zinc-800/60 flex items-center px-4 gap-3">
            <div className="w-4 h-4 rounded bg-violet-900/60" />
            <div className="h-2 w-24 rounded-full bg-zinc-700/50" />
            <div className="ml-auto h-2 w-16 rounded-full bg-zinc-700/50" />
          </div>
          <div className="absolute top-20 left-5 right-5 bottom-5 rounded-xl bg-zinc-800/30 border border-zinc-700/20 grid grid-cols-2 gap-4 p-5">
            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded-full bg-zinc-700/40" />
              <div className="h-3 w-1/2 rounded-full bg-zinc-700/30" />
              <div className="h-3 w-2/3 rounded-full bg-zinc-700/25" />
              <div className="mt-5 flex gap-2">
                <div className="h-8 w-20 rounded-lg bg-violet-900/40 border border-violet-800/30" />
                <div className="h-8 w-16 rounded-lg bg-zinc-700/40" />
              </div>
            </div>
            <div className="rounded-lg bg-zinc-700/30 flex items-center justify-center">
              <span className="text-xs text-zinc-600">product image</span>
            </div>
          </div>

          {/* Empty state */}
          {points.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-sm">No clicks recorded yet — try the demo page</p>
            </div>
          )}

          {/* The actual heat blobs */}
          {points.map((point, i) => <HeatBlob key={i} point={point} />)}

          {/* Corner stat */}
          <div className="absolute bottom-4 right-4 bg-zinc-800/90 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            {points.length} click{points.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}