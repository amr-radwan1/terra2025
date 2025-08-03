'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';
import Link from 'next/link';

interface UserExercise {
  id: number;
  email: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  body_part: string;
}

interface ExerciseSession {
  id: string;
  day: string;
  date: string;
  exercises: UserExercise[];
  completed: boolean;
  sessionType: string;
}

interface WeeklyScheduleData {
  hasExercises: boolean;
  weeklySchedule: ExerciseSession[];
  totalExercises?: number;
  sessionsPerWeek?: number;
  message?: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleData | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/calendar');
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

      // Load weekly exercise schedule
      (async () => {
        setLoadingSchedule(true);
        setScheduleError(null);
        try {
          const response = await fetch(`/api/weekly-sessions?email=${encodeURIComponent(user.email)}`);
          if (!response.ok) {
            throw new Error('Failed to load weekly schedule');
          }
          const data = await response.json();
          if (data.success) {
            setWeeklySchedule(data.data);
          } else {
            setScheduleError(data.error);
          }
        } catch (error) {
          console.error('Error loading weekly schedule:', error);
          setScheduleError(error instanceof Error ? error.message : 'Failed to load schedule');
        } finally {
          setLoadingSchedule(false);
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

  const handleStartSession = async (session: ExerciseSession) => {
    if (!session.exercises || session.exercises.length === 0) {
      alert('No exercises found for this session');
      return;
    }

    try {
      // Get the first exercise and set up pose detection data
      const firstExercise = session.exercises[0];
      
      const response = await fetch('/api/exercise-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise: firstExercise
        })
      });

      if (!response.ok) {
        throw new Error('Failed to setup exercise');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to setup exercise');
      }

      // Create enhanced session data with pose detection setup
      const enhancedSession = {
        ...session,
        currentExerciseIndex: 0,
        exerciseSetupData: result.data, // The Gemini-generated pose detection data
        totalExercises: session.exercises.length,
        setupComplete: true // Flag to indicate setup is already done
      };

      // Store enhanced session data in both storages and redirect to physio coach
      // sessionStorage for immediate access, localStorage for persistence across refreshes
      sessionStorage.setItem('currentSession', JSON.stringify(enhancedSession));
      localStorage.setItem('currentSession', JSON.stringify(enhancedSession));
      router.push('/physio-coach');
      
    } catch (error) {
      console.error('Error setting up session:', error);
      alert('Failed to start session. Please try again.');
    }
  };

  const handleMarkComplete = async (session: ExerciseSession) => {
    if (!user?.email) return;
    
    setCompletingSession(session.id);
    setCompletionMessage(null);
    
    try {
      console.log('Marking session as complete:', { sessionId: session.id, userEmail: user.email });
      
      const response = await fetch('/api/complete-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          userEmail: user.email
        }),
      });

      const result = await response.json();
      console.log('Complete session response:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete session');
      }

      // Update the session in state to show as completed
      setWeeklySchedule(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          weeklySchedule: prev.weeklySchedule.map(s => 
            s.id === session.id ? { ...s, completed: true } : s
          )
        };
      });

      // Show success message
      setCompletionMessage(result.data.message);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setCompletionMessage(null);
      }, 5000);

    } catch (error) {
      console.error('Error completing session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to mark session as complete: ${errorMessage}`);
    } finally {
      setCompletingSession(null);
    }
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

  if (!profile?.bio_setup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Profile Setup Required</h2>
          <p className="text-black/70 mb-6">Please complete your profile setup first to access the calendar.</p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-200">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Completion Success Message */}
      {completionMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-lg">Session Completed!</p>
              <p className="text-sm opacity-90">{completionMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20">
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
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-black font-medium">Return to Dashboard</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-black font-semibold">Welcome back,</p>
                    <p className="text-black/80 text-sm">{profile.name}</p>
                  </div>
                  
                  {/* User Avatar with Dropdown */}
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
                          <Link href="/dashboard" className="block px-4 py-3 text-left text-black hover:bg-blue-50/50 transition-colors duration-200">
                            Dashboard
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                await signOut();
                                router.push('/');
                              } catch (error) {
                                console.error('Error signing out:', error);
                              }
                            }}
                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50/50 transition-colors duration-200"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <h3 className="text-3xl font-bold text-black mb-3">Your Exercise Schedule</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-3"></div>
            <p className="text-black/70 text-base">2 sessions per week to keep you on track</p>
          </div>

          {loadingSchedule ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
              <p className="mt-4 text-black">Loading your schedule...</p>
            </div>
          ) : scheduleError ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-black mb-3">Error Loading Schedule</h4>
              <p className="text-black/70 mb-6">{scheduleError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : !weeklySchedule?.hasExercises ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-black mb-3">No Exercises Found</h4>
              <p className="text-black/70 mb-6">Add some exercises to see your weekly schedule</p>
              <Link
                href="/exercises"
                className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
              >
                Add Exercises
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in-up-delayed">
              {/* Weekly Schedule Overview */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-black">This Week's Schedule</h4>
                  <div className="text-sm text-black/60">
                    {weeklySchedule.totalExercises} exercises • {weeklySchedule.sessionsPerWeek} sessions per week
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {weeklySchedule.weeklySchedule.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
                            {session.day} Session
                          </h5>
                          {/* <p className="text-sm text-black/60">{new Date(session.date).toLocaleDateString()}</p> */}
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          session.completed 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        } group-hover:scale-110 transition-transform duration-300`}>
                          {session.completed ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <p className="text-sm font-semibold text-black">Exercises ({session.exercises.length}):</p>
                        <div className="space-y-2">
                          {session.exercises.slice(0, 3).map((exercise, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-black/80">{exercise.name}</span>
                              <span className="text-black/60">{exercise.sets}×{exercise.reps}</span>
                            </div>
                          ))}
                          {session.exercises.length > 3 && (
                            <p className="text-xs text-black/60">+{session.exercises.length - 3} more exercises</p>
                          )}
                        </div>
                      </div>

                      {!session.completed ? (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleStartSession(session)}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            Start Session
                          </button>
                          <button
                            onClick={() => handleMarkComplete(session)}
                            disabled={completingSession === session.id}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {completingSession === session.id ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Marking Complete...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Mark as Complete</span>
                              </div>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold py-3 px-4 rounded-2xl text-center">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/exercises"
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-black group-hover:text-purple-600 transition-colors duration-300 mb-2">
                    Manage Exercises
                  </h5>
                  <p className="text-black/70 text-sm">Add, edit, or remove exercises from your routine</p>
                </Link>

                <Link
                  href="/progress"
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-black group-hover:text-green-600 transition-colors duration-300 mb-2">
                    View Progress
                  </h5>
                  <p className="text-black/70 text-sm">Track your improvement and achievements</p>
                </Link>

                <Link
                  href="/physio-coach"
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    Physio Coach
                  </h5>
                  <p className="text-black/70 text-sm">Get real-time guidance during exercises</p>
                </Link>
              </div>
            </div>
          )}
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
        
        @keyframes fade-in-up-delayed {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
          animation-delay: 0.2s;
        }
        
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-up-delayed { animation: fade-in-up-delayed 0.8s ease-out forwards; }
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}