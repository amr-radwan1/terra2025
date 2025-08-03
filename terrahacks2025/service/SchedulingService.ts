import { supabase } from "@/supabase/client"
import { ProfileService } from "./ProfileService";

export type PhysioSession = {
  id: number;
  condition_id: number;
  date_of_session: string;
  is_complete: boolean;
  session_description: string;
};

export async function getSessionsForUserByEmail(email: string): Promise<PhysioSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      condition_id,
      date_of_session,
      is_complete,
      session_description,
      medical_conditions!inner(email)
    `)
    .eq('medical_conditions.email', email)
    .order('date_of_session', { ascending: true });

  if (error) throw error;

  // strip out the joined medical_conditions payload, keep only session shape
  return (data ?? []).map((s: any) => ({
    id: s.id,
    condition_id: s.condition_id,
    date_of_session: s.date_of_session,
    is_complete: s.is_complete,
    session_description: s.session_description,
  }));
}

export async function completeSession(sessionId: number, userEmail: string): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
  try {
    // First, mark the session as complete
    const { error: sessionError } = await supabase
      .from('sessions')
      .update({ is_complete: true })
      .eq('id', sessionId);

    if (sessionError) throw sessionError;

    // Award XP for completing the session (50 XP per session)
    const xpReward = 50;
    const result = await ProfileService.awardExperiencePoints(userEmail, xpReward);

    return result;
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

export async function getCompletedSessionsCount(email: string): Promise<number> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id,
      medical_conditions!inner(email)
    `)
    .eq('medical_conditions.email', email)
    .eq('is_complete', true);

  if (error) throw error;
  return data?.length || 0;
}

export async function getCurrentStreak(email: string): Promise<number> {
  // Get all completed sessions ordered by date
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      date_of_session,
      medical_conditions!inner(email)
    `)
    .eq('medical_conditions.email', email)
    .eq('is_complete', true)
    .order('date_of_session', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  // Calculate streak - consecutive days with completed sessions
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if there's a session today or yesterday
  const sessionDates = data.map(s => {
    const date = new Date(s.date_of_session);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const uniqueDates = Array.from(new Set(sessionDates)).sort((a, b) => b - a);

  for (let i = 0; i < uniqueDates.length; i++) {
    const sessionDate = new Date(uniqueDates[i]);
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (i === 0 && daysDiff <= 1) {
      // First session can be today or yesterday
      streak = 1;
      currentDate = sessionDate;
    } else if (daysDiff === 1) {
      // Consecutive day
      streak++;
      currentDate = sessionDate;
    } else {
      // Break in streak
      break;
    }
  }

  return streak;
}
