# StoryTime AI v2.0

A simplified and modular rebuild of StoryTime AI with separated story generation, illustration creation, and comprehensive gallery management.

## Features

- **Separated Content Creation**: Story generation and illustration generation are completely separate workflows
- **Gallery System**: Dedicated gallery for storing, viewing, and managing all illustrations
- **Flexible Linking**: Stories and illustrations can be linked together in various combinations
- **Child Profiles**: Personalized content based on child preferences and reading levels
- **JWT Authentication**: Secure user authentication and session management

## Architecture

### Frontend (Client)
- React 18 with TypeScript
- Tailwind CSS for styling
- TanStack Query for server state management
- Wouter for lightweight routing

### Backend (Server)
- Node.js with Express.js
- TypeScript
- JWT authentication
- Supabase for database and file storage

### External Services
- OpenRouter API for story generation
- OpenAI DALL-E 3 for illustration generation
- Supabase for PostgreSQL database and file storage

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. **Set up database:**
   - Create a new Supabase project
   - Run the SQL script in `docs/database-schema.sql` in your Supabase SQL editor
   - Update your `.env` file with Supabase credentials

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts both the client (port 5173) and server (port 3000).

### Individual Commands

- **Client only:** `npm run dev:client`
- **Server only:** `npm run dev:server`
- **Build:** `npm run build`
- **Test:** `npm test`
- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`

## Project Structure

```
v2.0/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── tests/              # Server tests
├── shared/                 # Shared types and constants
│   ├── types/              # Shared TypeScript types
│   ├── constants/          # Shared constants
│   └── schemas/            # Validation schemas
└── docs/                   # Documentation
    ├── PRD.md              # Product Requirements Document
    └── database-schema.sql # Database setup script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Child Profiles
- `GET /api/profiles` - List child profiles
- `POST /api/profiles` - Create child profile
- `PUT /api/profiles/:id` - Update child profile
- `DELETE /api/profiles/:id` - Delete child profile
- `POST /api/profiles/:id/activate` - Set active profile

### Stories
- `GET /api/stories` - List stories
- `POST /api/stories/generate` - Generate story with AI
- `POST /api/stories` - Create story manually
- `GET /api/stories/:id` - Get story details
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story

### Illustrations
- `GET /api/illustrations` - Gallery view (list illustrations)
- `POST /api/illustrations/generate` - Generate illustration with AI
- `POST /api/illustrations` - Upload custom illustration
- `GET /api/illustrations/:id` - Get illustration details
- `PUT /api/illustrations/:id` - Update illustration metadata
- `DELETE /api/illustrations/:id` - Delete illustration

### Story-Illustration Linking
- `GET /api/stories/:id/illustrations` - Get story illustrations
- `POST /api/stories/:id/illustrations` - Link illustration to story
- `DELETE /api/stories/:storyId/illustrations/:illustrationId` - Unlink
- `PUT /api/stories/:id/illustrations/order` - Reorder illustrations

## Development

### Database Schema
The database schema is defined in `docs/database-schema.sql`. Key tables:
- `users` - User accounts
- `child_profiles` - Child profile information
- `stories` - Story content (text only)
- `illustrations` - Illustration metadata and file paths
- `story_illustrations` - Many-to-many linking table

### Type Safety
The project uses TypeScript throughout with shared type definitions in the `shared/` directory. This ensures type safety between client and server.

### State Management
- Server state: TanStack Query
- Authentication state: React Context
- UI state: React useState/useReducer

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connections
- API keys
- JWT secrets
- CORS origins

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure type safety throughout

## License

Private project for StoryTime AI development.