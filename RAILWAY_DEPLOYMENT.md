# Railway Deployment Guide for DreamWeaver

This guide explains how to deploy the DreamWeaver application on Railway with PostgreSQL instead of Supabase.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub account (for automatic deployments)
3. OpenRouter API key (optional, for AI features)

## Step 1: Set Up Railway Project

1. Log into Railway dashboard
2. Create a new project
3. Choose "Deploy from GitHub repo" and connect your repository

## Step 2: Provision PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance and inject the `DATABASE_URL` environment variable

## Step 3: Run Database Migrations

1. Open the Railway PostgreSQL service
2. Click on "Query" tab or connect using the provided connection string
3. Copy and run the SQL from `docs/railway-database-schema.sql`

## Step 4: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Required Variables:
```
NODE_ENV=production
USE_POSTGRES=true
SESSION_SECRET=[generate with: openssl rand -base64 64]
```

### Optional API Keys (for AI features):
```
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Storage Configuration:
```
STORAGE_TYPE=local
UPLOAD_DIR=uploads
```

### CORS Configuration:
```
CORS_ORIGIN=https://your-frontend-domain.railway.app
```

### Rate Limiting (optional):
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 5: Deploy the Application

Railway will automatically deploy when you:
1. Push to your connected GitHub repository
2. Or manually trigger a deployment from the Railway dashboard

## Step 6: Set Up Frontend

Deploy the frontend separately:
1. Create another service in the same Railway project
2. Configure it to serve the client directory
3. Set the API URL environment variable to point to your backend service

## Step 7: Verify Deployment

1. Check the health endpoint: `https://your-app.railway.app/health`
2. Test the API health: `https://your-app.railway.app/api/health`
3. Create a test user account
4. Test basic functionality (login, create profiles, etc.)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string (auto-injected by Railway) | Yes |
| USE_POSTGRES | Set to 'true' to use PostgreSQL instead of Supabase | Yes |
| SESSION_SECRET | JWT secret key for authentication | Yes |
| OPENROUTER_API_KEY | For AI story generation | No |
| STORAGE_TYPE | 'local', 's3', or 'cloudinary' | No |
| CORS_ORIGIN | Comma-separated list of allowed origins | Yes |
| PORT | Server port (Railway sets this automatically) | Auto |

## Local Testing with Railway Database

To test locally with your Railway PostgreSQL:

1. Copy the DATABASE_URL from Railway dashboard
2. Create a `.env` file:
```env
DATABASE_URL=postgresql://...
USE_POSTGRES=true
SESSION_SECRET=your-secret
```
3. Run: `npm run dev`

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is properly set
- Check that USE_POSTGRES=true is set
- Verify the database schema has been applied

### Storage Issues
- For production, consider using S3 or Cloudinary instead of local storage
- Local storage on Railway is ephemeral and will be lost on redeploy

### CORS Errors
- Update CORS_ORIGIN to include your frontend domain
- Separate multiple origins with commas

## Migration from Supabase

The application has been modified to work with both Supabase and standard PostgreSQL. Key changes:

1. **Database**: Uses standard PostgreSQL queries instead of Supabase client
2. **Authentication**: Uses JWT tokens directly instead of Supabase Auth
3. **Storage**: Uses local file system or cloud storage instead of Supabase Storage
4. **RLS**: Row-level security is handled in application code instead of database policies

## Next Steps

1. Set up proper file storage (S3 or Cloudinary recommended for production)
2. Configure monitoring and logging
3. Set up custom domain
4. Enable auto-scaling if needed
5. Configure backup strategy for database

## Support

For issues specific to this Railway deployment:
1. Check Railway logs for errors
2. Verify all environment variables are set correctly
3. Ensure database migrations have been run
4. Test API endpoints individually to isolate issues