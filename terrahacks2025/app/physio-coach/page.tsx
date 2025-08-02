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
    // Get the generated exercise data from sessionStorage
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
      console.log('PhysioCoachPage: No exercise data in sessionStorage, redirecting to body-map');
      // No exercise data found, redirect back to body map
      router.replace('/body-map');
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
          <p className="text-gray-600 mb-8">Please select a body part to generate an exercise.</p>
          <button
            onClick={() => router.push('/body-map')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Body Map
          </button>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {exerciseData.exerciseName}
                </h1>
                <p className="text-gray-600">{exerciseData.description}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/body-map')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Body Map
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
