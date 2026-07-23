import React, { useState } from 'react';
import { X, Plus, Gamepad2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Action', 'Arcade', 'Puzzle', 'Sports', 'Racing', 'Skill', 'Strategy', 'Retro'];

export const AddGameModal = ({ isOpen, onClose, onAddGame }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [iframeUrl, setIframeUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !iframeUrl.trim()) return;

    const newGame = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim() || 'Custom added unblocked game.',
      iframeUrl: iframeUrl.trim(),
      thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      rating: 5.0,
      plays: '1',
      controls: controls.split('\n').filter((c) => c.trim().length > 0) || ['Use Mouse and Keyboard'],
      featured: false,
      popular: false,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean) || ['custom', 'unblocked'],
      isCustom: true,
    };

    onAddGame(newGame);
    onClose();

    // Reset form
    setTitle('');
    setIframeUrl('');
    setThumbnail('');
    setDescription('');
    setControls('');
    setTags('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl frost-glass rounded-2xl shadow-2xl border border-sky-500/30 overflow-hidden text-sky-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Custom Game Iframe</h2>
              <p className="text-xs text-sky-100">Store new games in your local unblocked catalog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-900/90">
          <div>
            <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
              Game Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Cool Unblocked Game"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-sky-400/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
                Thumbnail Image URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-sky-400/60"
                />
                <ImageIcon className="w-4 h-4 text-sky-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
              Game Iframe URL *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                placeholder="https://example.com/game-iframe"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-sky-400/60"
              />
              <LinkIcon className="w-4 h-4 text-sky-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-sky-400 mt-1">
              This link will be embedded in a secure HTML iframe player.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of gameplay..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-sky-400/60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-300 uppercase tracking-wider mb-1">
              Controls (One instruction per line)
            </label>
            <textarea
              rows={2}
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              placeholder="Arrow Keys to move&#10;Spacebar to Jump"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-800/90 border border-sky-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder-sky-400/60"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="frost-button px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
