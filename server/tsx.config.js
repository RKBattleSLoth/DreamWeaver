// TSX configuration for better module resolution
export default {
  // Enable TypeScript path mapping
  tsconfig: './tsconfig.json',
  
  // Module resolution options
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx']
    }
  }
};