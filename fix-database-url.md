# Fix DATABASE_URL for Local Development

The error `getaddrinfo ENOTFOUND postgres.railway.internal` indicates you're using Railway's internal connection string, which only works within Railway's network.

## How to get the correct DATABASE_URL:

1. **Go to Railway Dashboard**
   - Open your Railway project
   - Click on the PostgreSQL service

2. **Get the PUBLIC connection string**
   - In the Variables tab, you'll see two connection strings:
     - `DATABASE_URL` (internal - uses `postgres.railway.internal`)
     - `DATABASE_PUBLIC_URL` or similar
   
   OR
   
   - Go to the "Connect" tab
   - Look for "Public Network" connection details
   - Copy the connection string that uses the public host (not `.railway.internal`)

3. **Update .env.local**
   ```env
   # Replace with the PUBLIC Railway PostgreSQL URL
   DATABASE_URL="postgresql://postgres:password@your-db.railway.app:port/railway"
   ```

The public URL will have a format like:
- Host: `something.railway.app` (NOT `postgres.railway.internal`)
- Port: Usually a 5-digit number like `54321`

## Example format:
```
DATABASE_URL="postgresql://postgres:AbCdEfGhIjKlMnOp@viaduct.proxy.rlwy.net:54321/railway"
```

Once you update this, the database connection should work!