# StoryTime AI - Product Requirements Document

## Project Overview

**Product Name:** StoryTime AI
**Version:** 2.0 (Complete Rebuild)
**Target Users:** Parents creating personalized bedtime stories for their children
**Core Value Proposition:** Generate AI-powered personalized stories and illustrations separately, with a gallery system for managing visual content.

## Key Changes from v1.0
- **Separated Content Creation:** Story generation and illustration generation are completely separate workflows
- **Gallery System:** Dedicated gallery for storing, viewing, and managing all illustrations
- **Simplified Architecture:** Clean, modular codebase with minimal dependencies
- **Flexible Linking:** Stories and illustrations can be linked together in various combinations

## Core Features

### 1. User Authentication
- **Email/password registration and login**
- **Secure session management with JWT tokens**
- **Password reset functionality**
- **User profile management**

### 2. Child Profile Management
- **Create multiple child profiles per user account**
- **Profile attributes:**
  - Name, age, grade level
  - Reading level (beginner, intermediate, advanced)
  - Interests and favorite themes
  - Content safety preferences
  - Preferred illustration style
- **Set active profile for personalized content**
- **Profile switching capability**

### 3. Story Generation (Text Only)
- **AI-powered story generation using OpenRouter API**
- **Input parameters:**
  - Selected child profile (auto-populates preferences)
  - Story theme/genre
  - Custom prompt or story elements
  - Desired story length
- **Generated stories are pure text content**
- **Save, edit, and manage generated stories**
- **Story library with search and filtering**

### 4. Illustration Generation (Separate Workflow)
- **Standalone illustration generator**
- **Input parameters:**
  - Text prompt/description
  - Art style (watercolor, cartoon, realistic, etc.)
  - Child-safe content filters
  - Aspect ratio/size preferences
- **AI-powered image generation (DALL-E 3 or Stable Diffusion)**
- **Generated illustrations saved to Gallery**
- **Batch generation capability**

### 5. Gallery System
- **Centralized storage for all illustrations**
- **Grid view with thumbnails**
- **Search and filter by:**
  - Creation date
  - Art style
  - Associated stories
  - Tags/categories
- **Image management:**
  - View full-size
  - Download/export
  - Delete/archive
  - Add tags/descriptions
- **Usage tracking (which stories use which illustrations)**

### 6. Story-Illustration Linking
- **Link stories to illustrations (many-to-many relationship)**
- **Visual story editor:**
  - Import existing story text
  - Insert illustrations at specific points
  - Arrange illustrations and text blocks
  - Preview final story layout
- **Multiple illustrations per story**
- **Reuse illustrations across different stories**

### 7. Story Reader/Viewer
- **Clean reading interface**
- **Text and illustrations displayed together**
- **Navigation controls (next/previous page)**
- **Read-aloud capability (text-to-speech)**
- **Bookmark and favorite stories**

## Technical Architecture

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** TanStack Query for server state
- **Routing:** Wouter (lightweight routing)
- **Image Handling:** React Image Gallery component

### Backend Stack
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **File Storage:** Supabase Storage for images
- **Authentication:** JWT tokens with HTTP-only cookies
- **API Documentation:** Built-in OpenAPI/Swagger docs

### External Services
- **AI Text Generation:** OpenRouter API (Claude, GPT-4, etc.)
- **AI Image Generation:** OpenAI DALL-E 3 API
- **Database & Storage:** Supabase (PostgreSQL + file storage)
- **Email (optional):** Resend for transactional emails

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Child profiles
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  grade VARCHAR(50),
  reading_level VARCHAR(50), -- beginner, intermediate, advanced
  interests TEXT[], -- array of interests
  favorite_themes TEXT[], -- array of themes
  content_safety VARCHAR(50) DEFAULT 'strict',
  preferred_art_style VARCHAR(50) DEFAULT 'watercolor',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stories (text only)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_profile_id UUID REFERENCES child_profiles(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- full story text
  theme VARCHAR(100),
  reading_level VARCHAR(50),
  word_count INTEGER,
  generation_prompt TEXT, -- original prompt used
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Illustrations (separate entity)
CREATE TABLE illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500) NOT NULL, -- Supabase storage URL
  image_path VARCHAR(500) NOT NULL, -- storage path
  art_style VARCHAR(100),
  generation_prompt TEXT, -- original prompt used
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags TEXT[], -- searchable tags
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Story-Illustration linking (many-to-many)
CREATE TABLE story_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  illustration_id UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  position INTEGER, -- order within the story
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, illustration_id, position)
);

-- Indexes for performance
CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_child_profile_id ON stories(child_profile_id);
CREATE INDEX idx_illustrations_user_id ON illustrations(user_id);
CREATE INDEX idx_story_illustrations_story_id ON story_illustrations(story_id);
CREATE INDEX idx_story_illustrations_illustration_id ON story_illustrations(illustration_id);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user info

