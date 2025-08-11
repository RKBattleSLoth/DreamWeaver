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

// Illustration styles for story generation with user-friendly labels
export const ILLUSTRATION_STYLES = {
  watercolor: {
    label: 'Watercolor',
    description: 'Soft, dreamy paintings with flowing colors',
    modifier: 'Soft watercolor painting with gentle brushstrokes, dreamy and flowing colors, peaceful atmosphere'
  },
  cartoon: {
    label: 'Cartoon',
    description: 'Bright and cheerful with bold outlines',
    modifier: 'Cheerful cartoon illustration with bold outlines, vibrant colors, and expressive characters'
  },
  sketch: {
    label: 'Pencil Sketch',
    description: 'Detailed pencil drawings with artistic shading',
    modifier: 'Detailed pencil sketch with careful shading, artistic linework, and dynamic composition'
  },
  digital_art: {
    label: 'Digital Art',
    description: 'Clean modern illustrations with rich colors',
    modifier: 'Clean digital illustration with modern styling, rich colors, and magical details'
  },
  oil_painting: {
    label: 'Oil Painting',
    description: 'Classical painted style with rich textures',
    modifier: 'Beautiful oil painting with rich textures, classical artistic style, and warm lighting'
  },
  storybook: {
    label: 'Storybook',
    description: 'Traditional children\'s book illustration style',
    modifier: 'Classic storybook illustration with warm colors, detailed backgrounds, and enchanting atmosphere'
  },
  disney: {
    label: 'Disney Style',
    description: 'Animated movie style with expressive characters',
    modifier: 'Disney-style animation with expressive characters, vibrant colors, and magical storytelling'
  },
  realistic: {
    label: 'Realistic',
    description: 'Lifelike illustrations with natural details',
    modifier: 'Realistic illustration with natural lighting, detailed textures, and lifelike proportions'
  },
  anime: {
    label: 'Anime',
    description: 'Japanese animation style with large eyes',
    modifier: 'Anime-style illustration with expressive eyes, dynamic poses, and colorful details'
  }
} as const;

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