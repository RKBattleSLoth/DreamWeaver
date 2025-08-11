# DreamWeaver Local Development Setup

This guide helps you set up a local development environment that maintains compatibility with Railway deployment.

## Quick Start

1. **Copy environment configuration**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update `.env.local` with your credentials**
   - PostgreSQL Database URL (DATABASE_URL) - use Railway's PostgreSQL instance
   - OpenRouter API key (OPENROUTER_API_KEY)

3. **Run setup script**
   ```bash
   ./setup-local-dev.sh
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## Environment Configuration

### Local Storage (Development)
Files are stored locally in `./storage/` directory by default. Set `STORAGE_TYPE=cloud` when deploying to Railway with cloud storage.

### DALL-E 3 Configuration
For illustration generation, we use OpenRouter's DALL-E 3 access:
```
OPENROUTER_DALLE3_MODEL=openai/dall-e-3
```

## Railway Compatibility

The local setup maintains Railway compatibility by:

1. **Same build commands**: `npm install && npm run build`
2. **Same start command**: `npm start`
3. **Same environment variables**: All Railway env vars work locally
4. **Same route structure**: `/api/health`, authentication, etc.
5. **PostgreSQL database**: Direct connection to Railway's PostgreSQL
6. **File storage abstraction**: Local files in dev, cloud storage in production

## Development Features

### Hot Reload
Both client and server support hot reload in development mode.

### Local File Storage
When `STORAGE_TYPE=local`, files are served from `/api/storage/:bucket/:path`

### Disabled Rate Limiting
Rate limiting is disabled in development for faster iteration.

### Debug Logging
Set `LOG_LEVEL=debug` for verbose logging.

## Testing Railway Deployment Locally

1. **Build test**
   ```bash
   npm run build
   ```

2. **Production-like test**
   ```bash
   NODE_ENV=production npm start
   ```

3. **Environment validation**
   The server validates all required environment variables on startup.

## Troubleshooting

### Database Connection
- Ensure DATABASE_URL is correctly set (get from Railway dashboard)
- Check PostgreSQL connection string format
- Verify network connectivity to Railway's database

### Storage Issues
- Check storage directory permissions
- Ensure `./storage/` directory exists
- Verify STORAGE_TYPE is set to 'local' for development

### Authentication
- Set `ENFORCE_AUTH_IN_DEV=false` for easier development
- Use `ADMIN_EMAILS` to set admin users

## Next Steps

After setup, you're ready to implement:
1. DALL-E 3 illustration generation
2. Gallery system for illustrations
3. Story-illustration linking
4. Beautiful story reader interface
5. Advanced storytelling AI