### Child Profiles
- `GET /api/profiles` - Get all profiles for current user
- `POST /api/profiles` - Create new child profile
- `PUT /api/profiles/:id` - Update child profile
- `DELETE /api/profiles/:id` - Delete child profile
- `POST /api/profiles/:id/activate` - Set as active profile

### Stories
- `GET /api/stories` - Get all stories for current user
- `POST /api/stories/generate` - Generate new story with AI
- `POST /api/stories` - Save story (manual creation)
- `GET /api/stories/:id` - Get specific story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/favorite` - Toggle favorite status

### Illustrations
- `GET /api/illustrations` - Get all illustrations for current user (Gallery)
- `POST /api/illustrations/generate` - Generate new illustration with AI
- `POST /api/illustrations` - Upload custom illustration
- `GET /api/illustrations/:id` - Get specific illustration
- `PUT /api/illustrations/:id` - Update illustration metadata
- `DELETE /api/illustrations/:id` - Delete illustration

### Story-Illustration Linking
- `GET /api/stories/:id/illustrations` - Get illustrations linked to story
- `POST /api/stories/:id/illustrations` - Link illustration to story
- `DELETE /api/stories/:storyId/illustrations/:illustrationId` - Unlink
- `PUT /api/stories/:id/illustrations/order` - Reorder illustrations in story

### File Management
- `POST /api/upload` - Upload image file to storage
- `GET /api/files/:path` - Serve image files (proxied from Supabase)

## User Interface Design

### Page Structure
1. **Login/Register Page** - Simple form with email/password
2. **Dashboard** - Quick access to recent stories, active profile, quick actions
3. **Child Profiles** - Manage child profiles with creation/editing forms
4. **Story Creator** - AI generation form + manual story writing
5. **Illustration Generator** - Standalone illustration creation tool
6. **Gallery** - Grid view of all illustrations with filtering/search
7. **Story Library** - List/grid of all stories with search/filtering
8. **Story Editor** - Link illustrations to stories, arrange layout
9. **Story Reader** - Clean reading interface with illustrations

### Key UI Components
- **Profile Selector** - Dropdown to switch between child profiles
- **AI Generation Forms** - Intuitive forms for story/illustration prompts
- **Image Grid** - Responsive gallery grid with lazy loading
- **Drag & Drop Interface** - For linking illustrations to stories
- **Text Editor** - Rich text editing for manual story creation
- **Preview Modal** - Full-screen story preview with illustrations

## Development Phases

### Phase 1: Core Foundation (Week 1-2)
- Set up project structure and development environment
- Implement user authentication system
- Create basic child profile management
- Set up database schema and API structure

### Phase 2: Content Generation (Week 3-4)
- Implement story generation with OpenRouter API
- Create illustration generation with DALL-E 3
- Build basic story and illustration CRUD operations
- Set up file storage with Supabase

### Phase 3: Gallery & Linking (Week 5-6)
- Build Gallery interface for illustration management
- Implement story-illustration linking system
- Create story editor for combining text and images
- Add search and filtering capabilities

### Phase 4: Reader & Polish (Week 7-8)
- Build story reader interface
- Add text-to-speech functionality
- Implement favorites and bookmarking
- Polish UI/UX and add responsive design

### Phase 5: Advanced Features (Week 9-10)
- Add batch illustration generation
- Implement illustration tagging and categories
- Create story templates and themes
- Add export/sharing capabilities

## Success Metrics
- **User Engagement:** Average stories generated per user per week
- **Content Creation:** Ratio of stories to illustrations created
- **Feature Adoption:** Gallery usage and story-illustration linking rate
- **User Retention:** Weekly active users and session duration
- **Content Quality:** User satisfaction with generated content

## Technical Considerations

### Performance
- **Image Optimization:** Automatic resizing and compression for web delivery
- **Lazy Loading:** Progressive loading of gallery images
- **Caching:** Browser caching for static assets and API responses
- **Database Optimization:** Proper indexing and query optimization

### Security
- **Input Validation:** Strict validation on all user inputs
- **Content Filtering:** AI-powered content safety for child-appropriate content
- **File Upload Security:** Virus scanning and file type validation
- **Rate Limiting:** API rate limiting to prevent abuse

### Scalability
- **Horizontal Scaling:** Stateless API design for easy scaling
- **CDN Integration:** Serve images through CDN for global performance
- **Database Optimization:** Connection pooling and read replicas
- **Monitoring:** Application performance monitoring and error tracking

## Future Enhancements (Post-MVP)
- **Story Templates:** Pre-built story structures and themes
- **Collaborative Stories:** Share and collaborate on stories with other users
- **Voice Narration:** AI-generated voice narration for stories
- **Print Export:** High-quality PDF export for physical printing
- **Mobile App:** Native iOS/Android applications
- **Social Features:** Share stories and illustrations with community

---

This PRD provides a complete blueprint for rebuilding StoryTime AI with a focus on simplicity, modularity, and the new Gallery/separated generation requirements. The architecture is designed to be straightforward to implement while providing room for future expansion.