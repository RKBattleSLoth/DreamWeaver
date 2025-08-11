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
  session_id?: string;
  
  // Basic info
  title?: string;
  description?: string;
  image_path: string; // Single source of truth for file location
  
  // Generation metadata
  art_style: string; // 'watercolor', 'cartoon', 'sketch', 'digital'
  generation_prompt?: string;
  dalle_revised_prompt?: string; // What DALL-E actually used
  
  // Collaborative workflow fields
  generation_batch_id?: string;      // Groups variations generated together
  is_canonical?: boolean;            // True if this is the final selected image
  parent_illustration_id?: string;   // Links to favorite from previous round
  iteration_round?: number;          // Which round of iteration (1, 2, 3...)
  
  // World-building links
  target_entity_type?: 'character' | 'setting' | 'element' | 'scene';
  depicts_character_id?: string;
  depicts_setting_id?: string;
  depicts_element_id?: string;
  
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
  illustration_style?: string;
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

// Collaborative Illustration Generation
export interface IllustrationGenerationRequest {
  userId?: string; // Filled by server from auth
  storyId?: string;
  childProfile: ChildProfile;
  scenePrompt: string;
  sceneType: 'character' | 'scene' | 'object' | 'setting';
}

export interface StartIllustrationSessionResponse {
  sessionId: string;
  variations: Illustration[];
}

export interface SelectFavoriteRequest {
  sessionId: string;
  selectedId: string;
  action: 'make_canon' | 'iterate';
  currentRound: number;
}

export interface SelectFavoriteResponse {
  action: string;
  canonicalIllustration?: Illustration;
  newVariations?: Illustration[];
}

export interface GenerateVariationsRequest {
  sessionId: string;
  round: number;
  basePrompt: string;
  favoriteIllustrationId?: string;
}

export interface IllustrationSession {
  id: string;
  user_id: string;
  story_id?: string;
  target_entity_type?: 'character' | 'setting' | 'element' | 'scene';
  target_entity_id?: string;
  scene_prompt: string;
  current_round: number;
  max_rounds: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
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