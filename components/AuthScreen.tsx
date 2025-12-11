import React, { useState } from 'react';
import { IconSparkles, IconVideo, IconMusic } from './Icons';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
        onLogin(name);
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-2xl">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <IconSparkles className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                    VibeSync
                </h1>
                <p className="text-zinc-400 mt-2">
                    FaceTime meets Spotify. <br/> Watch, Listen, and Chat together.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        autoFocus
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={!name.trim() || isLoading}
                    className="w-full bg-white text-black font-bold rounded-xl py-3.5 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 flex justify-center items-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
                    ) : (
                        "Join the Party"
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-center gap-6 text-zinc-500">
                <div className="flex flex-col items-center gap-1">
                    <IconVideo className="w-5 h-5" />
                    <span className="text-[10px]">HD Video</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <IconMusic className="w-5 h-5" />
                    <span className="text-[10px]">Live Sync</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <IconSparkles className="w-5 h-5" />
                    <span className="text-[10px]">AI DJ</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AuthScreen;
