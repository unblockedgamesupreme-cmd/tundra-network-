import React from 'react';
import { Gamepad2, Zap, Globe, Shield, Sparkles } from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-full md:w-20 md:hover:w-52 transition-all duration-300 bg-slate-950/90 border-b md:border-b-0 md:border-r border-sky-500/20 backdrop-blur-md z-30 flex md:flex-col justify-between p-2 md:py-6 md:px-3 flex-shrink-0 group">
      <div className="flex md:flex-col items-center md:items-start w-full gap-2 md:gap-6">
        {/* Network Logo Icon */}
        <div className="hidden md:flex items-center gap-3 px-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 flex-shrink-0 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
            <span className="font-extrabold text-sm text-white block leading-none">Tundra</span>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Network</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex md:flex-col items-center md:items-stretch w-full gap-2">
          {/* Game Portal Button */}
          <button
            onClick={() => onSelectTab('games')}
            className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-200 cursor-pointer w-full text-left relative ${
              activeTab === 'games'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10 font-bold'
                : 'text-sky-300/70 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
            title="Game Portal"
          >
            <div className="flex-shrink-0 flex items-center justify-center">
              <Gamepad2 className={`w-5 h-5 ${activeTab === 'games' ? 'text-sky-400 scale-110' : ''}`} />
            </div>
            <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
              <span className="text-xs font-semibold block">Game Portal</span>
            </div>
            {activeTab === 'games' && (
              <span className="hidden md:block absolute right-2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
            )}
          </button>

          {/* Ultraviolet Proxy Button */}
          <button
            onClick={() => onSelectTab('proxy')}
            className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-200 cursor-pointer w-full text-left relative ${
              activeTab === 'proxy'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10 font-bold'
                : 'text-sky-300/70 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
            title="Ultraviolet Proxy"
          >
            <div className="flex-shrink-0 flex items-center justify-center">
              <Zap className={`w-5 h-5 ${activeTab === 'proxy' ? 'text-purple-400 scale-110 animate-pulse' : ''}`} />
            </div>
            <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 overflow-hidden whitespace-nowrap">
              <span className="text-xs font-semibold block">Ultraviolet Proxy</span>
            </div>
            {activeTab === 'proxy' && (
              <span className="hidden md:block absolute right-2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Footer Status Badge inside Sidebar */}
      <div className="hidden md:flex items-center gap-2 px-2 pt-4 border-t border-sky-500/10 text-[10px] text-sky-400/80">
        <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">
          Protected &bull; v2.4
        </span>
      </div>
    </aside>
  );
};
