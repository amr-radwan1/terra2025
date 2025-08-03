'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhysioCoach from '@/components/PhysioCoach';

interface ExerciseData {
  exerciseName: string;
  description: string;
  steps: string[];
  targetKeypoints: number[];
  angleCalculations: {
    primaryAngle: {
      points: [number, number, number];
      name: string;
    };
    secondaryAngles?: {
      points: [number, number, number];
      name: string;
    }[];
  };
  targetRanges: {
    startingPosition: [number, number];
    targetRange: [number, number];
    optimalPeak: [number, number];
  };
  formChecks: {
    condition: string;
    errorMessage: string;
    keypoints: number[];
  }[];
  repThresholds: {
    liftingMin: number;
    loweringMax: number;
    restMax: number;
  };
}

export default function PhysioCoachPage() {
  const router = useRouter();
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check for session data from calendar (currentSession)
    const storedSession = sessionStorage.getItem('currentSession') || localStorage.getItem('currentSession');
    
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        console.log('PhysioCoachPage: Loaded session from storage:', parsedSession);
        
        // If this is a session from calendar, we need to handle it differently
        if (parsedSession.exercises && parsedSession.exercises.length > 0) {
          // For now, we'll use the exercise setup data if available
          if (parsedSession.exerciseSetupData) {
            setExerciseData(parsedSession.exerciseSetupData);
          } else {
            // If no setup data, we need to create a basic structure
            // This is a fallback - ideally all sessions should have setup data
            const firstExercise = parsedSession.exercises[0];
            const basicExerciseData: ExerciseData = {
              exerciseName: firstExercise.name,
              description: firstExercise.description || 'Complete this exercise as prescribed',
              steps: [`Perform ${firstExercise.sets} sets of ${firstExercise.reps} repetitions`],
              targetKeypoints: [0, 5, 6, 7, 8, 11, 12, 13, 14], // Basic keypoints
              angleCalculations: {
                primaryAngle: {
                  points: [11, 13, 15],
                  name: 'Elbow Angle'
                }
              },
              targetRanges: {
                startingPosition: [160, 180],
                targetRange: [30, 60],
                optimalPeak: [45, 45]
              },
              formChecks: [],
              repThresholds: {
                liftingMin: 30,
                loweringMax: 160,
                restMax: 180
              }
            };
            setExerciseData(basicExerciseData);
          }
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored session data:', error);
      }
    }
    
    // Fallback to the original logic for body-map generated exercises
    const storedExercise = sessionStorage.getItem('generatedExercise');
    
    if (storedExercise) {
      try {
        const parsedExercise = JSON.parse(storedExercise);
        console.log('PhysioCoachPage: Loaded exercise from sessionStorage:', parsedExercise);
        setExerciseData(parsedExercise);
      } catch (error) {
        console.error('Error parsing stored exercise data:', error);
        router.replace('/body-map');
      }
    } else {
      console.log('PhysioCoachPage: No exercise data found, redirecting to dashboard');
      // No exercise data found, redirect to dashboard instead of body-map
      router.replace('/dashboard');
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading your personalized exercise...</p>
        </div>
      </div>
    );
  }

  if (!exerciseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Exercise Data Found</h1>
          <p className="text-gray-600 mb-8">Please start a session from your calendar or select a body part.</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/calendar')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Calendar
            </button>
            <button
              onClick={() => router.push('/body-map')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Body Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with exercise info */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 mb-4">
            <div className="flex items-center justify-between">
              {/* <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {exerciseData.exerciseName}
                </h1>
                <p className="text-gray-600">{exerciseData.description}</p>
              </div> */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    // Check if we came from a session to determine where to go back
                    const storedSession = sessionStorage.getItem('currentSession') || localStorage.getItem('currentSession');
                    if (storedSession) {
                      router.push('/calendar');
                    } else {
                      router.push('/body-map');
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PhysioCoach Component with pre-loaded exercise */}
      <PhysioCoachWithPreloadedExercise exerciseData={exerciseData} />
    </div>
  );
}

// Wrapper component to pass exercise data to PhysioCoach
function PhysioCoachWithPreloadedExercise({ exerciseData }: { exerciseData: ExerciseData }) {
  return <PhysioCoach preloadedExercise={exerciseData} />;
}
