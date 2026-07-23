import React from 'react';
import { Play, Star, Flame, Award, ShieldCheck, Layers, Sparkles } from 'lucide-react';

export const HeroBanner = ({ featuredGame, onPlayGame, totalGames }) => {
  if (!featuredGame) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl frost-glass border border-sky-500/30 shadow-2xl p-6 sm:p-8 my-6">
      {/* Background Decorative Radiant Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Game Details */}
        <div className="lg:col-span-7 space-y-4 text-sky-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Tundra Game
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              {featuredGame.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {featuredGame.rating} Rating
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow">
            {featuredGame.title}
          </h1>

          <p className="text-sm sm:text-base text-sky-200/90 leading-relaxed max-w-2xl">
            {featuredGame.description}
          </p>

          {/* Key tags & statistics */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-sky-300 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-sky-500/30">
              <Award className="w-4 h-4 text-sky-400" />
              <span>{featuredGame.plays} Total Plays</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-sky-500/30">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>100% Unblocked Iframe</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-sky-500/30">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{totalGames} Games in JSON Catalog</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onPlayGame(featuredGame)}
              className="frost-button px-7 py-3 rounded-2xl text-sm font-bold flex items-center gap-2.5 group shadow-xl hover:shadow-sky-400/40"
            >
              <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              Play Now (Iframe)
            </button>
          </div>
        </div>

        {/* Thumbnail Preview Card */}
        <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => onPlayGame(featuredGame)}>
          <div className="relative overflow-hidden rounded-2xl border-2 border-sky-400/40 shadow-2xl bg-slate-900 aspect-video lg:aspect-[4/3]">
            <img
              src={featuredGame.thumbnail}
              alt={featuredGame.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-white/20">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold drop-shadow flex justify-between items-center">
              <span>Click to Launch Game</span>
              <span className="bg-sky-500/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                Iframe Player
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
