// Safe logging utility that prevents sensitive data from being logged

export function logError(message: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`${message}:`, error.message);
  } else if (typeof error === 'string') {
    console.error(`${message}:`, error);
  } else {
    console.error(`${message}:`, 'Unknown error');
  }
}

export function logInfo(message: string, data?: any): void {
  if (data && typeof data === 'object') {
    // Only log safe, non-sensitive data
    const safeData = JSON.stringify(data, (key, value) => {
      // Filter out potential secrets
      if (typeof key === 'string' && /^(password|secret|key|token|auth)/i.test(key)) {
        return '[REDACTED]';
      }
      return value;
    });
    console.log(`${message}:`, safeData);
  } else {
    console.log(message, data);
  }
}