'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';
import { supabase } from '@/supabase/client';

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
  created_at?: string;
}

export default function ExercisesPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [exercises, setExercises] = useState<UserExercise[]>([]);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const [activeId, setActiveId] = useState<number | null>(null);
  const active = useMemo(
    () => exercises.find((i) => i.id === activeId) ?? null,
    [exercises, activeId]
  );

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    difficulty_level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    body_part: '',
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add modal state
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    difficulty_level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    body_part: '',
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/exercises');
    }
  }, [user, loading, router]);

  // Load exercises
  const loadExercises = async (email: string) => {
    setFetching(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from('user_exercises')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExercises(data || []);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load exercises');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.email) {
      loadExercises(user.email);
      
      // Load user profile
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
  }, [loading, user]);

  const closeModal = () => {
    setActiveId(null);
    setEditMode(false);
    setForm({
      name: '',
      description: '',
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      difficulty_level: 'BEGINNER',
      body_part: '',
    });
  };

  const openModal = (exercise: UserExercise) => {
    setActiveId(exercise.id);
    setForm({
      name: exercise.name,
      description: exercise.description,
      sets: exercise.sets,
      reps: exercise.reps,
      rest_seconds: exercise.rest_seconds,
      difficulty_level: exercise.difficulty_level,
      body_part: exercise.body_part,
    });
    setEditMode(false);
  };

  const onSave = async () => {
    if (!user?.email || !active) return;
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('user_exercises')
        .update({
          name: form.name,
          description: form.description,
          sets: form.sets,
          reps: form.reps,
          rest_seconds: form.rest_seconds,
          difficulty_level: form.difficulty_level,
          body_part: form.body_part,
        })
        .eq('id', active.id)
        .eq('email', user.email)
        .select()
        .single();

      if (error) throw error;
      
      // Update the exercise in existing incomplete sessions
      try {
        const response = await fetch('/api/update-exercise-in-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: active.id,
            userEmail: user.email,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          console.error('Failed to update exercise in sessions:', result.error);
          // Continue with the flow even if session update fails
        } else {
          console.log('Exercise updated in sessions:', result.message);
        }
      } catch (sessionError) {
        console.error('Error updating sessions:', sessionError);
        // Continue with the flow even if session update fails
      }
      
      setExercises((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setEditMode(false);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!user?.email || !active) return;
    if (!confirm('Delete this exercise? This cannot be undone.')) return;
    try {
      setDeleting(true);
      
      // First, remove the exercise from existing incomplete sessions
      try {
        const response = await fetch('/api/remove-exercise-from-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: active.id,
            userEmail: user.email,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          console.error('Failed to remove exercise from sessions:', result.error);
          // Continue with deletion even if session update fails
        } else {
          console.log('Exercise removed from sessions:', result.message);
        }
      } catch (sessionError) {
        console.error('Error removing exercise from sessions:', sessionError);
        // Continue with deletion even if session update fails
      }
      
      const { error } = await supabase
        .from('user_exercises')
        .delete()
        .eq('id', active.id)
        .eq('email', user.email);

      if (error) throw error;
      setExercises((prev) => prev.filter((p) => p.id !== active.id));
      closeModal();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Add handler
  const onAdd = async () => {
    if (!user?.email) return;
    if (!addForm.name.trim()) {
      alert('Please enter an exercise name.');
      return;
    }
    try {
      setAdding(true);
      const { data, error } = await supabase
        .from('user_exercises')
        .insert({
          email: user.email,
          name: addForm.name,
          description: addForm.description,
          sets: addForm.sets,
          reps: addForm.reps,
          rest_seconds: addForm.rest_seconds,
          difficulty_level: addForm.difficulty_level,
          body_part: addForm.body_part,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add the exercise to existing incomplete sessions
      try {
        const response = await fetch('/api/add-exercise-to-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: data.id,
            userEmail: user.email,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          console.error('Failed to add exercise to sessions:', result.error);
          // Continue with the flow even if session update fails
        } else {
          console.log('Exercise added to sessions:', result.message);
        }
      } catch (sessionError) {
        console.error('Error updating sessions:', sessionError);
        // Continue with the flow even if session update fails
      }
      
      // Refresh list
      await loadExercises(user.email);
      // Reset & close
      setAddForm({
        name: '',
        description: '',
        sets: 3,
        reps: 10,
        rest_seconds: 60,
        difficulty_level: 'BEGINNER',
        body_part: '',
      });
      setAddOpen(false);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to add exercise');
    } finally {
      setAdding(false);
    }
  };

  if (loading || fetching || fetchingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <div className="relative">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Freesio
              </h1>
              <h2 className="text-xl font-black text-black">Therapist</h2>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h3 className="text-4xl font-bold text-black mb-2">Your Exercises</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
            {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
          </div>

          <div className="hidden md:block">
            <button
              onClick={() => setAddOpen(true)}
              className="ml-6 px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow"
            >
              + Add Exercise
            </button>
          </div>
        </div>

        {/* Also show Add button on small screens */}
        <div className="md:hidden mb-6 flex justify-center">
          <button
            onClick={() => setAddOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
          >
            + Add Exercise
          </button>
        </div>

        {/* Exercises Grid */}
        {exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-black mb-3">No Exercises Yet</h4>
            <p className="text-black/70 mb-6">Add your prescribed exercises to get started with your therapy sessions</p>
            <button
              onClick={() => setAddOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
            >
              Add Your First Exercise
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                onClick={() => openModal(exercise)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    exercise.difficulty_level === 'BEGINNER' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                    exercise.difficulty_level === 'INTERMEDIATE' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    'bg-gradient-to-br from-red-400 to-pink-500'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    exercise.difficulty_level === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                    exercise.difficulty_level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {exercise.difficulty_level}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-black mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {exercise.name}
                </h4>
                
                {exercise.body_part && (
                  <p className="text-sm text-black/60 mb-3">
                    Target: {exercise.body_part}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-black/70 mb-3">
                  <span>{exercise.sets} sets</span>
                  <span>{exercise.reps} reps</span>
                  <span>{exercise.rest_seconds}s rest</span>
                </div>

                {exercise.description && (
                  <p className="text-black/70 text-sm line-clamp-2">
                    {exercise.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* View/Edit Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-[95vw] max-w-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-2xl font-bold text-black">Exercise Details</h5>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {!editMode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-black/60 text-sm">Exercise Name</p>
                  <p className="text-black font-semibold text-lg">{active.name}</p>
                </div>
                
                {active.body_part && (
                  <div>
                    <p className="text-black/60 text-sm">Target Body Part</p>
                    <p className="text-black font-semibold">{active.body_part}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-black/60 text-sm">Sets</p>
                    <p className="text-black font-semibold">{active.sets}</p>
                  </div>
                  <div>
                    <p className="text-black/60 text-sm">Reps</p>
                    <p className="text-black font-semibold">{active.reps}</p>
                  </div>
                  <div>
                    <p className="text-black/60 text-sm">Rest (seconds)</p>
                    <p className="text-black font-semibold">{active.rest_seconds}</p>
                  </div>
                </div>

                <div>
                  <p className="text-black/60 text-sm">Difficulty Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    active.difficulty_level === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                    active.difficulty_level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {active.difficulty_level}
                  </span>
                </div>

                {active.description && (
                  <div>
                    <p className="text-black/60 text-sm">Description</p>
                    <p className="text-black font-semibold whitespace-pre-wrap">{active.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Shoulder Flexion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Target Body Part
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={form.body_part}
                    onChange={(e) => setForm({ ...form, body_part: e.target.value })}
                    placeholder="e.g., Shoulder, Knee, Back"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                      value={form.sets}
                      onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                      value={form.reps}
                      onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1">
                      Rest (sec)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                      value={form.rest_seconds}
                      onChange={(e) => setForm({ ...form, rest_seconds: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={form.difficulty_level}
                    onChange={(e) => setForm({ ...form, difficulty_level: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Notes about this exercise, technique tips, etc."
                  />
                </div>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between">
              {!editMode ? (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
                    >
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 transition disabled:opacity-60"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-2xl font-bold text-black">Add New Exercise</h5>
              <button
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onAdd();
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g., Shoulder Flexion, Bicep Curl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Target Body Part
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                  value={addForm.body_part}
                  onChange={(e) => setAddForm({ ...addForm, body_part: e.target.value })}
                  placeholder="e.g., Shoulder, Knee, Back, Arm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Sets *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={addForm.sets}
                    onChange={(e) => setAddForm({ ...addForm, sets: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Reps *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={addForm.reps}
                    onChange={(e) => setAddForm({ ...addForm, reps: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Rest (sec) *
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={addForm.rest_seconds}
                    onChange={(e) => setAddForm({ ...addForm, rest_seconds: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Difficulty Level
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                  value={addForm.difficulty_level}
                  onChange={(e) => setAddForm({ ...addForm, difficulty_level: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                  rows={3}
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Notes about this exercise, technique tips, any special instructions..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60"
                >
                  {adding ? 'Adding...' : 'Add Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Animations and Styles */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
