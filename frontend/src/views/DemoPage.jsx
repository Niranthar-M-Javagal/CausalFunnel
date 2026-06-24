import React, { useEffect } from 'react';
import { tracker } from '../utils/analytics';

const DEMO_PAGE_URL = '/demo';

const features = [
  'Active noise cancellation',
  '30-hour battery life',
  'Bluetooth 5.3',
  'Dual-device pairing',
];

export default function DemoPage() {
  useEffect(() => {
    tracker.trackPageView(DEMO_PAGE_URL);
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-950 px-6 py-10"
      onClick={e => tracker.trackClick(DEMO_PAGE_URL, e)}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Main product card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <span className="inline-block text-xs font-semibold text-violet-400 bg-violet-900/40 rounded-full px-3 py-1 uppercase tracking-widest">
            Demo storefront
          </span>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: product info */}
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-white tracking-tight leading-snug">
                Smart Wireless Headphones
              </h1>

              <p className="text-zinc-400 leading-relaxed text-sm">
                This page generates analytics events. Click anywhere — the buttons,
                the image area, empty space — to produce{' '}
                <code className="text-violet-400 text-xs bg-violet-900/30 px-1.5 py-0.5 rounded">page_view</code> and{' '}
                <code className="text-violet-400 text-xs bg-violet-900/30 px-1.5 py-0.5 rounded">click</code> events
                that show up in your dashboard.
              </p>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">₹7,999</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-900/30 rounded-full px-3 py-1">
                  In stock · Free shipping
                </span>
              </div>

              <ul className="space-y-2 text-sm text-zinc-400">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <button className="bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
                  Add to cart
                </button>
                <button className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
                  Buy now
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-all border border-zinc-700">
                  Apply coupon
                </button>
              </div>
            </div>

            {/* Right: image placeholder */}
            <div className="bg-zinc-800 rounded-2xl h-72 border border-zinc-700 flex items-center justify-center">
              <span className="text-sm text-zinc-600">Product image placeholder</span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-900/50 rounded-xl px-5 py-4">
          <span className="text-amber-500 shrink-0 mt-0.5 text-base">💡</span>
          <p className="text-sm text-amber-300/80 leading-relaxed">
            Click around on this page a few times, then head to the dashboard to explore
            your session timeline and heatmap.
          </p>
        </div>

      </div>
    </div>
  );
}