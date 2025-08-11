# DreamWeaver Database Schema Optimization Plan

## 🎯 **Current Issues to Address**

### **1. Legacy/Redundant Fields to Remove**
- **illustrations table**: Duplicate storage paths (`image_path` + `image_url`)
- **illustrations table**: Basic metadata should be computed (`file_size`, `width`, `height`)  
- **stories table**: `generation_prompt` should be in generation history
- **stories table**: `word_count` should be computed dynamically
- **child_profiles table**: `grade` field is redundant with age

### **2. Missing World-Building Structure**
- No character consistency tracking across stories
- No setting/location persistence  
- No story object/element tracking
- No proper story-world element relationships

### **3. Inconsistent Data Types**
- `story_context` as generic `any` type
- JSON blobs where structured data would be better
- Inconsistent field naming conventions

---

## 🏗️ **Optimized Schema Structure**

### **Core Entity Tables**

```sql
-- Users and Profiles (Streamlined)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age > 0 AND age < 18),
  reading_level TEXT CHECK (reading_level IN ('beginner', 'intermediate', 'advanced')),
  interests TEXT[],
  preferred_art_style TEXT DEFAULT 'watercolor',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stories (Cleaned up)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  theme VARCHAR(100),
  reading_level TEXT CHECK (reading_level IN ('beginner', 'intermediate', 'advanced')),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **World-Building Entity Tables** ⭐

```sql
-- Characters that persist across stories
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  visual_traits TEXT, -- "blonde hair, blue eyes, always wears red cape"
  personality_traits TEXT[], -- ["brave", "curious", "kind"]
  canonical_illustration_id UUID REFERENCES illustrations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings/locations that appear in multiple stories  
CREATE TABLE story_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  visual_description TEXT, -- "enchanted forest with glowing mushrooms"
  atmosphere VARCHAR(50), -- "magical", "cozy", "mysterious"
  canonical_illustration_id UUID REFERENCES illustrations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Important objects/elements that appear across stories
CREATE TABLE story_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) CHECK (type IN ('object', 'creature', 'vehicle', 'magical_item')),
  description TEXT,
  visual_description TEXT,
  significance TEXT, -- Why this element is important
  canonical_illustration_id UUID REFERENCES illustrations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Illustration System (Optimized)**

```sql
-- Session tracking for collaborative generation
CREATE TABLE illustration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  target_entity_type VARCHAR(20) CHECK (target_entity_type IN ('character', 'setting', 'element', 'scene')),
  target_entity_id UUID, -- ID of character/setting/element being illustrated
  scene_prompt TEXT NOT NULL,
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 3,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Streamlined illustrations table
CREATE TABLE illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES illustration_sessions(id) ON DELETE SET NULL,
  
  -- Basic info
  title VARCHAR(200),
  description TEXT,
  image_path VARCHAR(500) NOT NULL, -- Single source of truth for file location
  
  -- Generation metadata  
  art_style VARCHAR(50) NOT NULL, -- 'watercolor', 'cartoon', 'sketch', 'digital'
  generation_prompt TEXT,
  dalle_revised_prompt TEXT, -- What DALL-E actually used
  
  -- Collaborative workflow
  generation_batch_id UUID, -- Groups variations together
  is_canonical BOOLEAN DEFAULT false, -- Final selected version
  parent_illustration_id UUID REFERENCES illustrations(id), -- Previous round favorite
  iteration_round INTEGER DEFAULT 1,
  
  -- World-building links
  depicts_character_id UUID REFERENCES characters(id),
  depicts_setting_id UUID REFERENCES story_settings(id), 
  depicts_element_id UUID REFERENCES story_elements(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Linking & Relationship Tables**

```sql
-- Enhanced story-illustration linking
CREATE TABLE story_illustration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID NOT NULL REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order in story (1, 2, 3...)
  caption TEXT, -- Optional caption for the illustration
  context TEXT, -- What part of story this illustrates
  layout_preferences JSONB DEFAULT '{}', -- Size, positioning, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(story_id, illustration_id),
  UNIQUE(story_id, position) -- Only one illustration per position
);

-- Which characters appear in which stories
CREATE TABLE story_character_appearances (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role VARCHAR(30) CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'mentioned')),
  importance_score INTEGER DEFAULT 1 CHECK (importance_score >= 1 AND importance_score <= 5),
  PRIMARY KEY (story_id, character_id)
);

