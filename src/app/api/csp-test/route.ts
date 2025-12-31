import { NextResponse } from 'next/server';

// CSP Test endpoint to verify headers are working correctly
export async function GET() {
  const headers = new Headers();
  
  // Add test CSP header that should be overridden by middleware
  headers.set('X-Test-CSP', 'original');
  
  return NextResponse.json({ 
    status: 'CSP test successful',
    timestamp: new Date().toISOString(),
    message: 'If you see this, CSP headers are not blocking the response',
    environment: process.env.NODE_ENV,
    test: 'This response should work with CSP headers applied'
  }, { headers });
}