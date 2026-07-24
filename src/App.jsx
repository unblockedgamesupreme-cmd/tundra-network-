import React, { useState, useEffect, useMemo } from 'react';
import { initialGamesData } from './data/gamesData.js';
import { Navbar } from './components/Navbar.jsx';
import { HeroBanner } from './components/HeroBanner.jsx';
import { GameGrid } from './components/GameGrid.jsx';
import { GamePlayerModal } from './components/GamePlayerModal.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { PanicScreen } from './components/PanicScreen.jsx';
import { Snowfall } from './components/Snowfall.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { UltravioletProxy } from './components/UltravioletProxy.jsx';
import { Snowflake, Shield, Sparkles, Gamepad2, Zap } from 'lucide-react';

const getInitialGames = () => {
  let catalog = Array.isArray(initialGamesData) ? initialGamesData : [];
  try {
    const savedCustom = localStorage.getItem('frost_custom_games');
    const customGames = savedCustom ? JSON.parse(savedCustom) : [];
    if (Array.isArray(customGames) && customGames.length > 0) {
      return [...catalog, ...customGames];
    }
  } catch (e) {
    console.error('Error loading custom games from storage:', e);
  }
  return catalog;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('games'); // 'games' | 'proxy'
  const [games, setGames] = useState(getInitialGames);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavs = localStorage.getItem('frost_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);

  // Optional extra catalog sync from public/games.json if available
  useEffect(() => {
    const syncCatalog = async () => {
      try {
        const response = await fetch('./games.json');
        if (response.ok) {
          const jsonGames = await response.json();
          if (Array.isArray(jsonGames) && jsonGames.length > 0) {
            setGames((prev) => {
              const customOnly = prev.filter((g) => g.isCustom);
              return [...jsonGames, ...customOnly];
            });
          }
        }
      } catch (err) {
        // Silently keep imported catalog if fetch is not available in static host
      }
    };

    syncCatalog();
  }, []);

  // Save favorites to localStorage
  const handleToggleFavorite = (e, gameId) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const nextFavs = prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      localStorage.setItem('frost_favorites', JSON.stringify(nextFavs));
      return nextFavs;
    });
  };

  // Add custom game handler
  const handleAddCustomGame = (newGame) => {
    setGames((prev) => {
      const updated = [newGame, ...prev];
      const customOnly = updated.filter((g) => g.isCustom);
      localStorage.setItem('frost_custom_games', JSON.stringify(customOnly));
      return updated;
    });
    setSelectedGame(newGame);
  };

  // Keyboard shortcut listener for ESC key (Panic mode toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPanicActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Featured game for spotlight banner
  const featuredGame = useMemo(() => {
    return games.find((g) => g.featured) || games[0] || null;
  }, [games]);

  // Filtered & Sorted games
  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g?.title?.toLowerCase().includes(q) ||
          g?.category?.toLowerCase().includes(q) ||
          g?.description?.toLowerCase().includes(q) ||
          (Array.isArray(g?.tags) && g.tags.some((t) => t?.toLowerCase().includes(q)))
      );
    }

    // Filter by Category
    if (selectedCategory === 'Favorites') {
      result = result.filter((g) => favorites.includes(g.id));
    } else if (selectedCategory !== 'All') {
      result = result.filter((g) => g.category === selectedCategory);
    }

    // Sort options
    result.sort((a, b) => {
      if (sortBy === 'popular') return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortBy === 'newest') return (b.isCustom ? 1 : 0) - (a.isCustom ? 1 : 0);
      return 0;
    });

    return result;
  }, [games, searchQuery, selectedCategory, sortBy, favorites]);

  // Panic screen view override
  if (isPanicActive) {
    return <PanicScreen onExit={() => setIsPanicActive(false)} />;
  }

  return (
    <div className="min-h-screen frost-bg text-sky-100 flex flex-col font-sans relative selection:bg-sky-500 selection:text-white">
      {/* Background Falling Snowflakes FX */}
      <Snowfall enabled={snowEnabled} />

      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.length}
        showOnlyFavorites={selectedCategory === 'Favorites'}
        onToggleFavoritesFilter={() => {
          if (activeTab !== 'games') setActiveTab('games');
          setSelectedCategory((prev) => (prev === 'Favorites' ? 'All' : 'Favorites'));
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onTriggerPanic={() => setIsPanicActive(true)}
        snowEnabled={snowEnabled}
        onToggleSnow={() => setSnowEnabled((prev) => !prev)}
      />

      {/* Main Container with Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full relative z-10">
        {/* Left Navigation Sidebar Bar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeTab === 'games' ? (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
              {/* Featured Banner (only show when not actively searching) */}
              {!searchQuery && selectedCategory === 'All' && (
                <HeroBanner
                  featuredGame={featuredGame}
                  onPlayGame={setSelectedGame}
                  totalGames={games.length}
                />
              )}

              {/* Main Game Catalog Grid */}
              <GameGrid
                games={filteredAndSortedGames}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                sortBy={sortBy}
                onChangeSort={setSortBy}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectGame={setSelectedGame}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                searchQuery={searchQuery}
              />
            </main>
          ) : (
            <main className="flex-1 w-full mx-auto relative z-10">
              <UltravioletProxy />
            </main>
          )}

          {/* Footer */}
          <footer className="frost-glass border-t border-sky-500/20 mt-12 py-8 relative z-10 text-xs text-sky-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Snowflake className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sky-100">Tundra Network</span>
                <span>&bull; Game Portal & Ultraviolet Proxy</span>
              </div>

              <div className="flex items-center space-x-4 text-sky-300">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  School-Friendly
                </span>
                <span className="flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                  {games.length} Unblocked Games
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Ultraviolet TN Engine
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Active Game Iframe Modal */}
      <GamePlayerModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        isFavorite={selectedGame ? favorites.includes(selectedGame.id) : false}
        onToggleFavorite={handleToggleFavorite}
        allGames={games}
        onSelectGame={setSelectedGame}
      />

      {/* Add Custom Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddCustomGame}
      />
    </div>
  );
}

