import React from 'react';
import { Play, Star, Bookmark } from 'lucide-react';

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
}) => {
  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group frost-glass frost-glass-hover rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-sky-500/20 relative"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all border border-white/20">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-sky-200 shadow-sm border border-sky-500/30 backdrop-blur-md">
            {game.category}
          </span>
        </div>

        {/* Favorite Star Button */}
        <button
          onClick={(e) => onToggleFavorite(e, game.id)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
            isFavorite
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900 hover:text-amber-400'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {game.isCustom && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white shadow">
              Custom Game
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-sky-200/70 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-sky-500/20 flex items-center justify-between text-[11px] font-medium text-sky-300">
          <div className="flex items-center space-x-1 text-amber-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating}</span>
          </div>
          <div className="text-sky-400">
            <span>{game.plays} plays</span>
          </div>
        </div>
      </div>
    </div>
  );
};
