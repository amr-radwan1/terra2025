import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { conditionId, userEmail } = await request.json();

    if (!conditionId || !userEmail) {
      return NextResponse.json(
        { error: 'Condition ID and user email are required' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.email !== userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a new session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        condition_id: conditionId,
        date_of_session: new Date().toISOString().split('T')[0], // Today's date
        is_complete: false,
        session_description: 'Therapy session created from physio coach'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.id,
        message: 'Therapy session started successfully!'
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
