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