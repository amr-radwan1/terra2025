import { NextRequest, NextResponse } from 'next/server';
import { completeSession } from '@/service/SchedulingService';
import { supabase } from '@/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userEmail } = await request.json();

    if (!sessionId || !userEmail) {
      return NextResponse.json(
        { error: 'Session ID and user email are required' },
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

    // Complete the session and award XP
    const result = await completeSession(sessionId, userEmail);

    return NextResponse.json({
      success: true,
      data: {
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        newXP: result.newXP,
        message: result.leveledUp 
          ? `🎉 Congratulations! You've reached Level ${result.newLevel}!`
          : `+50 XP earned! Total: ${result.newXP} XP`
      }
    });

  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
