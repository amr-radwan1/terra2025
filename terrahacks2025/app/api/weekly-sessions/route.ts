import { NextRequest, NextResponse } from 'next/server';
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

// Helper function to get the start and end of current week (Monday to Sunday)
function getWeekDates() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday being 0
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
}

// Helper function to get Tuesday and Friday of current week
function getSessionDates() {
  const { monday } = getWeekDates();
  
  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1); // Tuesday is Monday + 1
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // Friday is Monday + 4
  
  return { tuesday, friday };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // First, get user's exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true });

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exercises' },
        { status: 500 }
      );
    }

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasExercises: false,
          weeklySchedule: [],
          message: 'No exercises found. Add some exercises to generate your weekly schedule.'
        }
      });
    }

    // Get current week session dates
    const { tuesday, friday } = getSessionDates();
    const { monday, sunday } = getWeekDates();

    // Check if sessions already exist for this week
    const { data: existingSessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_email', email)
      .gte('session_date', monday.toISOString().split('T')[0])
      .lte('session_date', sunday.toISOString().split('T')[0])
      .order('session_date', { ascending: true });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing sessions' },
        { status: 500 }
      );
    }

    let sessions = existingSessions || [];

    // If no sessions exist for this week, create them
    if (sessions.length === 0) {
      const sessionData = [
        {
          user_email: email,
          session_date: tuesday.toISOString().split('T')[0],
          session_day: 'Tuesday',
          exercises: JSON.stringify(exercises),
          total_exercises: exercises.length,
          session_type: 'weekly_routine',
          completed: false
        },
        {
          user_email: email,
          session_date: friday.toISOString().split('T')[0],
          session_day: 'Friday',
          exercises: JSON.stringify(exercises),
          total_exercises: exercises.length,
          session_type: 'weekly_routine',
          completed: false
        }
      ];

      const { data: newSessions, error: createError } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select('*');

      if (createError) {
        console.error('Error creating sessions:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create weekly sessions' },
          { status: 500 }
        );
      }

      sessions = newSessions || [];
    }

    // Format sessions for frontend
    const weeklySchedule: ExerciseSession[] = sessions.map(session => ({
      id: session.id,
      day: session.session_day,
      date: session.session_date,
      exercises: typeof session.exercises === 'string' 
        ? JSON.parse(session.exercises) 
        : session.exercises,
      completed: session.completed,
      sessionType: session.session_type
    }));

    const scheduleData: WeeklyScheduleData = {
      hasExercises: true,
      weeklySchedule,
      totalExercises: exercises.length,
      sessionsPerWeek: 2
    };

    return NextResponse.json({
      success: true,
      data: scheduleData
    });

  } catch (error) {
    console.error('Error in weekly sessions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to mark sessions as completed
export async function POST(request: NextRequest) {
  try {
    const { sessionId, completed = true } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      completed,
      ...(completed && { completed_at: new Date().toISOString() }),
      ...(!completed && { completed_at: null })
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        session: data,
        message: completed ? 'Session completed successfully!' : 'Session marked as incomplete'
      }
    });

  } catch (error) {
    console.error('Error in session update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
