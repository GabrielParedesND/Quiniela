import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow /preview to be embedded in iframes from CMS domains
  if (request.nextUrl.pathname === '/preview') {
    response.headers.delete('X-Frame-Options');
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'self' http://localhost:* https://localhost:* https://*.cloudfront.net https://admin-quiniela.nuestrodiario.com.gt"
    );
  }

  return response;
}

export const config = {
  matcher: ['/preview'],
};
