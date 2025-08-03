import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  painLevel: number; // 1-10 scale
  medicalHistory?: string;
  currentLimitations?: string;
}

interface PrescriptionRequest {
  exerciseName: string;
  description: string;
  userProfile: UserProfile;
}

interface PrescriptionResponse {
  sets: number;
  repsPerSet: number;
  restBetweenSets: number; // in seconds
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { exerciseName, description, userProfile }: PrescriptionRequest = await request.json();

    const prompt = `
You are an expert physiotherapist AI. Based on the exercise and user profile provided, recommend the optimal number of sets, repetitions per set, and rest time between sets for this specific physiotherapy exercise.

Exercise Information:
- Exercise Name: ${exerciseName}
- Description: ${description}

User Profile:
- Age: ${userProfile.age}
- Fitness Level: ${userProfile.fitnessLevel}
- Pain Level (1-10): ${userProfile.painLevel}
- Medical History: ${userProfile.medicalHistory || 'None provided'}
- Current Limitations: ${userProfile.currentLimitations || 'None provided'}

IMPORTANT GUIDELINES:
1. For physiotherapy exercises, prioritize quality over quantity
2. Start conservatively, especially for beginners or those with higher pain levels
3. Consider fatigue management - too many reps can lead to poor form
4. Rest periods should allow for recovery while maintaining engagement
5. Sets should progress gradually over time

EXERCISE TYPE CONSIDERATIONS:
- Shoulder exercises: Typically 2-3 sets of 8-15 reps
- Arm/Bicep exercises: Typically 2-4 sets of 10-15 reps  
- Leg exercises: Typically 2-3 sets of 8-12 reps
- Mobility/Pendulum exercises: Typically 2-3 sets of 10-20 reps

FITNESS LEVEL ADJUSTMENTS:
- Beginner: Lower sets (2-3), moderate reps (8-12), longer rest (60-90s)
- Intermediate: Moderate sets (3-4), standard reps (10-15), standard rest (45-60s)
- Advanced: Higher sets (3-5), higher reps (12-20), shorter rest (30-45s)

PAIN LEVEL ADJUSTMENTS:
- High pain (7-10): Reduce sets and reps by 25-50%, increase rest time
- Moderate pain (4-6): Standard approach with close monitoring
- Low pain (1-3): Can use standard or slightly increased parameters

Please respond with ONLY valid JSON in this exact format:

{
  "sets": 3,
  "repsPerSet": 10,
  "restBetweenSets": 60,
  "reasoning": "Brief explanation of why these numbers were chosen based on the user profile and exercise type"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Clean the response to extract JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const prescription: PrescriptionResponse = JSON.parse(cleanedText);

      // Validate the prescription
      if (!prescription.sets || !prescription.repsPerSet || !prescription.restBetweenSets) {
        throw new Error('Invalid prescription format');
      }

      // Ensure reasonable bounds
      prescription.sets = Math.max(1, Math.min(5, prescription.sets));
      prescription.repsPerSet = Math.max(5, Math.min(25, prescription.repsPerSet));
      prescription.restBetweenSets = Math.max(30, Math.min(180, prescription.restBetweenSets));

      console.log('Generated prescription:', prescription);
      return NextResponse.json(prescription);

    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback based on user profile
      let sets = 3;
      let repsPerSet = 10;
      let restBetweenSets = 60;

      // Adjust based on fitness level
      if (userProfile.fitnessLevel === 'beginner') {
        sets = 2;
        repsPerSet = 8;
        restBetweenSets = 90;
      } else if (userProfile.fitnessLevel === 'advanced') {
        sets = 4;
        repsPerSet = 15;
        restBetweenSets = 45;
      }

      // Adjust for pain level
      if (userProfile.painLevel >= 7) {
        sets = Math.max(1, sets - 1);
        repsPerSet = Math.max(5, Math.round(repsPerSet * 0.7));
        restBetweenSets += 30;
      }

      return NextResponse.json({
        sets,
        repsPerSet,
        restBetweenSets,
        reasoning: `Generated fallback prescription for ${userProfile.fitnessLevel} level with pain level ${userProfile.painLevel}`
      });
    }

  } catch (error) {
    console.error('Error in exercise prescription API:', error);
    
    return NextResponse.json(
      { 
        sets: 3, 
        repsPerSet: 10, 
        restBetweenSets: 60,
        reasoning: "Default prescription"
      },
      { status: 200 } // Return 200 with default values instead of error
    );
  }
}
