// Client-side constants for StoryTime AI v2.0

export const READING_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const CONTENT_SAFETY_LEVELS = ['strict', 'moderate', 'relaxed'] as const;

export const ART_STYLES = [
  'watercolor',
  'cartoon',
  'realistic',
  'disney',
  'anime',
  'sketch',
  'oil_painting',
  'digital_art',
  'storybook'
] as const;

export const STORY_LENGTHS = {
  short: { words: 300, description: 'Short (300 words)' },
  medium: { words: 500, description: 'Medium (500 words)' },
  long: { words: 1000, description: 'Long (1000 words)' },
  custom: { words: 500, description: 'Other' }
} as const;

export const STORY_THEMES = [
  'adventure',
  'friendship',
  'magic',
  'animals',
  'space',
  'ocean',
  'forest',
  'fairy_tale',
  'superhero',
  'mystery',
  'learning',
  'bedtime'
] as const;

export const IMAGE_ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:4', label: 'Portrait (3:4)' }
] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  PROFILES: {
    LIST: '/api/profiles',
    CREATE: '/api/profiles',
    UPDATE: (id: string) => `/api/profiles/${id}`,
    DELETE: (id: string) => `/api/profiles/${id}`,
    ACTIVATE: (id: string) => `/api/profiles/${id}/activate`
  },
  STORIES: {
    LIST: '/api/stories',
    GENERATE: '/api/stories/generate',
    CREATE: '/api/stories',
    GET: (id: string) => `/api/stories/${id}`,
    UPDATE: (id: string) => `/api/stories/${id}`,
    DELETE: (id: string) => `/api/stories/${id}`,
    FAVORITE: (id: string) => `/api/stories/${id}/favorite`,
    ILLUSTRATIONS: (id: string) => `/api/stories/${id}/illustrations`,
    LINK_ILLUSTRATION: (id: string) => `/api/stories/${id}/illustrations`,
    UNLINK_ILLUSTRATION: (storyId: string, illustrationId: string) => 
      `/api/stories/${storyId}/illustrations/${illustrationId}`,
    REORDER_ILLUSTRATIONS: (id: string) => `/api/stories/${id}/illustrations/order`
  },
  ILLUSTRATIONS: {
    LIST: '/api/illustrations',
    GENERATE: '/api/illustrations/generate',
    CREATE: '/api/illustrations',
    GET: (id: string) => `/api/illustrations/${id}`,
    UPDATE: (id: string) => `/api/illustrations/${id}`,
    DELETE: (id: string) => `/api/illustrations/${id}`
  },
  FILES: {
    UPLOAD: '/api/upload'
  }
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128
  },
  CHILD_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  STORY_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255
  },
  STORY_CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10000
  },
  ILLUSTRATION_TITLE: {
    MAX_LENGTH: 255
  },
  ILLUSTRATION_DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  GENERATION_PROMPT: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500
  }
} as const;

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
} as const;