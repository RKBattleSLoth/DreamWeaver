// Client-side types for StoryTime AI v2.0

// Database types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  grade?: string;
  reading_level?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  favorite_themes?: string[];
  content_safety: 'strict' | 'moderate' | 'relaxed';
  preferred_art_style: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  child_profile_id?: string;
  title: string;
  content: string;
  theme?: string;
  reading_level?: string;
  word_count?: number;
  generation_prompt?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Illustration {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  image_url: string;
  image_path: string;
  art_style?: string;
  generation_prompt?: string;
  width?: number;
  height?: number;
  file_size?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface StoryIllustration {
  id: string;
  story_id: string;
  illustration_id: string;
  position: number;
  created_at: string;
}

// Extended types with relations
export interface StoryWithIllustrations extends Story {
  illustrations: (StoryIllustration & { illustration: Illustration })[];
}

export interface IllustrationWithStories extends Illustration {
  stories: (StoryIllustration & { story: Story })[];
}

export interface ChildProfileWithStats extends ChildProfile {
  story_count: number;
  illustration_count: number;
}

// API types

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
  story_length?: 'short' | 'medium' | 'long' | 'custom';
  custom_word_count?: number;
  reading_level?: 'beginner' | 'intermediate' | 'advanced';
  story_about?: 'child' | 'other_character';
  custom_character_name?: string;
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