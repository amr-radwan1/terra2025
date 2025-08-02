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
    if (!profile?.bio_setup) {
    return (
      
  <div className="p-6">
    <h1 className="text-xl font-bold">Welcome, {user.email}</h1>
    {profileError && <p className="text-red-600 text-sm">Profile error: {profileError}</p>}

    <form
      className="grid gap-3 mt-4 max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget as HTMLFormElement);

        const name = String(fd.get("name") || "").trim();
        const heightCm = Number(fd.get("heightCm"));
        const weightKg = Number(fd.get("weightKg"));
        const age = Number(fd.get("age"));

        const gender = String(fd.get("gender") || "");
        const pain_area = String(fd.get("pain_area") || "");
        const pain_level = Number(fd.get("pain_level"));
        const fitness_level = String(fd.get("fitness_level") || "");
        const medical_history = String(fd.get("medical_history") || "");

        if (!name || !heightCm || !weightKg || !age) {
          window.alert("Please fill all required fields.");
          return;
        }


        try{
            ProfileService.setupProfile(user.email,name,heightCm,weightKg,age,gender,fitness_level);

        }catch(error){
            console.error("There was an error adding in Form: ",error)
            throw error;
        }
      }}
    >
      {/* Basic fields */}
      <label className="grid gap-1">
        <span className="text-sm">Name</span>
        <input
          name="name"
          className="border rounded p-2"
          defaultValue={profile?.name ?? ""}
          placeholder="Your name"
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Height (cm)</span>
          <input
            name="heightCm"
            type="number"
            step="any"
            className="border rounded p-2"
            defaultValue={profile?.height_cm ? profile.height_cm / 10 : ""}
            placeholder="e.g., 175"
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Weight (kg)</span>
          <input
            name="weightKg"
            type="number"
            step="any"
            className="border rounded p-2"
            defaultValue={profile?.weight_kg ? profile.weight_kg / 1000 : ""}
            placeholder="e.g., 70"
            required
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Age</span>
        <input
          name="age"
          type="number"
          className="border rounded p-2"
          defaultValue={profile?.age ?? ""}
          placeholder="e.g., 21"
          required
        />
      </label>

      {/* Extra fields */}
      <label className="grid gap-1">
        <span className="text-sm">Gender</span>
        <select name="gender" className="border rounded p-2">
          <option value="">Select…</option>
          <option>Male</option>
          <option>Female</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>
      </label>

      {/* <label className="grid gap-1">
        <span className="text-sm">Where do you feel pain or discomfort?</span>
        <input
          name="pain_area"
          className="border rounded p-2"
          placeholder="e.g., shoulder, knee, lower back"
        />
      </label> */}

      {/* <label className="grid gap-1">
        <span className="text-sm">Pain Level (1–10, where 10 is severe)</span>

        <input
          name="pain_level"
          type="range"
          min={1}
          max={10}
          defaultValue={5}
          className="w-full"
          onInput={(e) => {
            const val = (e.currentTarget as HTMLInputElement).value;
            const out = e.currentTarget.nextElementSibling as HTMLElement | null;
            out?.querySelector(".curr")?.replaceChildren(val);
          }}
        /> */}

        {/* <div className="flex justify-between text-xs text-gray-600">
          <span>1 (Mild)</span>
          <span>
            Current: <strong className="curr">5</strong>
          </span>
          <span>10 (Severe)</span>
        </div>
      </label> */}


      <label className="grid gap-1">
        <span className="text-sm">Fitness Level</span>
        <select name="fitness_level" className="border rounded p-2">
          <option value="">Select…</option>
          <option>BEGINNER</option>
          <option>INTERMEDIATE</option>
          <option>ADVANCED</option>
        </select>
      </label>

      {/* <label className="grid gap-1">
        <span className="text-sm">Medical History (Optional)</span>
        <textarea
          name="medical_history"
          className="border rounded p-2"
          placeholder="Any relevant conditions, surgeries, or injuries"
          rows={3}
        />
      </label> */}

      <button type="submit" className="rounded p-2 border mt-2">Save profile</button>
    </form>
  </div>
);

  }

    else {
        return (
            <div>Welcom Back {profile.name}! You have setup finished, you can now nav to bio data, and ailments</div>
        );
    }
}
