export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
}

export interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
  score?: number;
  createdAt: Date;
}

export interface Hook {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
}

export interface Script {
  id: string;
  content: string;
  wordCount: number;
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Caption {
  id: string;
  platform: 'instagram' | 'linkedin' | 'youtube';
  content: string;
  hashtags?: string[];
  createdAt: Date;
}

export interface Session {
  id: string;
  contentIdea: ContentIdea;
  selectedHook?: Hook;
  script?: Script;
  captions?: Caption[];
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface APIProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  requiresAuth: boolean;
}

export interface AppState {
  user: User | null;
  currentSession: Session | null;
  sessions: Session[];
  selectedAPI: APIProvider;
  isLoading: boolean;
  error: string | null;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  score: number;
  subreddit: string;
  created_utc: number;
  permalink: string;
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}