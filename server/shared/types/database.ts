// Database types for StoryTime AI v2.0

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

// Illustration generation session tracking
export interface IllustrationSession {
  id: string;
  user_id: string;
  story_id?: string;
  target_entity_type?: 'character' | 'setting' | 'element' | 'scene';
  target_entity_id?: string; // ID of specific character/setting/element being illustrated
  scene_prompt: string;
  current_round: number;
  max_rounds: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

// World-building entity interfaces
export interface Character {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  visual_traits?: string; // "blonde hair, blue eyes, always wears red cape"
  personality_traits?: string[]; // ["brave", "curious", "kind"]
  canonical_illustration_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StorySetting {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  visual_description?: string; // "enchanted forest with glowing mushrooms"
  atmosphere?: string; // "magical", "cozy", "mysterious"
  canonical_illustration_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StoryElement {
  id: string;
  user_id: string;
  name: string;
  type: 'object' | 'creature' | 'vehicle' | 'magical_item';
  description?: string;
  visual_description?: string;
  significance?: string; // Why this element is important
  canonical_illustration_id?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced story-illustration linking
export interface StoryIllustrationLink {
  id: string;
  story_id: string;
  illustration_id: string;
  position: number; // Order in story (1, 2, 3...)
  caption?: string; // Optional caption for the illustration
  context?: string; // What part of story this illustrates
  layout_preferences?: any; // JSON for size, positioning, etc.
  created_at: string;
}

// World-building relationship interfaces
export interface StoryCharacterAppearance {
  story_id: string;
  character_id: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentioned';
  importance_score: number; // 1-5 scale
}

export interface StorySettingUsage {
  story_id: string;
  setting_id: string;
  scene_order?: number; // Which scene number this setting appears in
  description_context?: string; // How it's described in this story
}

export interface StoryElementUsage {
  story_id: string;
  element_id: string;
  importance: 'central' | 'supporting' | 'background';
  context?: string; // How the element is used in this story
}

// Legacy interface for backward compatibility (will be removed)
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