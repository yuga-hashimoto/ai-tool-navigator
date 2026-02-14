// Client-side error logging
export async function logClientError(error: Error, context?: any) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        url: typeof window !== 'undefined' ? window.location.href : '',
        severity: 'HIGH',
        category: 'FRONTEND',
      }),
    });
  } catch (e) {
    // Fail silently to avoid infinite loops if error reporting fails
    console.error('Failed to report error:', e);
  }
}
