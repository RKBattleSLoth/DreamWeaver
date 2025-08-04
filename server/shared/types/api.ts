// API types for StoryTime AI v2.0

import { User, ChildProfile, Story, Illustration, StoryWithIllustrations } from './database.js';

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

// Child Profiles
export interface CreateChildProfileRequest {
  name: string;
  age?: number;
  grade?: string;
  reading_level?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  favorite_themes?: string[];
  content_safety?: 'strict' | 'moderate' | 'relaxed';
  preferred_art_style?: string;
}

export interface UpdateChildProfileRequest extends Partial<CreateChildProfileRequest> {
  is_active?: boolean;
}

// Stories
export interface GenerateStoryRequest {
  child_profile_id?: string;
  theme?: string;
  custom_prompt?: string;
  story_length?: 'short' | 'medium' | 'long';
  reading_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CreateStoryRequest {
  child_profile_id?: string;
  title: string;
  content: string;
  theme?: string;
  reading_level?: string;
}

export interface UpdateStoryRequest extends Partial<CreateStoryRequest> {
  is_favorite?: boolean;
}

export interface GenerateStoryResponse {
  story: Story;
}

// Illustrations
export interface GenerateIllustrationRequest {
  prompt: string;
  art_style?: string;
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'hd';
}

export interface CreateIllustrationRequest {
  title?: string;
  description?: string;
  art_style?: string;
  tags?: string[];
}

export interface UpdateIllustrationRequest extends Partial<CreateIllustrationRequest> {}

export interface GenerateIllustrationResponse {
  illustration: Illustration;
}

// Gallery
export interface GalleryFilters {
  art_style?: string;
  tags?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface GalleryResponse {
  illustrations: Illustration[];
  total: number;
  page: number;
  per_page: number;
}

// Story-Illustration Linking
export interface LinkIllustrationRequest {
  illustration_id: string;
  position: number;
}

export interface ReorderIllustrationsRequest {
  illustration_positions: Array<{
    illustration_id: string;
    position: number;
  }>;
}

// Reader
export interface StoryReaderResponse {
  story: StoryWithIllustrations;
}

// Common
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// File upload
export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
}