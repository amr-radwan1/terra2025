'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    age: '',
    heightCm: '',
    weightKg: ''
  });

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
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : 'Failed to load profile';
          setProfileError(errorMessage);
        } finally {
          setFetchingProfile(false);
        }
      })();
    }
  }, [user, loading, router]);

  // Initialize edit form data when profile loads
  useEffect(() => {
    if (profile) {
      setEditFormData({
        age: profile.age?.toString() || '',
        heightCm: profile.height_cm ? profile.height_cm.toString() : '',
        weightKg: profile.weight_kg ? profile.weight_kg.toString() : ''
      });
    }
  }, [profile]);

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

  if (loading) {
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
  
  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-black">Loading your profile...</p>
        </div>
      </div>
    );
  }

  console.log(profile)
  
  if (!profile?.bio_setup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in-up">
              <Link href="/" className="inline-block mb-8 group">
                <div className="relative">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    Freesio
                  </h1>
                  <h2 className="text-3xl font-black text-black group-hover:scale-105 transition-transform duration-300">
                    Therapist
                  </h2>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </Link>
              
              <div className="space-y-3">
                <h3 className="text-4xl font-bold text-black mb-2">Complete Your Profile</h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
                <p className="text-black/80 text-lg">Let&apos;s personalize your therapy experience</p>
              </div>
            </div>

            {/* Profile Setup Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              {/* Card background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/50 rounded-3xl"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-black mb-2">Welcome, {user.email}</h4>
                  {profileError && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 mb-4">
                      <p className="text-red-600 text-sm">Profile error: {profileError}</p>
                    </div>
                  )}
                </div>

                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    const fd = new FormData(e.currentTarget as HTMLFormElement);

                    const name = String(fd.get("name") || "").trim();
                    const heightCm = Number(fd.get("heightCm"));
                    const weightKg = Number(fd.get("weightKg"));
                    const age = Number(fd.get("age"));
                    const gender = String(fd.get("gender") || "");
                    const fitness_level = String(fd.get("fitness_level") || "");

                    if (!name || !heightCm || !weightKg || !age) {
                      window.alert("Please fill all required fields.");
                      setIsSubmitting(false);
                      return;
                    }

                    try {
                      await ProfileService.setupProfile(
                        user.email,
                        name,
                        heightCm,   // cm
                        weightKg,   // kg
                        age,
                        gender,
                        fitness_level
                      );
                      // Refresh the page to show the updated profile
                      window.location.reload();
                    } catch (error) {
                      console.error("There was an error adding in Form: ", error);
                      window.alert("Failed to save profile. Please try again.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-black">
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70"
                        defaultValue={profile?.name ?? ""}
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Height and Weight Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="heightCm" className="block text-sm font-semibold text-black">
                        Height (cm)
                      </label>
                      <div className="relative group">
                        <input
                          id="heightCm"
                          name="heightCm"
                          type="number"
                          step="1"
                          min="50"
                          max="250"
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70"
                          defaultValue={profile?.height_cm ? profile.height_cm : ""}
                          placeholder="e.g., 175"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="weightKg" className="block text-sm font-semibold text-black">
                        Weight (kg)
                      </label>
                      <div className="relative group">
                        <input
                          id="weightKg"
                          name="weightKg"
                          type="number"
                          step="any"
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70"
                          defaultValue={profile?.weight_kg ? profile.weight_kg : ""}
                          placeholder="e.g., 70"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* Age Field */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-semibold text-black">
                      Age
                    </label>
                    <div className="relative group">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70"
                        defaultValue={profile?.age ?? ""}
                        placeholder="e.g., 25"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Gender Field */}
                  <div className="space-y-2">
                    <label htmlFor="gender" className="block text-sm font-semibold text-black">
                      Gender
                    </label>
                    <div className="relative group">
                      <select 
                        id="gender"
                        name="gender" 
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70 appearance-none"
                      >
                        <option value="">Select gender...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Fitness Level Field */}
                  <div className="space-y-2">
                    <label htmlFor="fitness_level" className="block text-sm font-semibold text-black">
                      Fitness Level
                    </label>
                    <div className="relative group">
                      <select 
                        id="fitness_level"
                        name="fitness_level" 
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black bg-white/50 backdrop-blur-sm group-hover:border-blue-300 group-hover:bg-white/70 appearance-none"
                      >
                        <option value="">Select fitness level...</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving Profile...
                        </>
                      ) : (
                        <>
                          Complete Profile Setup
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
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
          
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
          .animate-fade-in-up-delayed { animation: fade-in-up-delayed 0.8s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  // Profile is set up - show main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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
                          <button
                            onClick={() => {
                              // TODO: Implement profile picture change
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-4xl font-bold text-black mb-4">Your Therapy Dashboard</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
            <p className="text-black/80 text-lg">Ready to start your wellness journey</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Therapy Sessions Card */}
            <div className="group h-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-white/20 relative overflow-hidden animate-card-slide-in h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-300/10 to-red-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h4 className="text-2xl font-bold text-black mb-3 group-hover:text-purple-600 transition-colors duration-300">Therapy Sessions</h4>
                <p className="text-black/70 mb-6">Start your AI-powered therapy sessions and track your progress</p>

                <div className="inline-flex items-center justify-center w-full text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300 mt-auto">
                    Start Session
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
                </div>
            </div>
            </div>

            {/* Planning Card */}
            <div className="group">
              <Link href="/calendar">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-white/20 relative overflow-hidden animate-card-slide-in-delayed">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    <h4 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      Planning
                    </h4>
                    <p className="text-black/70 mb-6">
                      View your personalized exercise schedule and upcoming therapy sessions
                    </p>
                    
                    <div className="inline-flex items-center justify-center w-full text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                      View Calendar
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Ailments Card */}
            <div className="group h-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-white/20 relative overflow-hidden animate-card-slide-in-delayed-2 h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>

                <h4 className="text-2xl font-bold text-black mb-3 group-hover:text-indigo-600 transition-colors duration-300">Ailments</h4>
                <p className="text-black/70 mb-6">Track your symptoms and get personalized treatment recommendations</p>

                <Link
                    href="/ailments"
                    className="inline-flex items-center justify-center w-full text-indigo-600 font-semibold group-hover:text-indigo-700 transition-colors duration-300 mt-auto"
                >
                    Manage Ailments
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
                </div>
            </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/50 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h4 className="text-2xl font-bold text-black">Your Profile Summary</h4>
                  {isEditingProfile && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editing</span>
                    </div>
                  )}
                </div>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        // Validate input values
                        const age = Number(editFormData.age);
                        const heightCm = Number(editFormData.heightCm);
                        const weightKg = Number(editFormData.weightKg);

                        if (!age || age < 1 || age > 120) {
                          alert('Please enter a valid age between 1 and 120');
                          return;
                        }

                        if (!heightCm || heightCm < 50 || heightCm > 250) {
                          alert('Please enter a valid height between 0.5 and 2.5 meters');
                          return;
                        }

                        if (!weightKg || weightKg < 20 || weightKg > 300) {
                          alert('Please enter a valid weight between 20 and 300 kg');
                          return;
                        }

                        try {
                          setIsSubmitting(true);
                          await ProfileService.updateProfileFields(
                            user.email,
                            heightCm,
                            weightKg,
                            age
                          );
                          
                          // Update local profile state
                          if (profile) {
                            setProfile({
                              ...profile,
                              age: Number(editFormData.age),
                              height_cm: Number(editFormData.heightCm),
                              weight_kg: Number(editFormData.weightKg)
                            });
                          }
                          
                          setIsEditingProfile(false);
                        } catch (error) {
                          console.error('Error updating profile:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                          alert(`Failed to update profile: ${errorMessage}`);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        // Reset form data to original values
                        if (profile) {
                          setEditFormData({
                            age: profile.age?.toString() || '',
                            heightCm: profile.height_cm ? profile.height_cm.toString() : '',
                            weightKg: profile.weight_kg ? profile.weight_kg.toString() : ''
                          });
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-black/60 text-sm">Name</p>
                  <p className="text-black font-semibold">{profile.name}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-black/60 text-sm">Age</p>
                  {isEditingProfile ? (
                    <input
                      type="number"
                      value={editFormData.age}
                      onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                      className="w-full text-center text-black font-semibold bg-white/80 backdrop-blur-sm border-2 border-blue-300 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Age"
                      min="1"
                      max="120"
                    />
                  ) : (
                    <p className="text-black font-semibold">{profile.age} years</p>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-black/60 text-sm">Height</p>
                  {isEditingProfile ? (
                    <input
                      type="number"
                      step="1"
                      value={editFormData.heightCm}
                      onChange={(e) => setEditFormData({...editFormData, heightCm: e.target.value})}
                      className="w-full text-center text-black font-semibold bg-white/80 backdrop-blur-sm border-2 border-blue-300 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Height (cm)"
                      min="50"
                      max="250"
                    />
                  ) : (
                    <p className="text-black font-semibold">{profile.height_cm} cm</p>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <p className="text-black/60 text-sm">Weight</p>
                  {isEditingProfile ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editFormData.weightKg}
                      onChange={(e) => setEditFormData({...editFormData, weightKg: e.target.value})}
                      className="w-full text-center text-black font-semibold bg-white/80 backdrop-blur-sm border-2 border-blue-300 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Weight (kg)"
                      min="20"
                      max="300"
                    />
                  ) : (
                    <p className="text-black font-semibold">{profile.weight_kg} kg</p>
                  )}
                </div>
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
        
        @keyframes fade-in-up-delayed {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
          animation-delay: 0.2s;
        }
        
        @keyframes card-slide-in {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes card-slide-in-delayed {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
          animation-delay: 0.2s;
        }
        
        @keyframes card-slide-in-delayed-2 {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
          animation-delay: 0.4s;
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
        .animate-card-slide-in { animation: card-slide-in 0.8s ease-out forwards; }
        .animate-card-slide-in-delayed { animation: card-slide-in-delayed 0.8s ease-out forwards; }
        .animate-card-slide-in-delayed-2 { animation: card-slide-in-delayed-2 0.8s ease-out forwards; }
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
