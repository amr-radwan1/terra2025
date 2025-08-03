import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { exerciseId, userEmail } = await request.json();

    if (!exerciseId || !userEmail) {
      return NextResponse.json(
        { error: 'Exercise ID and user email are required' },
        { status: 400 }
      );
    }

    // Get the newly added exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('id', exerciseId)
      .eq('email', userEmail)
      .single();

    if (exerciseError || !exercise) {
      console.error('Error fetching exercise:', exerciseError);
      return NextResponse.json(
        { error: 'Failed to fetch the exercise' },
        { status: 500 }
      );
    }

    // Get all incomplete sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .eq('completed', false);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch user sessions' },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No incomplete sessions found to update'
      });
    }

    // Update each incomplete session to include the new exercise
    const updatePromises = sessions.map(async (session) => {
      try {
        // Parse existing exercises
        let existingExercises = [];
        if (session.exercises) {
          if (typeof session.exercises === 'string') {
            existingExercises = JSON.parse(session.exercises);
          } else {
            existingExercises = session.exercises;
          }
        }

        // Check if exercise is already in the session (avoid duplicates)
        const exerciseExists = existingExercises.some((ex: any) => ex.id === exercise.id);
        if (exerciseExists) {
          return { success: true, sessionId: session.id, message: 'Exercise already exists in session' };
        }

        // Add the new exercise to the session
        const updatedExercises = [...existingExercises, exercise];

        // Update the session
        const { data, error } = await supabase
          .from('user_sessions')
          .update({
            exercises: JSON.stringify(updatedExercises),
            total_exercises: updatedExercises.length
          })
          .eq('id', session.id)
          .select()
          .single();

        if (error) {
          console.error(`Error updating session ${session.id}:`, error);
          return { success: false, sessionId: session.id, error: error.message };
        }

        return { success: true, sessionId: session.id, data };
      } catch (err) {
        console.error(`Error processing session ${session.id}:`, err);
        return { success: false, sessionId: session.id, error: 'Failed to process session' };
      }
    });

    const results = await Promise.all(updatePromises);
    
    // Check if all updates were successful
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Exercise added to ${successful} session(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      results: {
        successful,
        failed,
        details: results
      }
    });

  } catch (error) {
    console.error('Error adding exercise to sessions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add exercise to sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
