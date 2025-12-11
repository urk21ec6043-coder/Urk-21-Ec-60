import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Song } from '../types';
import { IconSparkles, IconX, IconMessage, IconMusic, IconQueue, IconSearch, IconPlus, IconTrash } from './Icons';
import { getConversationStarters, searchSongs } from '../services/geminiService';

interface SidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  queue: Song[];
  onRemoveFromQueue: (id: string) => void;
  onAddToQueue: (song: Song) => void;
  currentSong: Song | null;
}

type Tab = 'chat' | 'music';

const Sidebar: React.FC<SidebarProps> = ({ 
    messages, 
    onSendMessage, 
    isOpen, 
    onToggle, 
    queue, 
    onRemoveFromQueue,
    onAddToQueue,
    currentSong
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Music State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (activeTab === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput("");
      setSuggestions([]);
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    const context = messages.slice(-3).map(m => m.text).join(" | ") || "Just started hanging out";
    const newSuggestions = await getConversationStarters(context);
    setSuggestions(newSuggestions);
    setLoadingSuggestions(false);
  };

  const handleMusicSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      const results = await searchSongs(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
  };

  if (!isOpen) {
     return (
        <button 
            onClick={onToggle}
            className="fixed right-6 bottom-32 z-40 bg-zinc-800 p-3 rounded-full shadow-lg hover:bg-zinc-700 transition border border-zinc-700"
        >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            <IconMessage className="text-white w-6 h-6" />
        </button>
     )
  }

  return (
    <div className={`fixed right-0 top-0 bottom-[90px] w-80 lg:w-96 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl z-40 flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header Tabs */}
      <div className="flex items-center border-b border-zinc-800">
        <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 p-4 text-sm font-medium transition ${activeTab === 'chat' ? 'text-white border-b-2 border-violet-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Chat
        </button>
        <button 
            onClick={() => setActiveTab('music')}
            className={`flex-1 p-4 text-sm font-medium transition ${activeTab === 'music' ? 'text-white border-b-2 border-violet-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            Music & Queue
        </button>
        <button onClick={onToggle} className="p-4 text-zinc-400 hover:text-white">
          <IconX className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.senderId === 'me' 
                            ? 'bg-violet-600 text-white rounded-br-none' 
                            : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                    }`}>
                    {msg.text}
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.senderName}</span>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Overlay */}
            {suggestions.length > 0 && (
                <div className="px-4 pb-2 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">AI Suggestions</div>
                    {suggestions.map((s, i) => (
                        <button 
                            key={i}
                            onClick={() => { setChatInput(s); setSuggestions([]); }}
                            className="block w-full text-left text-xs p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 transition truncate"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-zinc-800 text-white text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                    <button 
                        type="button"
                        onClick={handleGetSuggestions}
                        disabled={loadingSuggestions}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-300 p-1"
                        title="Get AI Suggestions"
                    >
                        {loadingSuggestions ? (
                            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <IconSparkles className="w-4 h-4" />
                        )}
                    </button>
                </div>
                </form>
            </div>
        </>
      )}

      {/* MUSIC TAB */}
      {activeTab === 'music' && (
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search Section */}
              <div className="p-4 border-b border-zinc-800">
                  <form onSubmit={handleMusicSearch} className="relative">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="Search for songs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-800 text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                  </form>
                  {isSearching && (
                      <div className="text-center py-4 text-xs text-zinc-500">Searching...</div>
                  )}
                  {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                          <h3 className="text-[10px] uppercase font-bold text-zinc-500">Results</h3>
                          {searchResults.map(song => (
                              <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg group">
                                  <img src={song.coverUrl} className="w-10 h-10 rounded object-cover" alt="cover" />
                                  <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white font-medium truncate">{song.title}</div>
                                      <div className="text-xs text-zinc-400 truncate">{song.artist}</div>
                                  </div>
                                  <button onClick={() => { onAddToQueue(song); setSearchResults([]); setSearchQuery(""); }} className="p-1.5 bg-violet-600 rounded-full hover:bg-violet-500 text-white">
                                      <IconPlus className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Queue Section */}
              <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-[10px] uppercase font-bold text-zinc-500 mb-3 flex items-center gap-2">
                      <IconQueue className="w-3 h-3" /> Up Next
                  </h3>
                  
                  {queue.length === 0 ? (
                      <div className="text-center py-10 text-zinc-600 text-sm">
                          Queue is empty. <br/> Search to add songs!
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {queue.map((song, idx) => (
                              <div key={song.id || idx} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg border border-zinc-800/50">
                                  <span className="text-zinc-600 text-xs font-mono w-4 text-center">{idx + 1}</span>
                                  <img src={song.coverUrl} className="w-10 h-10 rounded object-cover" alt="cover" />
                                  <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white font-medium truncate">{song.title}</div>
                                      <div className="text-xs text-zinc-400 truncate">{song.artist}</div>
                                      {song.addedBy && <div className="text-[10px] text-zinc-500 mt-0.5">Added by {song.addedBy}</div>}
                                  </div>
                                  <button onClick={() => song.id && onRemoveFromQueue(song.id)} className="text-zinc-600 hover:text-red-400 transition p-1">
                                      <IconTrash className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Sidebar;
