import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/service/ProfileService';
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

    // Keep sessionId as string since it's likely a UUID
    console.log('Completing session:', { sessionId, userEmail });

    // Mark the user session as complete (using user_sessions table)
    // The user_email check in the WHERE clause provides security
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .update({ completed: true })
      .eq('id', sessionId)
      .eq('user_email', userEmail);

    if (sessionError) {
      console.error('Error updating session:', sessionError);
      throw new Error(`Database error: ${sessionError.message}`);
    }

    // Award XP for completing the session (50 XP per session)
    const xpReward = 50;
    const result = await ProfileService.awardExperiencePoints(userEmail, xpReward);

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
