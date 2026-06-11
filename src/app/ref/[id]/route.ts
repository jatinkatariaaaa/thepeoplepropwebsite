import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const affiliateId = resolvedParams.id;
  
  // Redirect to home page
  const url = request.nextUrl.clone();
  url.pathname = '/';
  
  const response = NextResponse.redirect(url);
  
  // Set the cookie for 90 days
  response.cookies.set({
    name: 'tpp_affiliate',
    value: affiliateId,
    httpOnly: false, // Must be readable by client for signup tracking
    path: '/',
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });

  return response;
}
