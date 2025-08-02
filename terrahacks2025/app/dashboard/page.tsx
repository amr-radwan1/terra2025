'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/dashboard');
      return;
    }

    if (!loading && user?.email) {
      (async () => {
        setFetchingProfile(true);
        setProfileError(null);
        try {
          const result = await ProfileService.getProfileByEmail(user.email);
          if (result) {
            setProfile(result);
          } else {
            setProfileError('Profile not found');
          }
        } catch (e: any) {
          setProfileError(e.message || 'Failed to load profile');
        } finally {
          setFetchingProfile(false);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading auth...</div>;
  if (!user) return null; // redirecting
  if (fetchingProfile) return <div>Loading profile...</div>;

  console.log(profile)
  if (! profile?.bio_setup){
    return (
        <div className="p-6">
        <h1 className="text-xl font-bold">Welcome, {user.email}</h1>
        {profileError && (
            <p className="text-red-600 text-sm">Profile error: {profileError}</p>
        )}
        <p>Your name is: {profile?.name ?? 'NULL'}</p>
        <p>Your email: {profile?.email ?? 'NULL'}</p>

        
        {/* other profile fields */}
        </div>
        );
    }
    else {
        return (
            <div>Welcom Back {profile.name}! You have setup finished, you can now nav to bio data, and ailments</div>
        );
    }
}
