import React from 'react';
import {
  Snowflake,
  Search,
  Bookmark,
  Shield,
  PlusCircle,
  X,
} from 'lucide-react';

export const Navbar = ({
  searchQuery,
  onSearchChange,
  favoritesCount,
  showOnlyFavorites,
  onToggleFavoritesFilter,
  onOpenAddModal,
  onTriggerPanic,
  snowEnabled,
  onToggleSnow,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full frost-glass border-b border-sky-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none shrink-0" onClick={() => onSearchChange('')}>
            <div className="relative p-2.5 bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-400 rounded-2xl shadow-lg border border-sky-300/40 text-white flex items-center justify-center">
              <Snowflake className="w-6 h-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-sans drop-shadow-sm">
                  TUNDRA<span className="text-sky-400 font-extrabold"> NETWORK</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Unblocked
                </span>
              </div>
              <p className="text-[11px] text-sky-300 font-medium hidden sm:block">
                Tundra Games Portal &bull; Iframe JSON Catalog
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search games, tags, or categories..."
                className="w-full pl-10 pr-9 py-2 text-xs font-medium bg-slate-900/90 border border-sky-500/30 rounded-2xl text-sky-100 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Tools */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Snow Effect Toggle */}
            <button
              onClick={onToggleSnow}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                snowEnabled
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
              title="Toggle Frost Snow Effect"
            >
              <Snowflake className={`w-4 h-4 ${snowEnabled ? 'text-sky-400 animate-spin-slow' : 'text-slate-500'}`} />
              <span className="hidden md:inline text-xs">
                {snowEnabled ? 'Snow ON' : 'Snow OFF'}
              </span>
            </button>

            {/* Favorites Toggle Button */}
            <button
              onClick={onToggleFavoritesFilter}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showOnlyFavorites
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-sm'
                  : 'bg-slate-900/60 text-sky-200 border-sky-500/30 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${showOnlyFavorites ? 'text-amber-400 fill-amber-400' : 'text-sky-400'}`} />
              <span className="hidden sm:inline">Favorites</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {favoritesCount}
              </span>
            </button>

            {/* Add Custom Game */}
            <button
              onClick={onOpenAddModal}
              className="px-3 py-2 rounded-xl text-xs font-bold text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 transition-all flex items-center gap-1.5"
              title="Add a custom game iframe to JSON catalog"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Add Game</span>
            </button>

            {/* Panic Mode / Classroom Mask */}
            <button
              onClick={onTriggerPanic}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Classroom Quick Hide (Press Esc)"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline text-xs">Panic (Esc)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
