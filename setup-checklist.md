# DreamWeaver Local Setup Checklist

## Required Credentials

### 1. PostgreSQL Database (Railway)
- [ ] Get DATABASE_URL from Railway dashboard
  - Go to your Railway project
  - Click on the PostgreSQL service
  - Go to "Variables" tab
  - Copy the DATABASE_URL value

### 2. OpenRouter API Key
- [ ] Get API key from https://openrouter.ai/
  - Sign up/login to OpenRouter
  - Go to API Keys section
  - Create a new API key
  - Add credits to your account for API usage

## Setup Steps

### 1. Create .env.local file
```bash
cp .env.local.example .env.local
```

### 2. Update .env.local with your credentials
```env
# Replace with your actual Railway PostgreSQL URL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.railway.app:PORT/railway"

# Replace with your OpenRouter API key
OPENROUTER_API_KEY="sk-or-v1-your-actual-key-here"

# Keep these as-is for local development
NODE_ENV=development
PORT=3000
SESSION_SECRET=dev-session-secret-change-in-production
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./storage
```

### 3. Install dependencies
```bash
# Run the setup script
./setup-local-dev.sh

# Or manually:
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 4. Create storage directories
```bash
mkdir -p storage/stories storage/illustrations storage/profiles storage/temp
```

### 5. Test database connection
```bash
cd server && npm run db:check
```

### 6. Start development servers
```bash
npm run dev
```

## Verify Everything Works

- [ ] Client runs on http://localhost:5173
- [ ] Server runs on http://localhost:3000
- [ ] Can access /api/health endpoint
- [ ] Database connection successful
- [ ] Can create user account
- [ ] Can log in
- [ ] Can create child profile
- [ ] Can generate a story

## Troubleshooting

### Database Connection Issues
- Make sure DATABASE_URL is copied exactly from Railway
- Check if your IP needs to be whitelisted (Railway usually doesn't require this)
- Ensure the Railway project is not sleeping

### OpenRouter Issues
- Verify API key starts with "sk-or-v1-"
- Check if you have credits in your OpenRouter account
- Test the key at https://openrouter.ai/playground

### Port Conflicts
- If port 3000 is in use, change PORT in .env.local
- If port 5173 is in use, check client/vite.config.ts