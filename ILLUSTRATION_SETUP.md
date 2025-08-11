# Illustration Feature Setup Guide

This guide helps you set up and test the illustration generation features locally.

## Prerequisites

1. **Environment Variables** - Make sure your `.env.local` file includes:
   ```
   # Database (from Railway)
   DATABASE_URL=your-railway-postgres-url
   
   # API Keys
   OPENROUTER_API_KEY=sk-or-v1-your-key
   REPLICATE_API_TOKEN=r8_your-replicate-token
   
   # Local Development
   PORT=3001
   STORAGE_TYPE=local
   ```

2. **Get a Replicate API Token**:
   - Sign up at https://replicate.com
   - Go to https://replicate.com/account/api-tokens
   - Create a new token and add it to your `.env.local`

## Setup Steps

1. **Run Database Migrations**:
   ```bash
   node run-migrations.js
   ```
   This will add the necessary columns for illustration features.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 3001) and frontend (port 5173).

## Testing the Illustration Features

1. **Create a Child Profile** (if not already done):
   - Go to http://localhost:5173
   - Sign up/login
   - Create a child profile

2. **Generate a Story**:
   - Click "Generate Story"
   - Fill in the story parameters
   - Generate a story

3. **Test Illustration Generation**:
   - From the story view, click "Generate Illustrations"
   - Enter a scene description (e.g., "A brave knight standing in front of a magical castle")
   - Select scene type (Scene, Character, Setting, or Object)
   - Click "Generate 4 Variations"

4. **Collaborative Workflow**:
   - You'll see 4 different variations
   - Select your favorite
   - Choose to either:
     - **Make Canon**: Save this as the final illustration
     - **Iterate**: Generate 3 new variations based on your favorite

## Troubleshooting

### "Failed to generate illustrations"
- Check that `REPLICATE_API_TOKEN` is set correctly
- Verify you have credits on your Replicate account
- Check server logs for specific error messages

### "Failed to start illustration session"
- Ensure database migrations have been run
- Check that the `illustrations` table has the `session_id` column
- Verify PostgreSQL connection

### CORS errors
- Make sure the server is running on port 3001
- Clear browser cache and cookies
- Try accessing via http://127.0.0.1:5173 instead of localhost

### Image Storage Issues
- Check that the `storage/illustrations` directory exists
- Ensure proper write permissions on the storage directory
- Verify `STORAGE_TYPE=local` is set

## Development Tips

1. **Monitor Server Logs**: The server logs detailed information about image generation requests
2. **Check Network Tab**: Use browser DevTools to see API calls and responses
3. **Test Replicate Connection**: Visit http://localhost:3001/api/test-replicate

## Next Steps

Once illustrations are working:
1. Test the Gallery page to view all illustrations
2. Try linking illustrations to stories
3. Experiment with different art styles and prompts
4. Test the iteration workflow (up to 3 rounds)