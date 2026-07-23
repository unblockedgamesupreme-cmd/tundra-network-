import React from 'react';
import { GameCard } from './GameCard.jsx';
import {
  Gamepad2,
  Bookmark,
  ArrowUpDown,
  SearchX,
  PlusCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Favorites',
  'Action',
  'Arcade',
  'Puzzle',
  'Sports',
  'Racing',
  'Skill',
  'Strategy',
  'Retro',
];

export const GameGrid = ({
  games,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onChangeSort,
  favorites,
  onToggleFavorite,
  onSelectGame,
  onOpenAddModal,
  searchQuery,
}) => {
  return (
    <section className="space-y-6 my-6">
      {/* Category Pills Bar & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        {/* Scrollable Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none py-1">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count =
              category === 'All'
                ? games.length
                : category === 'Favorites'
                ? favorites.length
                : games.filter((g) => g.category === category).length;

            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'frost-pill-active'
                    : 'frost-pill hover:bg-slate-800 hover:text-sky-200'
                }`}
              >
                {category === 'Favorites' && (
                  <Bookmark className={`w-3.5 h-3.5 ${isActive ? 'fill-white' : 'text-amber-400'}`} />
                )}
                {category === 'All' && <Gamepad2 className="w-3.5 h-3.5" />}
                <span>{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-sky-500/20 text-sky-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center justify-between md:justify-end space-x-2 shrink-0">
          <div className="flex items-center space-x-1 text-xs font-semibold text-sky-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onChangeSort(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-sky-500/30 rounded-xl text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="popular" className="bg-slate-900 text-sky-100">Most Popular</option>
            <option value="rating" className="bg-slate-900 text-sky-100">Highest Rated</option>
            <option value="alphabetical" className="bg-slate-900 text-sky-100">A - Z</option>
            <option value="newest" className="bg-slate-900 text-sky-100">Newest Added</option>
          </select>
        </div>
      </div>

      {/* Grid of Games */}
      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectGame={onSelectGame}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="frost-glass rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 my-8 border border-sky-500/30">
          <div className="w-16 h-16 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Games Found</h3>
          <p className="text-xs text-sky-200/80 leading-relaxed">
            {searchQuery
              ? `We couldn't find any game matching "${searchQuery}". Try searching for another keyword or category.`
              : selectedCategory === 'Favorites'
              ? 'You have not added any games to your favorites yet. Click the bookmark icon on any game card to save it!'
              : 'There are currently no games in this category.'}
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onOpenAddModal}
              className="frost-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Custom Game Iframe
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
