import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface UserExercise {
  id: number;
  name: string;
  description: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  body_part: string;
}

interface ExerciseSetupResponse {
  exerciseName: string;
  description: string;
  steps: string[];
  targetKeypoints: number[];
  angleCalculations: {
    primaryAngle: {
      points: number[];
      name: string;
    };
    secondaryAngle?: {
      points: number[];
      name: string;
    };
  };
  targetRanges: {
    startingPosition: [number, number];
    targetRange: [number, number];
    optimalPeak: [number, number];
  };
  formChecks: Array<{
    condition: string;
    errorMessage: string;
    keypoints: number[];
  }>;
  repThresholds: {
    liftingMin: number;
    loweringMax: number;
    restMax: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { exercise }: { exercise: UserExercise } = await request.json();

    const prompt = `
You are an expert physiotherapist and computer vision specialist. Based on the exercise provided, generate comprehensive pose detection and form analysis data for a MediaPipe-based exercise tracking system.

Exercise Information:
- Exercise Name: ${exercise.name}
- Description: ${exercise.description}
- Body Part: ${exercise.body_part}
- Difficulty Level: ${exercise.difficulty_level}
- Sets: ${exercise.sets}
- Reps: ${exercise.reps}
- Rest Time: ${exercise.rest_seconds} seconds

IMPORTANT: You must provide specific MediaPipe pose landmark indices. Here's the reference:
0: nose, 1-10: face landmarks, 11: left_shoulder, 12: right_shoulder, 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist, 17-22: hand landmarks, 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee, 27: left_ankle, 28: right_ankle, 29-32: foot landmarks

Please provide ONLY a valid JSON response with this exact structure:
{
  "exerciseName": "string",
  "description": "string - detailed exercise description",
  "steps": ["step1", "step2", "step3", "step4", "step5"] - 5 clear instruction steps,
  "targetKeypoints": [11, 13, 15] - array of 3-5 most important landmarks to track,
  "angleCalculations": {
    "primaryAngle": {
      "points": [11, 13, 15] - 3 points forming the main angle to measure,
      "name": "Primary Movement Angle Name"
    }
  },
  "targetRanges": {
    "startingPosition": [160, 180] - angle range for starting position,
    "targetRange": [30, 90] - angle range for the exercise movement,
    "optimalPeak": [30, 60] - optimal angle range at peak movement
  },
  "formChecks": [
    {
      "condition": "maintain proper form description",
      "errorMessage": "feedback message for incorrect form",
      "keypoints": [11, 13, 15] - relevant landmarks for this check
    }
  ],
  "repThresholds": {
    "liftingMin": 120 - angle threshold for lifting phase,
    "loweringMax": 150 - angle threshold for lowering phase,
    "restMax": 170 - angle threshold for rest position
  }
}

Focus on the specific body part: ${exercise.body_part}. Choose appropriate MediaPipe landmarks for this exercise type. Make sure the angle calculations and thresholds are realistic for ${exercise.name}.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Gemini raw output:", text);


    try {
      // Clean and parse the JSON response similar to exercise-recommendation
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log("Cleaned JSON text:", cleanText);
      
      const exerciseSetup: ExerciseSetupResponse = JSON.parse(cleanText);
      
      // Validate required fields
      if (!exerciseSetup.exerciseName || !exerciseSetup.targetKeypoints || !exerciseSetup.angleCalculations) {
        throw new Error('Invalid exercise setup format');
      }

      console.log("Successfully parsed exercise setup:", exerciseSetup);

      return NextResponse.json({
        success: true,
        data: exerciseSetup
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', text);
      
      // Fallback exercise setup based on body part
      const fallbackSetup = generateFallbackSetup(exercise);
      
      return NextResponse.json({
        success: true,
        data: fallbackSetup,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error in exercise setup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate exercise setup'
      },
      { status: 500 }
    );
  }
}

function generateFallbackSetup(exercise: UserExercise): ExerciseSetupResponse {
  // Generate fallback based on body part
  const bodyPartSetups: Record<string, Partial<ExerciseSetupResponse>> = {
    'shoulder': {
      targetKeypoints: [11, 12, 13, 14, 15, 16],
      angleCalculations: {
        primaryAngle: {
          points: [23, 11, 13],
          name: "Shoulder Flexion Angle"
        }
      },
      targetRanges: {
        startingPosition: [160, 180],
        targetRange: [30, 90],
        optimalPeak: [30, 60]
      },
      repThresholds: {
        liftingMin: 120,
        loweringMax: 150,
        restMax: 170
      }
    },
    'arm': {
      targetKeypoints: [11, 13, 15],
      angleCalculations: {
        primaryAngle: {
          points: [11, 13, 15],
          name: "Elbow Flexion Angle"
        }
      },
      targetRanges: {
        startingPosition: [160, 180],
        targetRange: [30, 90],
        optimalPeak: [30, 60]
      },
      repThresholds: {
        liftingMin: 120,
        loweringMax: 150,
        restMax: 170
      }
    },
    'leg': {
      targetKeypoints: [23, 25, 27],
      angleCalculations: {
        primaryAngle: {
          points: [23, 25, 27],
          name: "Knee Flexion Angle"
        }
      },
      targetRanges: {
        startingPosition: [160, 180],
        targetRange: [60, 120],
        optimalPeak: [80, 100]
      },
      repThresholds: {
        liftingMin: 140,
        loweringMax: 160,
        restMax: 175
      }
    }
  };

  const bodyPartKey = exercise.body_part.toLowerCase();
  const baseSetup = bodyPartSetups[bodyPartKey] || bodyPartSetups['arm'];

  return {
    exerciseName: exercise.name,
    description: exercise.description || `${exercise.name} exercise for ${exercise.body_part}`,
    steps: [
      "Step 1: Get into the starting position",
      `Step 2: Perform the ${exercise.name} movement slowly`,
      "Step 3: Hold briefly at the peak position",
      "Step 4: Return to starting position with control",
      `Step 5: Complete ${exercise.reps} repetitions`
    ],
    targetKeypoints: baseSetup.targetKeypoints!,
    angleCalculations: baseSetup.angleCalculations!,
    targetRanges: baseSetup.targetRanges!,
    formChecks: [
      {
        condition: "maintain proper form throughout movement",
        errorMessage: "Keep your movements controlled and steady",
        keypoints: baseSetup.targetKeypoints!
      }
    ],
    repThresholds: baseSetup.repThresholds!
  };
}
