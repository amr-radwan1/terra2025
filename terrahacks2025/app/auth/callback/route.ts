import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)
  
  // Redirect to dashboard - the client-side auth provider will handle the session
  return NextResponse.redirect(`${origin}/dashboard`)
}
