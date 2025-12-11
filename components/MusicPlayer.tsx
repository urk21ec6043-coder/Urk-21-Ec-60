import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { IconPlay, IconPause, IconSkipBack, IconSkipForward, IconSparkles, IconMusic } from './Icons';
import { getMusicSuggestions } from '../services/geminiService';

interface MusicPlayerProps {
  currentSong: Song | null;
  onPlayPause: () => void;
  isPlaying: boolean;
  onSongChange: (song: Song) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentSong, onPlayPause, isPlaying, onSongChange }) => {
  const [progress, setProgress] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  // Simulated progress
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    const songs = await getMusicSuggestions(aiPrompt);
    setIsAiLoading(false);
    
    if (songs.length > 0) {
      onSongChange(songs[0]); // Auto play first suggestion
      setAiPrompt("");
      setShowAiInput(false);
    }
  };

  return (
    <div className="bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 p-4 pb-6 md:pb-4 fixed bottom-0 left-0 right-0 z-50 shadow-2xl transition-all duration-300">
      
      {/* Progress Bar (Global) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 cursor-pointer group">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-violet-500 relative transition-all duration-300" 
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        
        {/* Track Info */}
        <div className="flex items-center w-full md:w-1/3 gap-4">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 group">
             {currentSong ? (
                <img src={currentSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <IconMusic className="w-6 h-6" />
                </div>
             )}
             {isPlaying && currentSong && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center space-x-1">
                    <div className="w-1 h-4 bg-white animate-[bounce_1s_infinite]" />
                    <div className="w-1 h-6 bg-white animate-[bounce_1.2s_infinite]" />
                    <div className="w-1 h-3 bg-white animate-[bounce_0.8s_infinite]" />
                </div>
             )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="font-bold text-white truncate text-sm md:text-base">
              {currentSong?.title || "No track playing"}
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm truncate">
              {currentSong?.artist || "Pick a vibe to start"}
            </p>
            {currentSong?.suggestedBy === 'Gemini' && (
              <span className="text-[10px] text-pink-400 flex items-center gap-1 mt-0.5">
                <IconSparkles className="w-3 h-3" /> AI Pick: {currentSong.reason}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 text-white w-full md:w-1/3 justify-center">
          <button className="text-zinc-400 hover:text-white transition"><IconSkipBack className="w-5 h-5" /></button>
          <button 
            onClick={onPlayPause}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition active:scale-95 shadow-lg shadow-white/20"
          >
            {isPlaying ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5 ml-1" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition"><IconSkipForward className="w-5 h-5" /></button>
        </div>

        {/* Gemini AI DJ */}
        <div className="w-full md:w-1/3 flex justify-end">
            {!showAiInput ? (
                <button 
                  onClick={() => setShowAiInput(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition border border-zinc-700 hover:border-violet-500 group"
                >
                  <IconSparkles className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
                    Ask AI DJ
                  </span>
                </button>
            ) : (
                <form onSubmit={handleAiSubmit} className="flex w-full md:max-w-xs relative">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Feeling nostalgic? Party mode?" 
                      className="w-full bg-zinc-800 border border-violet-500/50 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={isAiLoading}
                    />
                     {isAiLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                             <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                     )}
                     {!isAiLoading && (
                        <button 
                          type="button" 
                          onClick={() => setShowAiInput(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <span className="text-xs">Esc</span>
                        </button>
                     )}
                </form>
            )}
        </div>

      </div>
    </div>
  );
};

export default MusicPlayer;