-- Which settings are used in which stories  
CREATE TABLE story_setting_usage (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  setting_id UUID NOT NULL REFERENCES story_settings(id) ON DELETE CASCADE,
  scene_order INTEGER, -- Which scene number this setting appears in
  description_context TEXT, -- How it's described in this story
  PRIMARY KEY (story_id, setting_id)
);

-- Which elements appear in which stories
CREATE TABLE story_element_usage (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  element_id UUID NOT NULL REFERENCES story_elements(id) ON DELETE CASCADE,
  importance VARCHAR(20) CHECK (importance IN ('central', 'supporting', 'background')),
  context TEXT, -- How the element is used in this story
  PRIMARY KEY (story_id, element_id)
);
```

### **Performance Indexes**

```sql
-- Core performance indexes
CREATE INDEX idx_child_profiles_user_active ON child_profiles(user_id, is_active);
CREATE INDEX idx_stories_user_date ON stories(user_id, created_at DESC);
CREATE INDEX idx_stories_child_profile ON stories(child_profile_id);

-- Illustration indexes
CREATE INDEX idx_illustrations_user_canonical ON illustrations(user_id, is_canonical);
CREATE INDEX idx_illustrations_session ON illustrations(session_id);
CREATE INDEX idx_illustrations_batch ON illustrations(generation_batch_id);
CREATE INDEX idx_illustrations_character ON illustrations(depicts_character_id);
CREATE INDEX idx_illustrations_setting ON illustrations(depicts_setting_id);
CREATE INDEX idx_illustrations_element ON illustrations(depicts_element_id);

-- Linking table indexes
CREATE INDEX idx_story_links_story_pos ON story_illustration_links(story_id, position);
CREATE INDEX idx_story_links_illustration ON story_illustration_links(illustration_id);

-- World-building indexes
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_settings_user ON story_settings(user_id);
CREATE INDEX idx_elements_user ON story_elements(user_id);
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Add New Tables** ✅
```sql
-- Add world-building tables
-- Add improved illustration_sessions table  
-- Add enhanced linking tables
```

### **Phase 2: Data Migration** 
```sql
-- Migrate existing illustrations to new structure
-- Extract characters/settings from story content  
-- Create canonical links for existing data
```

### **Phase 3: Cleanup Legacy Fields**
```sql  
-- Remove redundant fields from illustrations
-- Clean up unused JSON blob fields
-- Standardize naming conventions
```

### **Phase 4: Add Constraints & Optimize**
```sql
-- Add proper foreign key constraints
-- Optimize indexes based on query patterns
-- Add data validation triggers
```

---

## 🌟 **Key Benefits of Optimized Schema**

### **For World-Building**
- **Character Consistency**: Same character can appear across multiple stories with visual consistency
- **Setting Persistence**: Locations become familiar, buildable worlds  
- **Element Tracking**: Important objects/creatures maintain identity across stories
- **Cross-Story References**: "Remember the magic sword from Emma's adventure?" 

### **For Story-Illustration Linking**
- **Precise Positioning**: Illustrations have exact placement in stories
- **Rich Context**: Captions and context explain what's being shown
- **Flexible Layout**: JSON metadata for positioning, sizing, styling
- **Multiple Depictions**: Same character/setting can have many illustrations

### **For Gallery & Browsing**
- **Smart Filtering**: "Show me all illustrations of Emma" or "All forest settings"
- **World Exploration**: Browse by character, setting, or story element
- **Canonical Collections**: Official versions vs. variations
- **Story Integration**: See which stories use each illustration

### **For Collaborative Generation**
- **Session Continuity**: Full history of generation rounds
- **Smart Prompting**: Use canonical descriptions for consistency
- **Batch Management**: Clean up variations, keep favorites
- **Parent-Child Tracking**: See evolution of illustrations through iterations

---

## 🛠️ **Implementation Priority**

### **Immediate (This Sprint)**
1. ✅ Create migration file for new tables
2. ✅ Update TypeScript interfaces  
3. ✅ Update database functions
4. ✅ Test illustration generation with new schema

### **Next Sprint** 
1. 🔲 Implement world-building entity extraction
2. 🔲 Build character/setting consistency features
3. 🔲 Create enhanced story-illustration linking UI
4. 🔲 Gallery filtering and world exploration

This optimized schema transforms DreamWeaver from a simple story+illustration app into a rich world-building platform where every story contributes to the child's growing imaginative universe.