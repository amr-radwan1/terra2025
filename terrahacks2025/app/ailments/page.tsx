"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService, MedicalCondition } from "@/service/ProfileService";

export default function AilmentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [items, setItems] = useState<MedicalCondition[]>([]);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  // --- NEW: Add modal state ---
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    is_physio: true,
    location_on_body: "",
    description: "",
    pain_level: 1,
  });

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
    }
  }, [loading, user]);

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

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-black">Loading ailments...</p>
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
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
          >
            Back to Dashboard
          </Link>
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
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20
                w-[95vw] max-w-7xl p-6 md:p-8">
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
                  <p className="text-black/60 text-sm">Physical</p>
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
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
                  >
                    Edit
                  </button>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setAddOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-2xl font-bold text-black">Add Ailment</h5>
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
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
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
          </div>
        </div>
      )}
    </div>
  );
}
