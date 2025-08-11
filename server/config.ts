import { config as dotenvConfig } from 'dotenv';
import { z } from "zod";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local or .env.railway in development
if (process.env.NODE_ENV !== 'production') {
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  const envRailwayPath = path.resolve(__dirname, '../.env.railway');
  
  if (fs.existsSync(envLocalPath)) {
    dotenvConfig({ path: envLocalPath });
  } else if (fs.existsSync(envRailwayPath)) {
    console.log('Loading .env.railway file');
    dotenvConfig({ path: envRailwayPath });
  } else {
    console.log('No .env.local or .env.railway found - using system environment variables');
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3001"),
  DATABASE_URL: z.string().min(1, "PostgreSQL DATABASE_URL is required"),
  
  // API Keys
  OPENROUTER_API_KEY: z.string().min(1, "OpenRouter API key is required"),
  REPLICATE_API_TOKEN: z.string().optional(),
  
  // Security
  SESSION_SECRET: z.string().min(32, "Session secret should be at least 32 characters"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),
  
  // Authentication
  ENFORCE_AUTH_IN_DEV: z.string().transform(val => val === "true").default("false"),
  ADMIN_EMAILS: z.string().optional(),
  
  // Content Safety
  CONTENT_MODERATION_ENABLED: z.string().transform(val => val === "true").default("true"),
  
  // Email Configuration
  EMAIL_SERVICE: z.enum(["gmail", "smtp", "ethereal", "disabled"]).default("disabled"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_SECURE: z.string().transform(val => val === "true").optional(),
  EMAIL_FROM: z.string().optional(),
  
  // Application Configuration
  APP_URL: z.string().default("http://localhost:3002"),
  
  // HTTPS Configuration
  HTTPS_PORT: z.string().transform(Number).optional(),
  FORCE_HTTPS: z.string().transform(val => val === "true").default("false"),
  
  // Monitoring Configuration
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  ENABLE_METRICS: z.string().transform(val => val === "true").default("false"),
  
  // Storage Configuration (for local development)
  STORAGE_TYPE: z.enum(["local", "cloud"]).default("local"),
  LOCAL_STORAGE_PATH: z.string().default("./storage"),
  
  // DALL-E 3 Configuration
  OPENROUTER_DALLE3_MODEL: z.string().default("openai/dall-e-3"),
});

let config: z.infer<typeof envSchema>;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  process.exit(1);
}

// Validate critical production requirements
if (config.NODE_ENV === "production") {
  if (!config.DATABASE_URL) {
    console.error("❌ DATABASE_URL is required in production");
    process.exit(1);
  }
  
  if (config.SESSION_SECRET.length < 64) {
    console.error("❌ SESSION_SECRET should be at least 64 characters in production");
    process.exit(1);
  }
}

export { config };