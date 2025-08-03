import { supabase } from "@/supabase/client"

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
