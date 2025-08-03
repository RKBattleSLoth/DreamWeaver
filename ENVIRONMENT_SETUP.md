# Environment Setup

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual values:

### Required Environment Variables

#### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key (safe for frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (backend only, NEVER expose)
- `DATABASE_URL`: Your Supabase PostgreSQL connection string

Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

#### OpenRouter API
- `OPENROUTER_API_KEY`: Your OpenRouter API key for AI story generation
Get this from: https://openrouter.ai/

#### Security
- `SESSION_SECRET`: Generate with `openssl rand -base64 64`

## Security Best Practices

1. **NEVER commit `.env` files** to version control
2. **NEVER hardcode API keys** in your source code
3. **Always use environment variables** for sensitive data
4. **Rotate keys immediately** if they are exposed
5. **Use different keys** for development and production

## Supabase Key Rotation

If a key is compromised:
1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Click "Roll new key" for the compromised key
4. Update your `.env` file with the new key
5. Restart your application

## Development vs Production

- Development: Set `NODE_ENV=development` and `ENFORCE_AUTH_IN_DEV=false`
- Production: Set `NODE_ENV=production` and use secure key management (AWS Secrets Manager, etc.)