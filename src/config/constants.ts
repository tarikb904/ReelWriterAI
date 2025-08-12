import { APIProvider } from '../types';

export const APP_NAME = 'ReelWriterAI';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  USER: 'reelwriter_user',
  SESSIONS: 'reelwriter_sessions',
  CURRENT_SESSION: 'reelwriter_current_session',
  SELECTED_API: 'reelwriter_selected_api',
  AUTH_TOKEN: 'reelwriter_auth_token',
} as const;

// Session expiration (7 days)
export const SESSION_EXPIRY_DAYS = 7;
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Default credentials
export const DEFAULT_CREDENTIALS = {
  username: 'tahmid',
  password: 't112233',
};

// API Configuration
export const API_KEYS = {
  OPENROUTER: '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',
  REDDIT_CLIENT_ID: 'AmcQDu7qNwogcAEfVvDt1g',
  REDDIT_CLIENT_SECRET: 'v9-xxA1o-jSRRYnM9gLdPR-9UyR6aQ',
};

// Available API Providers
export const API_PROVIDERS: APIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'meta-llama/llama-3.1-8b-instruct',
      'google/gemini-pro',
      'mistralai/mistral-7b-instruct',
    ],
    requiresAuth: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    requiresAuth: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-sonnet', 'claude-3-haiku'],
    requiresAuth: true,
  },
];

// Reddit Subreddits for Make Money Online / BizOps niche
export const TARGET_SUBREDDITS = [
  'Entrepreneur',
  'SmallBusiness',
  'SideHustle',
  'MakeMoneyOnline',
  'DigitalMarketing',
  'passive_income',
  'WorkOnline',
  'freelance',
  'marketing',
  'OnlineBusiness',
  'AffiliateMarketing',
  'ecommerce',
  'startups',
  'GrowMyBusiness',
  'BusinessHub',
];

// RSS Feeds for authoritative blogs
export const RSS_FEEDS = [
  {
    name: 'Smart Passive Income',
    url: 'https://www.smartpassiveincome.com/feed/',
    author: 'Pat Flynn',
  },
  {
    name: 'Neil Patel Blog',
    url: 'https://neilpatel.com/blog/feed/',
    author: 'Neil Patel',
  },
  {
    name: 'Entrepreneur',
    url: 'https://www.entrepreneur.com/latest.xml',
    author: 'Entrepreneur Magazine',
  },
  {
    name: 'Side Hustle Nation',
    url: 'https://www.sidehustlenation.com/feed/',
    author: 'Nick Loper',
  },
  {
    name: 'The Penny Hoarder',
    url: 'https://www.thepennyhoarder.com/feed/',
    author: 'The Penny Hoarder',
  },
  {
    name: 'Making Sense of Cents',
    url: 'https://www.makingsenseofcents.com/feed',
    author: 'Michelle Schroeder-Gardner',
  },
  {
    name: 'ProBlogger',
    url: 'https://problogger.com/feed/',
    author: 'Darren Rowse',
  },
  {
    name: 'Foundr Magazine',
    url: 'https://foundr.com/feed',
    author: 'Foundr',
  },
  {
    name: 'HubSpot Marketing Blog',
    url: 'https://blog.hubspot.com/marketing/rss.xml',
    author: 'HubSpot',
  },
  {
    name: 'GrowthLab',
    url: 'https://growthlab.com/feed/',
    author: 'Ramit Sethi',
  },
  {
    name: 'Side Hustle School',
    url: 'https://sidehustleschool.com/feed/',
    author: 'Chris Guillebeau',
  },
  {
    name: 'Copyblogger',
    url: 'https://copyblogger.com/feed/',
    author: 'Copyblogger',
  },
  {
    name: 'Harvard Business Review',
    url: 'https://hbr.org/feed',
    author: 'Harvard Business Review',
  },
  {
    name: 'Business Insider',
    url: 'https://www.businessinsider.com/entrepreneurship.rss',
    author: 'Business Insider',
  },
  {
    name: 'Blogging Wizard',
    url: 'https://bloggingwizard.com/feed/',
    author: 'Blogging Wizard',
  },
];

// Steps configuration
export const STEPS = [
  {
    id: 1,
    title: 'Research',
    description: 'Find viral content ideas',
    icon: 'Search',
  },
  {
    id: 2,
    title: 'Hooks',
    description: 'Generate engaging hooks',
    icon: 'Zap',
  },
  {
    id: 3,
    title: 'Script',
    description: 'Write the full script',
    icon: 'FileText',
  },
  {
    id: 4,
    title: 'Captions',
    description: 'Create social media captions',
    icon: 'MessageSquare',
  },
] as const;