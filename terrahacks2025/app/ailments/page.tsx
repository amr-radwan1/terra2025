"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService, MedicalCondition, UserProfile } from "@/service/ProfileService";

export default function AilmentsPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [items, setItems] = useState<MedicalCondition[]>([]);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const [activeId, setActiveId] = useState<number | null>(null);
  const active = useMemo(
    () => items.find((i) => i.id === activeId) ?? null,
    [items, activeId]
  );

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    is_physio: true,
    location_on_body: "",
    description: "",
    pain_level: 1,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingExercise, setGeneratingExercise] = useState(false);

  // --- NEW: Add modal state ---
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    is_physio: true,
    location_on_body: "",
    description: "",
    pain_level: 1,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/ailments");
    }
  }, [user, loading, router]);

  // Load ailments
  const loadAilments = async (email: string) => {
    setFetching(true);
    setErr(null);
    try {
      const data = await ProfileService.getMedicalConditionsByEmail(email);
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load ailments");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.email) {
      loadAilments(user.email);
      
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

  // Open modal & seed form
  const openModal = (mc: MedicalCondition) => {
    setActiveId(mc.id);
    setEditMode(false);
    setForm({
      is_physio: mc.is_physio,
      location_on_body: mc.location_on_body ?? "",
      description: mc.description ?? "",
      pain_level: mc.pain_level ?? 1,
    });
  };

  const closeModal = () => {
    setActiveId(null);
    setEditMode(false);
  };

  const onSave = async () => {
    if (!user?.email || !active) return;
    try {
      setSaving(true);
      const updated = await ProfileService.updateMedicalCondition(active.id, user.email, {
        is_physio: form.is_physio,
        location_on_body: form.location_on_body,
        description: form.description,
        pain_level: Number(form.pain_level),
      });
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditMode(false);
    } catch (e: any) {
      alert(e?.message ?? "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!user?.email || !active) return;
    if (!confirm("Delete this ailment? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await ProfileService.deleteMedicalCondition(active.id, user.email);
      setItems((prev) => prev.filter((p) => p.id !== active.id));
      closeModal();
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // --- NEW: Add handler ---
  const onAdd = async () => {
    if (!user?.email) return;
    if (!addForm.description.trim() && !addForm.location_on_body.trim()) {
      alert("Please add a description or where the pain is.");
      return;
    }
    if (addForm.pain_level < 1 || addForm.pain_level > 10) {
      alert("Severity must be between 1 and 10.");
      return;
    }
    try {
      setAdding(true);
      await ProfileService.addMedicalCondition(
        user.email,
        addForm.is_physio,
        addForm.location_on_body,
        addForm.description,
        Number(addForm.pain_level)
      );
      // Refresh list
      await loadAilments(user.email);
      // Reset & close
      setAddForm({
        is_physio: true,
        location_on_body: "",
        description: "",
        pain_level: 1,
      });
      setAddOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Failed to add ailment");
    } finally {
      setAdding(false);
    }
  };

  const startTherapySession = async (ailment: MedicalCondition) => {
    if (!profile) {
      alert("Please complete your profile first");
      return;
    }

    setGeneratingExercise(true);
    try {
      // Prepare user profile data for the exercise recommendation API
      const userProfileData = {
        height: profile.height_cm,
        weight: profile.weight_kg,
        age: profile.age,
        gender: profile.gender as 'male' | 'female' | 'other',
        painLocation: ailment.location_on_body,
        painLevel: ailment.pain_level,
        fitnessLevel: profile.fitness_level as 'beginner' | 'intermediate' | 'advanced',
        medicalHistory: ailment.description,
        currentLimitations: ailment.description
      };

      console.log('Generating exercise for:', userProfileData);

      // Call the exercise recommendation API
      const response = await fetch('/api/exercise-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate exercise');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate exercise');
      }

      // Store the exercise data and navigate to physio coach
      sessionStorage.setItem('generatedExercise', JSON.stringify(data.data));
      
      // Close the modal and navigate
      setActiveId(null);
      router.push('/physio-coach');

    } catch (error) {
      console.error('Error generating exercise:', error);
      alert(`Failed to generate exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingExercise(false);
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
            
            {/* User Welcome Section */}
            {profile && (
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
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center mx-auto">
            <h3 className="text-4xl font-bold text-black mb-2">Your Ailments</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
            {err && <p className="mt-4 text-red-600 text-sm">{err}</p>}
          </div>

          {/* --- NEW: Add button (right side) --- */}
          <div className="hidden md:block">
            <button
              onClick={() => setAddOpen(true)}
              className="ml-6 px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow"
            >
              + Add Ailment
            </button>
          </div>
        </div>

        {/* Also show Add button on small screens */}
        <div className="md:hidden mb-6 flex justify-center">
          <button
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow"
          >
            + Add Ailment
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl border border-white/20">
            <p className="text-black/70">No ailments recorded yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((mc) => (
              <button
                key={mc.id}
                onClick={() => openModal(mc)}
                className="text-left bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl hover:scale-[1.01] transition transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-black">Ailment</h4>
                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                    Severity {mc.pain_level}/10
                  </span>
                </div>
                <p className="text-black/80">
                  <span className="font-semibold">Where:</span>{" "}
                  {mc.location_on_body || "—"}
                </p>
                <p className="text-black/70 line-clamp-2 mt-1">
                  {mc.description || "No description provided."}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* View/Edit Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-[95vw] max-w-7xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-2xl font-bold text-black">Ailment Details</h5>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {!editMode ? (
              <div className="space-y-3">
                <div>
                  <p className="text-black/60 text-sm">From Physio Therapy</p>
                  <p className="text-black font-semibold">
                    {active.is_physio ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-black/60 text-sm">Where</p>
                  <p className="text-black font-semibold">
                    {active.location_on_body || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-black/60 text-sm">Description</p>
                  <p className="text-black font-semibold whitespace-pre-wrap">
                    {active.description || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-black/60 text-sm">Severity</p>
                  <p className="text-black font-semibold">{active.pain_level} / 10</p>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    id="isPhysical"
                    type="checkbox"
                    checked={form.is_physio}
                    onChange={(e) =>
                      setForm({ ...form, is_physio: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <label htmlFor="isPhysical" className="text-black">
                    Physical ailment
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Where is the pain?
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={form.location_on_body}
                    onChange={(e) =>
                      setForm({ ...form, location_on_body: e.target.value })
                    }
                    placeholder="e.g., Left knee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe the pain, when it occurs, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Severity (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.pain_level}
                    onChange={(e) =>
                      setForm({ ...form, pain_level: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
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
                    <button
                      onClick={() => startTherapySession(active)}
                      disabled={!profile || fetchingProfile || generatingExercise}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60"
                    >
                      {generatingExercise ? "Generating Exercise..." : !profile ? "Profile Required" : "Start Therapy"}
                    </button>
                  </div>
                  <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 transition disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              ) : (
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-2xl bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: Add Modal --- */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setAddOpen(false);
            setShowAddForm(false);
          }}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-2xl font-bold text-black">Add Ailment</h5>
              <button
                onClick={() => {
                  setAddOpen(false);
                  setShowAddForm(false);
                }}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {!showAddForm ? (
              // Choice Modal
              <div className="space-y-6">
                <p className="text-black/80 text-center mb-6">
                  Choose how you'd like to add your ailment:
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/body-map')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      <span>Map on Body</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Fill Form</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              // Form Modal
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  onAdd();
                }}
              >
                <div className="flex items-center space-x-2">
                  <input
                    id="addIsPhysical"
                    type="checkbox"
                    checked={addForm.is_physio}
                    onChange={(e) =>
                      setAddForm({ ...addForm, is_physio: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <label htmlFor="addIsPhysical" className="text-black">
                    Physical ailment
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Where is the pain?
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    value={addForm.location_on_body}
                    onChange={(e) =>
                      setAddForm({ ...addForm, location_on_body: e.target.value })
                    }
                    placeholder="e.g., Left knee"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                    rows={4}
                    value={addForm.description}
                    onChange={(e) =>
                      setAddForm({ ...addForm, description: e.target.value })
                    }
                    placeholder="Describe the pain, when it occurs, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Severity (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={addForm.pain_level}
                    onChange={(e) =>
                      setAddForm({ ...addForm, pain_level: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-white/70 text-black"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-2xl bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-60"
                  >
                    {adding ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes dropdown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
