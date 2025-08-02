"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase/client';

export default function AuthCallbackClient() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the hash-based callback from OAuth providers
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data?.session) {
          console.log('Successfully authenticated:', data.session.user);
          // Successfully authenticated - redirect to dashboard
          router.replace('/dashboard');
        } else {
          // Check if there are auth tokens in the URL hash
          if (window.location.hash.includes('access_token')) {
            // Wait a bit for Supabase to process the hash
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
                if (sessionError) {
                  router.replace('/login?error=' + encodeURIComponent(sessionError.message));
                } else if (sessionData?.session) {
                  router.replace('/dashboard');
                } else {
                  router.replace('/login?error=Could not create session');
                }
              });
            }, 1000);
          } else {
            // No session and no tokens in hash
            router.replace('/login?error=No authentication data received');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        router.replace('/login?error=' + encodeURIComponent(errorMessage));
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-black">Completing sign in...</p>
        <p className="mt-2 text-sm text-gray-600">Please wait while we authenticate you</p>
      </div>
    </div>
  );
}
