import React, { useState, useEffect, useRef } from 'react';
import { BuiltInGamesEngine } from './BuiltInGamesEngine.jsx';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Bookmark,
  ThumbsUp,
  Share2,
  Gamepad2,
  Info,
  Check,
  Monitor,
  Zap,
} from 'lucide-react';

export const GamePlayerModal = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
  allGames,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [playerMode, setPlayerMode] = useState('iframe'); // 'builtin' or 'iframe'

  const containerRef = useRef(null);

  useEffect(() => {
    if (game) {
      setIsLoadingIframe(true);
      const baseLikes = Math.floor((game.title.length * 47) % 300) + 85;
      setLikes(baseLikes);
      setHasLiked(false);

      // Default to built-in interactive engine only for games with custom JS engines
      const builtinSupportedGames = ['color-puzzles', 'chroma-incident', '2048-frost', 'retro-snake', 'flappy-bird', 'slope-game'];
      if (builtinSupportedGames.includes(game.id) || game.hasBuiltInEngine) {
        setPlayerMode('builtin');
      } else {
        setPlayerMode('iframe');
      }
    }
  }, [game]);

  if (!game) return null;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleRefreshIframe = () => {
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleLikeToggle = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Find similar games in same category
  const similarGames = allGames
    .filter((g) => g.id !== game.id && (g.category === game.category || (Array.isArray(g.tags) && Array.isArray(game.tags) && g.tags.some((t) => game.tags.includes(t)))))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        ref={containerRef}
        className="w-full max-w-5xl frost-glass rounded-3xl shadow-2xl border border-sky-500/30 overflow-hidden text-sky-100 my-auto flex flex-col max-h-[95vh]"
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900/95 border-b border-sky-500/30 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-sky-500 text-white rounded-xl shadow-md shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
                {game.title}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
                  {game.category}
                </span>
              </h2>
              <p className="text-[11px] text-sky-300 hidden sm:block">Unblocked Game Portal &bull; Tundra Network</p>
            </div>
          </div>

          {/* Mode Switcher & Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-sky-500/30 text-xs font-bold">
              <button
                onClick={() => setPlayerMode('builtin')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  playerMode === 'builtin'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                HTML5 Engine
              </button>
              <button
                onClick={() => setPlayerMode('iframe')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  playerMode === 'iframe'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-sky-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Web Embed
              </button>
            </div>

            {/* Refresh iframe button */}
            {playerMode === 'iframe' && (
              <button
                onClick={handleRefreshIframe}
                className="p-2 rounded-xl text-sky-300 hover:bg-slate-800 hover:text-white transition-colors"
                title="Reload Iframe Game"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Favorite Star */}
            <button
              onClick={(e) => onToggleFavorite(e, game.id)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-sky-300 hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>

            {/* Open in new tab */}
            <a
              href={game.iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-sky-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Open direct game link in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-sky-300 hover:bg-slate-800 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-sky-200 hover:bg-slate-700 transition-colors ml-1 border border-slate-700"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Viewport Container */}
        <div className="relative bg-black aspect-video w-full flex-1 min-h-[350px] sm:min-h-[480px] overflow-hidden flex items-center justify-center">
          {playerMode === 'builtin' ? (
            <div className="w-full h-full flex items-center justify-center p-2">
              <BuiltInGamesEngine gameId={game.id} />
            </div>
          ) : (
            <>
              {isLoadingIframe && (
                <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                  <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-sky-200">Loading {game.title} Iframe...</p>
                  <p className="text-xs text-sky-400">Connecting to unblocked web host</p>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={game.iframeUrl}
                title={game.title}
                onLoad={() => setIsLoadingIframe(false)}
                className="w-full h-full border-0 rounded-none shadow-inner"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad"
                allowFullScreen
              />
            </>
          )}
        </div>

        {/* Bottom Details & Similar Games Section */}
        <div className="bg-slate-900/90 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[220px] text-sky-100 border-t border-sky-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                Game Instructions & Details
              </h3>
              <p className="text-xs text-sky-200/80 mt-1">{game.description}</p>
            </div>

            {/* Like & Share Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleLikeToggle}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  hasLiked
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-800 text-sky-200 border-sky-500/30 hover:bg-slate-700'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
                <span>{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-sky-200 bg-slate-800 hover:bg-slate-700 border border-sky-500/30 transition-all flex items-center gap-1.5"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls list */}
          {game.controls && game.controls.length > 0 && (
            <div className="bg-slate-800/60 p-3 rounded-xl border border-sky-500/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block mb-1">
                Controls & Keys:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-sky-200">
                {game.controls.map((control, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    {control}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Similar Games Row */}
          {similarGames.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-white block mb-2">
                More {game.category} Games:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {similarGames.map((simGame) => (
                  <button
                    key={simGame.id}
                    onClick={() => onSelectGame(simGame)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-sky-500/30 text-left transition-colors group"
                  >
                    <img
                      src={simGame.thumbnail}
                      alt={simGame.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-sky-100 group-hover:text-sky-300 truncate block">
                        {simGame.title}
                      </span>
                      <span className="text-[10px] text-sky-400 block">
                        {simGame.plays}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
