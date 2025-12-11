import React, { useState, useEffect, useRef } from 'react';
import MusicPlayer from './components/MusicPlayer';
import Sidebar from './components/ChatSidebar';
import AuthScreen from './components/AuthScreen';
import { Peer, Song, ChatMessage, ViewMode, User } from './types';
import { IconMic, IconMicOff, IconVideo, IconVideoOff, IconSparkles, IconUser, IconLogOut } from './components/Icons';

// Mock Data
const INITIAL_SONG: Song = {
  id: 'init-1',
  title: "Midnight City",
  artist: "M83",
  coverUrl: "https://picsum.photos/id/145/300/300",
  duration: 240,
  addedBy: 'Sarah'
};

const INITIAL_QUEUE: Song[] = [
    { id: 'q-1', title: "Levitating", artist: "Dua Lipa", coverUrl: "https://picsum.photos/seed/dua/300/300", duration: 200, addedBy: 'Marcus' },
    { id: 'q-2', title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://picsum.photos/seed/weeknd/300/300", duration: 210, addedBy: 'Sarah' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: '2', senderName: 'Sarah', text: 'Hey guys! Ready for the watch party?', timestamp: Date.now() - 100000 },
  { id: '2', senderId: '3', senderName: 'Marcus', text: 'Just grabbing some snacks.', timestamp: Date.now() - 50000 },
];

function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [peers, setPeers] = useState<Peer[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(INITIAL_SONG);
  const [queue, setQueue] = useState<Song[]>(INITIAL_QUEUE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLogin = (name: string) => {
      const newUser: User = {
          id: 'me',
          name,
          avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`
      };
      setUser(newUser);
      
      // Initialize peers with current user
      setPeers([
          { id: 'me', name: name + ' (You)', isLocal: true, isMuted: false },
          { id: '2', name: 'Sarah', videoUrl: 'https://picsum.photos/id/64/800/800', isLocal: false, isMuted: true },
          { id: '3', name: 'Marcus', videoUrl: 'https://picsum.photos/id/91/800/800', isLocal: false, isMuted: false },
          { id: '4', name: 'Jessica', videoUrl: 'https://picsum.photos/id/129/800/800', isLocal: false, isMuted: false },
      ]);
  };

  const handleLogout = () => {
      setUser(null);
      setIsPlaying(false);
  };

  // Local Webcam Handling
  useEffect(() => {
    async function startCamera() {
      if (!user) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
  }, [user]);

  const handleSendMessage = (text: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate reply
    if (Math.random() > 0.7) {
        setTimeout(() => {
             const reply: ChatMessage = {
                id: (Date.now() + 1).toString(),
                senderId: '2',
                senderName: 'Sarah',
                text: 'Love that!',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    }
  };

  const handleAddToQueue = (song: Song) => {
      if (!user) return;
      setQueue(prev => [...prev, { ...song, addedBy: user.name }]);
  };

  const handleRemoveFromQueue = (songId: string) => {
      setQueue(prev => prev.filter(s => s.id !== songId));
  };

  const handleSongEnd = () => {
      if (queue.length > 0) {
          const nextSong = queue[0];
          setCurrentSong(nextSong);
          setQueue(prev => prev.slice(1));
          setIsPlaying(true);
      } else {
          setIsPlaying(false);
      }
  };

  // If playing a song immediately from AI/Search (skipping queue)
  const handleImmediatePlay = (song: Song) => {
      setCurrentSong(song);
      setIsPlaying(true);
  };

  const toggleMute = () => {
    setPeers(prev => prev.map(p => p.isLocal ? { ...p, isMuted: !p.isMuted } : p));
  };

  if (!user) {
      return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col relative font-sans selection:bg-violet-500 selection:text-white">
      
      {/* Top Bar (Mobile/Desktop) */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-4">
           <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                   {user.name.charAt(0)}
               </div>
               <span className="font-medium text-sm hidden md:block">{user.name}</span>
               <button onClick={handleLogout} className="text-zinc-500 hover:text-white ml-2">
                   <IconLogOut className="w-4 h-4" />
               </button>
           </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex p-4 pb-24 gap-4 transition-all duration-300 ${sidebarOpen ? 'mr-80 lg:mr-96' : ''}`}>
        
        {/* Video Grid */}
        <div className={`flex-1 grid gap-4 ${
          viewMode === ViewMode.GRID 
            ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {peers.map((peer) => (
            <div key={peer.id} className="relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl group border border-zinc-800/50">
              
              {peer.isLocal ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transform scale-x-[-1]" 
                />
              ) : (
                <img 
                  src={peer.videoUrl} 
                  alt={peer.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                />
              )}

              {/* Peer Overlay Info */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2 border border-white/10">
                  {peer.name}
                  {peer.isMuted && <IconMicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>

              {/* Active Speaker Indicator (Mock) */}
              {!peer.isMuted && !peer.isLocal && (
                 <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Call Controls */}
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-zinc-900/90 backdrop-blur-xl p-2 rounded-2xl border border-zinc-800 shadow-2xl z-40 transition-all duration-300 ${sidebarOpen ? '-translate-x-[calc(50%+10rem)]' : ''}`}>
        <button onClick={toggleMute} className={`p-3 rounded-xl transition ${peers.find(p => p.isLocal)?.isMuted ? 'bg-red-500/20 text-red-500' : 'hover:bg-zinc-800 text-white'}`}>
          {peers.find(p => p.isLocal)?.isMuted ? <IconMicOff /> : <IconMic />}
        </button>
        <button className="p-3 rounded-xl hover:bg-zinc-800 text-white transition">
          <IconVideo />
        </button>
        <div className="w-px h-6 bg-zinc-700 mx-1" />
        <button onClick={handleLogout} className="p-3 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition shadow-lg shadow-red-500/20">
          Leave
        </button>
      </div>

      <Sidebar 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        queue={queue}
        currentSong={currentSong}
        onAddToQueue={handleAddToQueue}
        onRemoveFromQueue={handleRemoveFromQueue}
      />

      <MusicPlayer 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        onPlayPause={() => setIsPlaying(!isPlaying)} 
        onSongChange={handleImmediatePlay}
      />
    </div>
  );
}

export default App;
