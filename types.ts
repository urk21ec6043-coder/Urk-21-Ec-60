export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Song {
  id?: string; // unique id for queue items
  title: string;
  artist: string;
  coverUrl: string;
  duration: number; // in seconds
  suggestedBy?: string; // 'User' or 'Gemini'
  reason?: string; // Why Gemini picked it
  addedBy?: string; // Name of user who added it
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface Peer {
  id: string;
  name: string;
  videoUrl?: string; // For mock peers
  isLocal: boolean;
  isMuted: boolean;
}

export enum ViewMode {
  GRID = 'GRID',
  FOCUS = 'FOCUS',
}