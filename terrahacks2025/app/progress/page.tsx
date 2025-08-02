'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';
import Link from 'next/link';

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Progress data state
  const [progressData, setProgressData] = useState({
    sessionsCompleted: 24,
    currentStreak: 7,
    exerciseCompletionRate: 85
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/progress');
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
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : 'Failed to load profile';
          setProfileError(errorMessage);
        } finally {
          setFetchingProfile(false);
        }
      })();
    }
  }, [user, loading, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Helper functions for progress calculations
  const getStreakMessage = (streak: number) => {
    if (streak >= 7) return "🔥 Amazing streak! You're on fire!";
    if (streak >= 5) return "🔥 Great consistency! Keep it up!";
    if (streak >= 3) return "🔥 Good start! Building momentum!";
    return "🔥 Start your streak today!";
  };

  if (loading || fetchingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null; // redirecting

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="group">
                <div className="relative">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    Freesio
                  </h1>
                  <h2 className="text-xl font-black text-black group-hover:scale-105 transition-transform duration-300">
                    Therapist
                  </h2>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </Link>
              
              <div className="flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
                >
                  Back to Dashboard
                </Link>
                
                {/* User Welcome Section */}
                {profile && (
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-white font-bold text-sm">{profile.name.charAt(0).toUpperCase()}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50 animate-dropdown">
                        <div className="p-4 border-b border-gray-100">
                          <p className="text-black font-semibold">{profile.name}</p>
                          <p className="text-black/60 text-sm">{user.email}</p>
                        </div>
                        
                        <div className="py-2">
                          <button
                            onClick={() => {
                              alert('Profile picture change feature coming soon!');
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-black hover:bg-blue-50/50 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Change Profile Picture</span>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await signOut();
                                router.push('/');
                              } catch (error) {
                                console.error('Error signing out:', error);
                              }
                            }}
                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50/50 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl font-bold text-black mb-4">Your Progress</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
            <p className="text-black/80 text-lg">Track your wellness journey and celebrate your achievements</p>
          </div>

          {/* Progress Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Sessions Completed */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-black mb-2">{progressData.sessionsCompleted}</h4>
                <p className="text-black/70 text-sm">Sessions Completed</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((progressData.sessionsCompleted / 30) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-black/50 mt-1">Goal: 30 sessions</p>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="text-2xl font-bold text-black mb-2">{progressData.currentStreak}</h4>
                <p className="text-black/70 text-sm">Day Streak</p>
                <p className="text-xs text-orange-600 font-medium mt-1">{getStreakMessage(progressData.currentStreak)}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((progressData.currentStreak / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-black/50 mt-1">Next milestone: 10 days</p>
              </div>
            </div>




          </div>

          {/* Progress Charts Section */}
          <div className="mb-12">


            {/* Exercise Completion */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <h4 className="text-2xl font-bold text-black mb-6">Exercise Completion Rate</h4>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-black">85%</span>
                    </div>
                  </div>
                </div>
                <p className="text-black/60 text-sm text-center">You're completing 85% of your assigned exercises</p>
              </div>
            </div>
          </div>






        </main>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
} 