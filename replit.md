# StoryTime AI - Personalized Bedtime Story Generator

## Overview

StoryTime AI is a web application that generates personalized bedtime stories for children using AI-powered text generation and image creation. The app creates unique, age-appropriate stories based on user inputs and preferences, targeting parents, guardians, and caregivers of children ages 3-12.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Theme Support**: next-themes for dark/light mode switching

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following conventional patterns
- **Development Setup**: tsx for development server with hot reloading

### Database & ORM
- **Database**: PostgreSQL (configured for Neon database)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Data Models
1. **Child Profiles**: Store child information including age, interests, reading level, and preferences
2. **Stories**: Generated story content with metadata, illustrations, and reading tracking
3. **Story Generation Requests**: Track AI generation requests and their status

### Core Features
1. **Profile Management**: Create and manage multiple child profiles with personalized preferences
2. **Story Generation**: AI-powered story creation using OpenRouter API with Claude-3-Haiku model
3. **Story Library**: Personal collection with favorites, search, and filtering capabilities
4. **Story Reader**: Enhanced reading experience with customizable text size and night mode
5. **Illustration System**: AI-generated images using Replicate API for visual storytelling

### UI/UX Components
- Responsive navigation with mobile-friendly sheet menu
- Child profile cards with avatar support
- Story cards with theme-based styling
- Form components with React Hook Form and Zod validation
- Loading states and error handling
- Toast notifications for user feedback

## Data Flow

### Story Generation Process
1. User selects active child profile
2. User configures story parameters (theme, length, interests, moral lessons)
3. System creates story generation request
4. Backend calls OpenRouter API to generate story content
5. Optional: Generate illustrations via Replicate API
6. Story is saved to database and displayed to user

### Profile Management
1. Users create child profiles with demographic and preference data
2. One profile can be set as "active" for streamlined story generation
3. Profile data influences story content and complexity

### Library Management
1. All generated stories are saved to user's personal library
2. Stories can be marked as favorites for quick access
3. Reading history is tracked (last read timestamp)
4. Search and filtering by theme, length, and other criteria

## External Dependencies

### AI Services
- **OpenRouter API**: Text generation using Claude-3-Haiku model for story content
- **Replicate API**: Image generation for story illustrations

### Core Libraries
- **React Ecosystem**: React 18+ with hooks and context
- **Form Handling**: React Hook Form with Zod schema validation
- **Date Handling**: date-fns for timestamp formatting
- **UI Primitives**: Extensive use of Radix UI components
- **Styling**: Tailwind CSS with custom color variables

### Development Tools
- **Build Tool**: Vite with React plugin and runtime error overlay
- **Type Checking**: TypeScript with strict configuration
- **Database**: Drizzle ORM with PostgreSQL dialect

## Deployment Strategy

### Build Process
1. Frontend: Vite builds React app to `/dist/public`
2. Backend: esbuild bundles server code to `/dist/index.js`
3. Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- API keys for OpenRouter and Replicate services
- Development/production environment detection

### Development Workflow
- Development server runs backend and frontend concurrently
- Hot reloading enabled for both client and server code
- Replit-specific plugins for development environment integration

### Storage Strategy
- Currently implements in-memory storage for development
- Database schema prepared for PostgreSQL deployment
- Session-based user data persistence (no authentication system currently)

The application follows a clean separation of concerns with shared TypeScript types, centralized API layer, and modular component structure suitable for scaling and maintenance.