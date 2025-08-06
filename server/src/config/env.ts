// Railway provides environment variables directly - no .env file needed
console.log('Environment variables loaded from Railway platform');

// List available environment variables for debugging
console.log('Available env vars:', Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('PG')
));

export {};