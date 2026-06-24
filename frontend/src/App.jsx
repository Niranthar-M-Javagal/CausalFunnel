import React, { useState } from 'react';
import DemoPage from './views/DemoPage';
import Dashboard from './views/Dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('demo');

  return (
    <div className="relative min-h-screen">
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 flex justify-center gap-4 text-xs font-mono z-50 relative">
        <span className="text-slate-500 self-center">MODE:</span>

        <button
          onClick={() => setCurrentView('demo')}
          className={`px-3 py-1 rounded transition ${
            currentView === 'demo'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Demo Page
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={`px-3 py-1 rounded transition ${
            currentView === 'dashboard'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </div>

      {currentView === 'demo' ? <DemoPage /> : <Dashboard />}
    </div>
  );
}