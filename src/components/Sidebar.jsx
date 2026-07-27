import React from 'react';
import { Gamepad2, Zap, Home, Shield, Sparkles } from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[95vw]">
      <aside className="flex items-center gap-2 sm:gap-3 px-3.5 py-2 rounded-full bg-slate-950/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl shadow-sky-500/25 ring-1 ring-white/10 transition-all duration-300 hover:border-sky-300/60">
        {/* Network Logo & Brand */}
        <div
          className="flex items-center gap-2.5 pl-1 pr-1 cursor-pointer select-none"
          onClick={() => onSelectTab('home')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 flex-shrink-0 shadow-md shadow-sky-500/30">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:block whitespace-nowrap font-funnel">
            <span className="font-extrabold text-[11px] text-white block leading-none">Tundra</span>
            <span className="text-[8px] text-sky-400 font-bold uppercase tracking-widest">Network</span>
          </div>
        </div>

        <div className="w-px h-5 bg-sky-500/25 hidden sm:block" />

        {/* Floating Oval Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 border-sky-300 shadow-md shadow-sky-500/20'
                : 'text-sky-300/70 hover:text-white hover:bg-slate-900/80 border-transparent'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-slate-950 scale-105' : ''}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('games')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border ${
              activeTab === 'games'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-md shadow-sky-500/20'
                : 'text-sky-300/70 hover:text-white hover:bg-slate-900/80 border-transparent'
            }`}
          >
            <Gamepad2 className={`w-4 h-4 ${activeTab === 'games' ? 'text-sky-400 scale-105' : ''}`} />
            <span>Game Portal</span>
          </button>

          <button
            onClick={() => onSelectTab('proxy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer border ${
              activeTab === 'proxy'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/20'
                : 'text-sky-300/70 hover:text-white hover:bg-slate-900/80 border-transparent'
            }`}
          >
            <Zap className={`w-4 h-4 ${activeTab === 'proxy' ? 'text-purple-400 scale-105 animate-pulse' : ''}`} />
            <span>Proxy</span>
          </button>
        </div>

        <div className="hidden md:block w-px h-5 bg-sky-500/25" />

        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Protected</span>
        </div>
      </aside>
    </div>
  );
};
