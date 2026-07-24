import React, { useState, useRef } from 'react';
import {
  Globe,
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Shield,
  Terminal,
  Sparkles,
  Zap,
  Lock,
  ChevronDown
} from 'lucide-react';

const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'brave', name: 'Brave Search', url: 'https://search.brave.com/search?q=%s' },
];

const QUICK_LINKS = [
  { name: 'Google', url: 'https://www.google.com', icon: '🔍', desc: 'Web Search Engine' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🦆', desc: 'Privacy Search' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '🌐', desc: 'Free Encyclopedia' },
  { name: 'Archive.org', url: 'https://archive.org', icon: '🏛️', desc: 'Internet Archive' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙', desc: 'Code Repository' },
  { name: 'Ecosia', url: 'https://www.ecosia.org', icon: '🌱', desc: 'Green Search' },
];

export const UltravioletProxy = () => {
  const [addressInput, setAddressInput] = useState('');
  const [selectedEngine, setSelectedEngine] = useState(SEARCH_ENGINES[0]);
  const [activeUrl, setActiveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [statusLog, setStatusLog] = useState([
    '[BareMux] Initializing transport route...',
    '[UV-SW] Service worker registered on scope /uv/sw.js',
    '[Ultraviolet] Ready for proxy requests.',
  ]);

  const iframeRef = useRef(null);

  const formatTargetUrl = (input) => {
    let query = input.trim();
    if (!query) return '';

    // Check if input looks like a valid URL
    const isUrlPattern = /^https?:\/\//i.test(query) ||
      (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(query) && !query.includes(' '));

    if (isUrlPattern) {
      if (!/^https?:\/\//i.test(query)) {
        query = 'https://' + query;
      }
      return query;
    } else {
      // Use search engine
      return selectedEngine.url.replace('%s', encodeURIComponent(query));
    }
  };

  const handleNavigate = (targetInput) => {
    const finalUrl = formatTargetUrl(targetInput);
    if (!finalUrl) return;

    setIsLoading(true);
    setActiveUrl(finalUrl);
    setAddressInput(finalUrl);

    // Update history
    const nextHistory = [...history.slice(0, historyIdx + 1), finalUrl];
    setHistory(nextHistory);
    setHistoryIdx(nextHistory.length - 1);

    // Add log
    setStatusLog((prev) => [
      `[UV-Proxy] Proxying target: ${finalUrl}`,
      `[BareMux] Encoding request headers via ServiceWorker...`,
      ...prev.slice(0, 8),
    ]);

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleNavigate(addressInput);
  };

  const handleGoBack = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      const prevUrl = history[prevIdx];
      setActiveUrl(prevUrl);
      setAddressInput(prevUrl);
    }
  };

  const handleGoForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      const nextUrl = history[nextIdx];
      setActiveUrl(nextUrl);
      setAddressInput(nextUrl);
    }
  };

  const handleRefresh = () => {
    if (activeUrl) {
      setIsLoading(true);
      if (iframeRef.current) {
        iframeRef.current.src = activeUrl;
      }
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start min-h-[calc(100vh-6rem)] py-6 px-3 sm:px-6">
      {/* Header & Logo Section */}
      <div className="flex flex-col items-center text-center mb-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          {/* Custom Glowing UV Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Ultraviolet <span className="text-purple-400 text-lg font-bold">| TN</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full uppercase tracking-wider">
                v2.0 Proxy
              </span>
            </div>
            <p className="text-xs text-sky-300/80 font-medium">Sophisticated Web Proxy & ServiceWorker Engine</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-sky-200/90 mt-3 leading-relaxed max-w-xl">
          Ultraviolet is a highly sophisticated web proxy engine used for navigating the web in a controlled, unblocked sandbox environment.
        </p>
      </div>

      {/* Address Bar Form */}
      <div className="w-full max-w-3xl mb-6">
        <form id="uv-form" onSubmit={handleFormSubmit} className="relative group">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow-2xl backdrop-blur-md focus-within:border-purple-400 transition-all">
            {/* Search Engine Selector Dropdown */}
            <div className="relative flex items-center">
              <select
                id="uv-search-engine"
                value={selectedEngine.id}
                onChange={(e) => {
                  const engine = SEARCH_ENGINES.find((s) => s.id === e.target.value);
                  if (engine) setSelectedEngine(engine);
                }}
                className="appearance-none bg-slate-800 text-sky-200 text-xs font-bold py-2.5 pl-3 pr-8 rounded-xl border border-sky-500/20 focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                {SEARCH_ENGINES.map((eng) => (
                  <option key={eng.id} value={eng.id} className="bg-slate-900 text-white">
                    {eng.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sky-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Input address field */}
            <div className="flex-1 relative flex items-center">
              <div className="absolute left-3.5 text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="uv-address"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Search the web freely or enter URL (e.g. wikipedia.org)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-sky-400/50 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Submit Go Button */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Unblock</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Launch Cards */}
      {!activeUrl && (
        <div className="w-full max-w-3xl mb-8">
          <h2 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Popular Unblocked Shortcuts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigate(link.url)}
                className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-sky-500/20 hover:border-purple-500/50 rounded-2xl text-left transition-all group shadow-md hover:shadow-purple-500/10"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    {link.name}
                  </span>
                </div>
                <p className="text-[11px] text-sky-300/70 truncate">{link.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Proxy Iframe Browser Viewport */}
      {activeUrl && (
        <div className="w-full max-w-5xl bg-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl mb-8 flex flex-col">
          {/* Proxy Viewport Navigation Bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-sky-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGoBack}
                disabled={historyIdx <= 0}
                className="p-1.5 text-sky-300 hover:text-white disabled:opacity-30 disabled:hover:text-sky-300 rounded-lg hover:bg-slate-800 transition-all"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoForward}
                disabled={historyIdx >= history.length - 1}
                className="p-1.5 text-sky-300 hover:text-white disabled:opacity-30 disabled:hover:text-sky-300 rounded-lg hover:bg-slate-800 transition-all"
                title="Forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleRefresh}
                className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                title="Reload"
              >
                <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
              </button>
            </div>

            {/* Current Active URL Address Display */}
            <div className="flex-1 max-w-xl mx-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 text-xs text-sky-200 truncate">
              <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{activeUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-sky-300 hover:text-purple-300 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-semibold"
                title="Open directly in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </a>
            </div>
          </div>

          {/* Frame Container */}
          <div className="relative w-full h-[520px] bg-slate-950">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 text-center p-4">
                <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-purple-300 font-bold">Ultraviolet Proxy Routing...</p>
                <p className="text-[11px] text-sky-400/70 mt-1">Establishing encrypted BareMux stream</p>
              </div>
            )}
            <iframe
              ref={iframeRef}
              id="uv-frame"
              src={activeUrl}
              className="w-full h-full border-none bg-white"
              title="Ultraviolet Proxy Viewport"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Terminal / Diagnostics Output Console */}
      <div className="w-full max-w-3xl bg-slate-950/90 border border-purple-500/20 rounded-2xl p-4 shadow-xl mb-8">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-300">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Ultraviolet Service Worker Diagnostics</span>
        </div>
        <div className="desc left-margin bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-sky-300 space-y-1">
          <p id="uv-error" className="text-emerald-400 font-semibold">
            Status: Active &bull; ServiceWorker Scope: /uv/ &bull; BareMux Engine Ready
          </p>
          <pre id="uv-error-code" className="text-sky-400/80 whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
            {statusLog.join('\n')}
          </pre>
        </div>
      </div>

      {/* Footer from provided code */}
      <footer className="w-full max-w-3xl border-t border-purple-500/20 pt-6 text-xs text-sky-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sky-300">
          <a
            title="The TitaniumNetwork GitHub organization"
            href="https://github.com/titaniumnetwork-dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors"
          >
            TitaniumNetwork
          </a>
          <a
            title="The TitaniumNetwork Discord"
            href="https://discord.gg/unblock"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors"
          >
            Discord
          </a>
          <a
            title="The TompHTTP GitHub organization"
            href="https://github.com/tomphttp"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors"
          >
            TompHTTP
          </a>
          <a
            title="The official deployment repository for Ultraviolet"
            href="https://github.com/titaniumnetwork-dev/Ultraviolet-App"
            target="_blank"
            rel="noreferrer"
            className="hover:text-purple-300 transition-colors"
          >
            GitHub
          </a>
          <a
            title="License information"
            href="#credits"
            onClick={(e) => {
              e.preventDefault();
              alert('Ultraviolet Proxy is created by TitaniumNetwork under the MIT License.');
            }}
            className="hover:text-purple-300 transition-colors"
          >
            Credits
          </a>
        </div>
        <div>
          <span className="text-sky-400/80 font-medium">Ultraviolet &copy; TN 2023</span>
        </div>
      </footer>
    </div>
  );
};
