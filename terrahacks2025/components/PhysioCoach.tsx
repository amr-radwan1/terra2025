"use client";
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '@/hooks/useAuth';

// Declare MediaPipe global types
declare global {
  interface Window {
    Pose: any;
    Camera: any;
  }
}

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
  prescription?: {
    sets: number;
    repsPerSet: number;
    restBetweenSets: number; // in seconds
    reasoning: string;
  };
}

interface PhysioCoachProps {
  preloadedExercise?: ExerciseData;
}

// YouTube Demo Component
function YouTubeDemo({ exerciseName, isVisible }: { exerciseName: string; isVisible: boolean }) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    
    const searchYouTube = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Create search query for physiotherapy exercise
        const searchQuery = `${exerciseName} physiotherapy exercise demonstration proper form`;
        
        // Use YouTube search API alternative (you could also use YouTube Data API)
        const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          // Fallback: Use predefined video IDs for common exercises
          const fallbackVideos: { [key: string]: string } = {
            'shoulder abduction': 'x5F5kW8qj3U', // Physical therapy shoulder abduction
            'shoulder flexion': 'mGj8HQ0_HYc', // Shoulder flexion exercise
            'bicep curl': 'ykJG6cHPB_M', // Proper bicep curl form
            'arm curl': 'ykJG6cHPB_M', // Same as bicep curl
            'pendulum': 'FhCCl0qsB4E', // Pendulum exercise for shoulder
            'leg raise': 'JeWkFhVKSx4', // Leg raise exercise
            'default': 'x5F5kW8qj3U' // Default shoulder exercise
          };
          
          const key = Object.keys(fallbackVideos).find(k => 
            exerciseName.toLowerCase().includes(k)
          ) || 'default';
          
          setVideoId(fallbackVideos[key]);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        if (data.videoId) {
          setVideoId(data.videoId);
        } else {
          throw new Error('No video found');
        }
      } catch (err) {
        console.error('Error fetching YouTube video:', err);
        setError('Could not load demonstration video');
        // Use fallback
        setVideoId('x5F5kW8qj3U'); // Default shoulder exercise video
      }
      
      setLoading(false);
    };

    searchYouTube();
  }, [exerciseName, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">
        Exercise Demonstration
      </h3>
      
      {loading && (
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading demonstration...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {videoId && !loading && (
        <div className="relative">
          <div style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?start=10&rel=0&modestbranding=1`}
              title={`${exerciseName} demonstration`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '8px'
              }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Watch this demonstration to understand proper form
          </p>
        </div>
      )}
    </div>
  );
}

export default function PhysiotherapyCoach({ preloadedExercise }: PhysioCoachProps = {}) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const repCounterRef = useRef(0);
  const lastStateRef = useRef('ready');
  const hasReachedPeakRef = useRef(false); // Track if peak was reached in current rep
  const lastRepTimeRef = useRef(0); // Prevent double counting
  
  const [feedback, setFeedback] = useState('Loading MediaPipe...');
  const [exerciseState, setExerciseState] = useState('ready'); // ready, lifting, lowering, rest
  const [repCount, setRepCount] = useState(0);
  const [armAngle, setArmAngle] = useState(0);
  const [isCorrectForm, setIsCorrectForm] = useState<boolean | null>(null);
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({ camera: false, pose: false });
  
  // New state for dynamic exercise system
  const [currentExercise, setCurrentExercise] = useState<ExerciseData | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [detectedArm, setDetectedArm] = useState<'left' | 'right'>('left');
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // New state for sets and reps tracking
  const [currentSet, setCurrentSet] = useState(1);
  const [targetSets, setTargetSets] = useState(3);
  const [targetRepsPerSet, setTargetRepsPerSet] = useState(10);
  const [isRestingBetweenSets, setIsRestingBetweenSets] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);

  // Session completion state
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [completingSession, setCompletingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // Set MediaPipe as loaded when both scripts are loaded
  useEffect(() => {
    if (scriptsLoaded.camera && scriptsLoaded.pose && window.Camera && window.Pose) {
      setIsMediaPipeLoaded(true);
    }
  }, [scriptsLoaded]);

  // Function to generate exercise prescription using Gemini
  const generateExercisePrescription = async (exercise: ExerciseData) => {
    setIsGeneratingPrescription(true);
    try {
      const response = await fetch('/api/exercise-prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: exercise.exerciseName,
          description: exercise.description,
          userProfile: {
            // These would typically come from user profile, using defaults for now
            age: 30,
            fitnessLevel: 'beginner',
            painLevel: 5,
            medicalHistory: '',
            currentLimitations: ''
          }
        }),
      });

      if (response.ok) {
        const prescription = await response.json();
        setTargetSets(prescription.sets);
        setTargetRepsPerSet(prescription.repsPerSet);
        
        // Update the current exercise with prescription
        const updatedExercise = {
          ...exercise,
          prescription: {
            sets: prescription.sets,
            repsPerSet: prescription.repsPerSet,
            restBetweenSets: prescription.restBetweenSets,
            reasoning: prescription.reasoning
          }
        };
        setCurrentExercise(updatedExercise);
        
        return prescription;
      } else {
        console.error('Failed to generate prescription');
        // Use default values
        setTargetSets(3);
        setTargetRepsPerSet(10);
      }
    } catch (error) {
      console.error('Error generating prescription:', error);
      // Use default values
      setTargetSets(3);
      setTargetRepsPerSet(10);
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  // Function to complete session and award XP
  const completeSessionWithXP = async () => {
    if (!user?.email || sessionCompleted || completingSession || !currentSessionId) return;
    
    setCompletingSession(true);
    try {
      const response = await fetch('/api/complete-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userEmail: user.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSessionCompleted(true);
        setLevelUpMessage(result.data.message);
        
        // Show level up message for 5 seconds
        setTimeout(() => {
          setLevelUpMessage(null);
        }, 5000);
      } else {
        console.error('Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setCompletingSession(false);
    }
  };

  // Track if we've already loaded session data to prevent re-triggering (using ref to persist across re-renders)
  const sessionDataLoadedRef = useRef(false);

  // Initialize with preloaded exercise if provided
  useEffect(() => {
    console.log('PhysioCoach useEffect triggered - preloadedExercise:', preloadedExercise);
    console.log('sessionDataLoaded flag:', sessionDataLoadedRef.current);
    
    // If we've already loaded session data, don't run again
    if (sessionDataLoadedRef.current) {
      console.log('🚫 SKIPPING: Session data already loaded, ignoring useEffect trigger');
      return;
    }
    
    // Check for session data first - PRIORITY OVER PRELOADED EXERCISE
    const sessionData = sessionStorage.getItem('currentSession');
    console.log('Session data from storage:', sessionData);
    
    if (sessionData) {
      console.log('🔥 SESSION DATA FOUND - IGNORING PRELOADED EXERCISE');
      try {
        const session = JSON.parse(sessionData);
        console.log('Parsed session:', session);
        
        if (session.exercises && session.exercises.length > 0) {
          const firstExercise = session.exercises[0];
          console.log('First exercise:', firstExercise);
          
          // Check if setup is already complete from calendar page
          if (session.setupComplete && session.exerciseSetupData) {
            console.log('✅ TAKING PRE-GENERATED SETUP PATH');
            console.log('Using pre-generated setup data:', session.exerciseSetupData);
            const setupData = session.exerciseSetupData;
            
            // Create complete ExerciseData with prescription using pre-generated setup
            const exerciseData: ExerciseData = {
              exerciseName: setupData.exerciseName,
              description: setupData.description,
              steps: setupData.steps,
              targetKeypoints: setupData.targetKeypoints,
              angleCalculations: setupData.angleCalculations,
              targetRanges: setupData.targetRanges,
              formChecks: setupData.formChecks,
              repThresholds: setupData.repThresholds,
              prescription: {
                sets: firstExercise.sets,
                repsPerSet: firstExercise.reps,
                restBetweenSets: firstExercise.rest_seconds,
                reasoning: `Session exercise: ${firstExercise.sets} sets of ${firstExercise.reps} reps with ${firstExercise.rest_seconds}s rest`
              }
            };
            
            console.log('Created exerciseData with squats:', exerciseData);
            
            setCurrentExercise(exerciseData);
            setIsExerciseActive(true);
            setTargetSets(firstExercise.sets);
            setTargetRepsPerSet(firstExercise.reps);
            setRepCount(0);
            repCounterRef.current = 0;
            hasReachedPeakRef.current = false;
            lastStateRef.current = 'ready';
            setExerciseStarted(false);
            setCurrentSet(1);
            setIsRestingBetweenSets(false);
            setRestTimer(0);
            setExerciseComplete(false);
            setSessionCompleted(false);
            setLevelUpMessage(null);
            setCurrentSessionId(null);
            setFeedback(`Session loaded: ${firstExercise.name} (${firstExercise.sets}×${firstExercise.reps}). Click "Start Exercise" to begin.`);
            
            // Clear session data after loading
            sessionStorage.removeItem('currentSession');
            sessionDataLoadedRef.current = true; // Mark that we've loaded session data
            console.log('Session loaded successfully, returning early');
            return;
          } else {
            console.log('❌ TAKING FALLBACK API PATH - setupComplete:', session.setupComplete, 'exerciseSetupData exists:', !!session.exerciseSetupData);
          }
          
          // Fallback: Use the first exercise and get proper setup from API
          console.log('No setup data found, calling exercise-setup API as fallback');
          setFeedback(`Loading session: ${session.day} - Setting up ${firstExercise.name}...`);
          
          // Call exercise setup API to get proper pose detection data
          fetch('/api/exercise-setup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              exercise: firstExercise
            }),
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              const setupData = result.data;
              
              // Create complete ExerciseData with prescription
              const exerciseData: ExerciseData = {
                exerciseName: setupData.exerciseName,
                description: setupData.description,
                steps: setupData.steps,
                targetKeypoints: setupData.targetKeypoints,
                angleCalculations: setupData.angleCalculations,
                targetRanges: setupData.targetRanges,
                formChecks: setupData.formChecks,
                repThresholds: setupData.repThresholds,
                prescription: {
                  sets: firstExercise.sets,
                  repsPerSet: firstExercise.reps,
                  restBetweenSets: firstExercise.rest_seconds,
                  reasoning: `Session exercise: ${firstExercise.sets} sets of ${firstExercise.reps} reps with ${firstExercise.rest_seconds}s rest`
                }
              };
              
              console.log('🎯 Setting currentExercise to:', exerciseData);
              
              setCurrentExercise(exerciseData);
              setIsExerciseActive(true);
              setTargetSets(firstExercise.sets);
              setTargetRepsPerSet(firstExercise.reps);
              setRepCount(0);
              repCounterRef.current = 0;
              hasReachedPeakRef.current = false;
              lastStateRef.current = 'ready';
              setExerciseStarted(false);
              setCurrentSet(1);
              setIsRestingBetweenSets(false);
              setRestTimer(0);
              setExerciseComplete(false);
              setSessionCompleted(false);
              setLevelUpMessage(null);
              setCurrentSessionId(null);
              setFeedback(`Session loaded: ${firstExercise.name} (${firstExercise.sets}×${firstExercise.reps}). Click "Start Exercise" to begin.`);
              
              console.log('✅ Session loading complete - currentExercise should now be:', exerciseData.exerciseName);
              
              // Clear session data after setup is complete
              sessionStorage.removeItem('currentSession');
              sessionDataLoadedRef.current = true; // Mark that we've loaded session data
              
            } else {
              console.error('Failed to setup exercise:', result.error);
              setFeedback('Error setting up exercise. Please try again.');
              // Clear session data on error too
              sessionStorage.removeItem('currentSession');
              sessionDataLoadedRef.current = true; // Mark as loaded even on error to prevent fallback
            }
          })
          .catch(error => {
            console.error('Error calling exercise setup API:', error);
            setFeedback('Error loading exercise setup. Please try again.');
            // Clear session data on error
            sessionStorage.removeItem('currentSession');
            sessionDataLoadedRef.current = true; // Mark as loaded even on error to prevent fallback
          });
          
          return; // Don't clear session data here, wait for API response
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        sessionStorage.removeItem('currentSession');
        sessionDataLoadedRef.current = true; // Mark as loaded to prevent fallback
      }
    }
    
    // Only use preloaded exercise if NO session data exists AND we haven't loaded session data yet
    if (preloadedExercise && !sessionStorage.getItem('currentSession') && !sessionDataLoadedRef.current) {
      console.log('PhysioCoach: Preloaded exercise received:', preloadedExercise);
      console.log('⚠️ WARNING: Preloaded exercise path - should not be used for sessions');
      setCurrentExercise(preloadedExercise);
      setIsExerciseActive(true);
      setRepCount(0);
      repCounterRef.current = 0;
      hasReachedPeakRef.current = false;
      lastStateRef.current = 'ready';
      setExerciseStarted(false);
      setCurrentSet(1);
      setIsRestingBetweenSets(false);
      setRestTimer(0);
      setExerciseComplete(false);
      
      // Generate prescription for the exercise - ONLY for preloaded exercises
      if (!preloadedExercise.prescription) {
        console.log('Preloaded exercise has no prescription, calling generateExercisePrescription');
        generateExercisePrescription(preloadedExercise);
        setFeedback(`Exercise loaded: ${preloadedExercise.exerciseName}. Generating personalized prescription...`);
      } else {
        console.log('Preloaded exercise has prescription, using it directly');
        setTargetSets(preloadedExercise.prescription.sets);
        setTargetRepsPerSet(preloadedExercise.prescription.repsPerSet);
        setFeedback(`Exercise loaded: ${preloadedExercise.exerciseName}. Click "Start Exercise" to begin.`);
      }
    } else if (preloadedExercise && (sessionStorage.getItem('currentSession') || sessionDataLoadedRef.current)) {
      console.log('🚫 IGNORING preloaded exercise because session data exists or was already loaded');
    }
  }, [preloadedExercise]); // Remove sessionDataLoaded from dependencies since it's now a ref

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestingBetweenSets && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            // Rest period finished
            setIsRestingBetweenSets(false);
            setFeedback(`Rest complete! Starting Set ${currentSet}/${targetSets}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestingBetweenSets, restTimer, currentSet, targetSets]);

  // Default exercise data (fallback)
  const defaultExercise: ExerciseData = {
    exerciseName: "Shoulder Abduction",
    description: "Basic shoulder abduction exercise for shoulder mobility",
    steps: [
      "Stand facing the camera",
      "Keep your arm straight", 
      "Slowly lift your arm to the side",
      "Raise until horizontal (90°)",
      "Lower slowly and controlled",
      "Repeat for desired reps"
    ],
    targetKeypoints: [11, 13, 15, 23],
    angleCalculations: {
      primaryAngle: {
        points: [23, 11, 13],
        name: "Shoulder Abduction Angle"
      }
    },
    targetRanges: {
      startingPosition: [0, 45],
      targetRange: [90, 180], 
      optimalPeak: [90, 120]
    },
    formChecks: [
      {
        condition: "wrist higher than shoulder",
        errorMessage: "Keep your arm horizontal, don't lift too high",
        keypoints: [11, 15]
      },
      {
        condition: "elbow below shoulder",
        errorMessage: "Keep your elbow level with your shoulder", 
        keypoints: [11, 13]
      }
    ],
    repThresholds: {
      liftingMin: 60,
      loweringMax: 75,
      restMax: 45
    }
  };

  // Reset rep counter when starting exercise
  const handleStartExercise = async () => {
    if (!exerciseStarted) {
      // Starting exercise - create a session and reset all counters
      if (user?.email) {
        try {
          // For now, we'll use a mock condition ID = 1 (this should be improved)
          const response = await fetch('/api/create-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conditionId: 1, // Mock condition ID - should come from the actual medical condition
              userEmail: user.email
            }),
          });

          if (response.ok) {
            const result = await response.json();
            setCurrentSessionId(result.data.sessionId);
          }
        } catch (error) {
          console.error('Error creating session:', error);
        }
      }

      setExerciseStarted(true);
      setRepCount(0);
      repCounterRef.current = 0;
      hasReachedPeakRef.current = false;
      lastRepTimeRef.current = 0;
      lastStateRef.current = 'ready';
      setCurrentSet(1);
      setIsRestingBetweenSets(false);
      setRestTimer(0);
      setExerciseComplete(false);
      setSessionCompleted(false);
      setLevelUpMessage(null);
      setFeedback(`Exercise started! Set ${currentSet}/${targetSets} - ${targetRepsPerSet} reps`);
    } else {
      // Stopping exercise
      setExerciseStarted(false);
      setIsRestingBetweenSets(false);
      setRestTimer(0);
      setCurrentSessionId(null);
      setFeedback('Exercise stopped');
    }
  };

  // Add this to determine exercise body part:
  const getExerciseBodyPart = (exercise: ExerciseData): 'arms' | 'legs' => {
    const keypoints = exercise?.targetKeypoints || [];
    const hasArmKeypoints = keypoints.some(k => k >= 11 && k <= 22);
    const hasLegKeypoints = keypoints.some(k => k >= 23 && k <= 32);
    
    return hasLegKeypoints ? 'legs' : 'arms';
  };

  useEffect(() => {
    if (!isMediaPipeLoaded) return;

    let pose: any = null;
    let camera: any = null;
    let isCleanedUp = false;

    const initializeMediaPipe = async () => {
      try {
        // Access MediaPipe from global window object
        const { Pose } = window;
        const { Camera } = window;

        if (!Pose || !Camera) {
          setFeedback('MediaPipe not loaded properly. Please refresh the page.');
          return;
        }

        // Initialize MediaPipe Pose
        pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);

        // Initialize camera
        if (videoRef.current && !isCleanedUp) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && pose && !isCleanedUp) {
                try {
                  await pose.send({ image: videoRef.current });
                } catch (error) {
                  // Suppress MediaPipe cleanup errors
                  const errorMessage = error instanceof Error ? error.message : String(error);
                  if (!errorMessage.includes('deleted object') && !isCleanedUp) {
                    console.error('MediaPipe pose error:', error);
                  }
                }
              }
            },
            width: 640,
            height: 480
          });
          await camera.start();
          if (!isCleanedUp) {
            setFeedback('Position yourself in front of the camera');
          }
        }
      } catch (error) {
        console.error('Error initializing MediaPipe:', error);
        if (!isCleanedUp) {
          setFeedback('Error starting camera. Please check permissions.');
        }
      }
    };

    const calculateAngle = (a: any, b: any, c: any) => {
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) {
        angle = 360 - angle;
      }
      return angle;
    };

    const onResults = (results: any) => {
      if (isCleanedUp) return; // Skip processing if component is being cleaned up
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      try {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          drawPose(ctx, results.poseLandmarks);
          
          // Determine if this is an arm or leg exercise and call appropriate analysis
          const exercise = currentExercise || defaultExercise;
          const bodyPart = getExerciseBodyPart(exercise);
          
          if (bodyPart === 'legs') {
            analyzeLegExercise(results.poseLandmarks);
          } else {
            analyzeArmExercise(results.poseLandmarks);
          }
        }
      } catch (error) {
        // Suppress MediaPipe rendering errors during cleanup
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('deleted object') && !isCleanedUp) {
          console.error('MediaPipe rendering error:', error);
        }
      }
    };

    const drawPose = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Complete MediaPipe pose connections for full skeleton
      const connections = [
        // Torso connections
        [11, 12], // shoulders
        [11, 23], // left shoulder to left hip
        [12, 24], // right shoulder to right hip
        [23, 24], // hips
        
        // Left arm connections
        [11, 13], // left shoulder to left elbow
        [13, 15], // left elbow to left wrist
        [15, 17], // left wrist to left pinky
        [15, 19], // left wrist to left index
        [15, 21], // left wrist to left thumb
        [17, 19], // left pinky to left index
        
        // Right arm connections
        [12, 14], // right shoulder to right elbow
        [14, 16], // right elbow to right wrist
        [16, 18], // right wrist to right pinky
        [16, 20], // right wrist to right index
        [16, 22], // right wrist to right thumb
        [18, 20], // right pinky to right index
        
        // Left leg connections
        [23, 25], // left hip to left knee
        [25, 27], // left knee to left ankle
        [27, 29], // left ankle to left heel
        [27, 31], // left ankle to left foot index
        [29, 31], // left heel to left foot index
        
        // Right leg connections
        [24, 26], // right hip to right knee
        [26, 28], // right knee to right ankle
        [28, 30], // right ankle to right heel
        [28, 32], // right ankle to right foot index
        [30, 32], // right heel to right foot index
      ];

      // Draw connections with different colors for different body parts
      connections.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        
        if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
          // Set different colors for different body parts
          if (start <= 10 || end <= 10) {
            ctx.strokeStyle = '#FFD700'; // Gold for face
          } else if ((start >= 11 && start <= 16) || (end >= 11 && end <= 16)) {
            ctx.strokeStyle = '#00FF00'; // Green for arms
          } else if ((start >= 17 && start <= 22) || (end >= 17 && end <= 22)) {
            ctx.strokeStyle = '#FF6B6B'; // Red for hands
          } else if ((start >= 23 && start <= 28) || (end >= 23 && end <= 28)) {
            ctx.strokeStyle = '#4ECDC4'; // Teal for legs
          } else {
            ctx.strokeStyle = '#9B59B6'; // Purple for feet
          }
          
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
          ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw landmark points (excluding face landmarks 0-10)
      landmarks.forEach((point, index) => {
        if (point && point.visibility > 0.5 && index > 10) { // Skip face landmarks (0-10)
          // Set different colors for different landmark groups
          if (index >= 11 && index <= 16) {
            ctx.fillStyle = '#00FF00'; // Green for major joints (shoulders, elbows, wrists)
          } else if (index >= 17 && index <= 22) {
            ctx.fillStyle = '#FF6B6B'; // Red for hand landmarks
          } else if (index >= 23 && index <= 28) {
            ctx.fillStyle = '#4ECDC4'; // Teal for major leg joints
          } else {
            ctx.fillStyle = '#9B59B6'; // Purple for foot landmarks
          }
          
          ctx.beginPath();
          ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            index >= 11 && index <= 16 || index >= 23 && index <= 28 ? 6 : 3, // Larger circles for major joints
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
    };

    const analyzeLegExercise = (landmarks: any[]) => {
      const exercise = currentExercise || defaultExercise;
      
      // Auto-detect which leg is more active
      const detectedLegLocal = detectActiveLeg(landmarks);
      
      // Get landmarks based on exercise configuration and detected leg
      const primaryAngle = exercise?.angleCalculations?.primaryAngle;
      if (!primaryAngle) return; // Exit if no angle configuration
      let adjustedPoints = [...primaryAngle.points];
      
      // Adjust keypoints for right leg if detected
      if (detectedLegLocal === 'right') {
        adjustedPoints = adjustedPoints.map(point => {
          if (point === 23) return 24; // Left hip -> Right hip
          if (point === 25) return 26; // Left knee -> Right knee  
          if (point === 27) return 28; // Left ankle -> Right ankle
          if (point === 11) return 12; // Left shoulder -> Right shoulder (for hip-shoulder-knee angles)
          return point;
        });
      }
      
      const point1 = landmarks[adjustedPoints[0]];
      const vertex = landmarks[adjustedPoints[1]];
      const point2 = landmarks[adjustedPoints[2]];

      if (point1 && vertex && point2) {
        // Update detected leg state if it changed
        if (detectedLegLocal !== detectedArm) {
          setDetectedArm(detectedLegLocal); // Using same state variable for simplicity
          console.log(`Leg detection updated: now tracking ${detectedLegLocal} leg`);
        }

        // Calculate primary angle
        const angle = calculateAngle(point1, vertex, point2);
        setArmAngle(Math.round(angle)); // Using same state variable for display

        analyzeExerciseForm(angle, landmarks, exercise, detectedLegLocal);
      }
    };

    // Function to detect which leg is more active
    const detectActiveLeg = (landmarks: any[]): 'left' | 'right' => {
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];
      const leftAnkle = landmarks[27];
      const rightHip = landmarks[24];
      const rightKnee = landmarks[26];
      const rightAnkle = landmarks[28];
      
      if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
        return detectedArm as 'left' | 'right'; // Keep current if can't detect all points
      }
      
      // Calculate leg angles for both legs
      const leftHipAngle = calculateAngle(landmarks[11], leftHip, leftKnee); // Shoulder-Hip-Knee
      const rightHipAngle = calculateAngle(landmarks[12], rightHip, rightKnee); // Shoulder-Hip-Knee
      
      // Calculate how elevated each leg is (higher ankle = more active)
      const leftElevation = leftHip.y - leftAnkle.y; // Higher ankle = more negative
      const rightElevation = rightHip.y - rightAnkle.y;
      
      // Calculate leg extension (more extended leg when exercising)
      const leftExtension = Math.abs(leftKnee.x - leftHip.x) + Math.abs(leftAnkle.x - leftKnee.x);
      const rightExtension = Math.abs(rightKnee.x - rightHip.x) + Math.abs(rightAnkle.x - rightKnee.x);
      
      // Combined score: elevation + extension + angle deviation from rest position
      const leftScore = leftElevation * 2 + leftExtension + Math.abs(leftHipAngle - 180);
      const rightScore = rightElevation * 2 + rightExtension + Math.abs(rightHipAngle - 180);
      
      // Only switch if there's a significant difference (30% threshold)
      const threshold = 0.3;
      if (rightScore > leftScore * (1 + threshold)) {
        return 'right';
      } else if (leftScore > rightScore * (1 + threshold)) {
        return 'left';
      }
      
      // Not enough difference, keep current
      return detectedArm as 'left' | 'right';
    };
  
    const analyzeArmExercise = (landmarks: any[]) => {
      const exercise = currentExercise || defaultExercise;
      
      // Auto-detect which arm is more active
      const detectedArmLocal = detectActiveArm(landmarks);
      
      // Get landmarks based on exercise configuration and detected arm
      const primaryAngle = exercise?.angleCalculations?.primaryAngle;
      if (!primaryAngle) return; // Exit if no angle configuration
      let adjustedPoints = [...primaryAngle.points];
      
      // Adjust keypoints for right arm if detected
      if (detectedArmLocal === 'right') {
        adjustedPoints = adjustedPoints.map(point => {
          if (point === 11) return 12; // Left shoulder -> Right shoulder
          if (point === 13) return 14; // Left elbow -> Right elbow  
          if (point === 15) return 16; // Left wrist -> Right wrist
          if (point === 23) return 24; // Left hip -> Right hip
          if (point === 25) return 26; // Left knee -> Right knee
          return point;
        });
      }
      
      const point1 = landmarks[adjustedPoints[0]];
      const vertex = landmarks[adjustedPoints[1]];
      const point2 = landmarks[adjustedPoints[2]];

      if (point1 && vertex && point2) {
        // Update detected arm state if it changed
        if (detectedArmLocal !== detectedArm) {
          setDetectedArm(detectedArmLocal);
          console.log(`Arm detection updated: now tracking ${detectedArmLocal} arm`);
        }

        // Calculate primary angle
        const angle = calculateAngle(point1, vertex, point2);
        setArmAngle(Math.round(angle));

        analyzeExerciseForm(angle, landmarks, exercise, detectedArmLocal);
      }
    };

    // Function to detect which arm is more active - simplified and more reliable
    const detectActiveArm = (landmarks: any[]): 'left' | 'right' => {
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      const rightShoulder = landmarks[12];
      const rightElbow = landmarks[14];
      const rightWrist = landmarks[16];
      
      if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
        return detectedArm; // Keep current if can't detect all points
      }
      
      // Calculate arm angles for both arms
      const leftShoulderAngle = calculateAngle(landmarks[23], leftShoulder, leftElbow); // Hip-Shoulder-Elbow
      const rightShoulderAngle = calculateAngle(landmarks[24], rightShoulder, rightElbow); // Hip-Shoulder-Elbow
      
      // Calculate how elevated each arm is (higher = more active)
      const leftElevation = leftShoulder.y - leftWrist.y; // Higher wrist = more negative
      const rightElevation = rightShoulder.y - rightWrist.y;
      
      // Calculate arm extension (straighter arm when exercising)
      const leftExtension = Math.abs(leftElbow.x - leftShoulder.x) + Math.abs(leftWrist.x - leftElbow.x);
      const rightExtension = Math.abs(rightElbow.x - rightShoulder.x) + Math.abs(rightWrist.x - rightElbow.x);
      
      // Combined score: elevation + extension + angle deviation from rest position
      const leftScore = leftElevation * 2 + leftExtension + Math.abs(leftShoulderAngle - 30);
      const rightScore = rightElevation * 2 + rightExtension + Math.abs(rightShoulderAngle - 30);
      
      // Only switch if there's a significant difference (30% threshold)
      const threshold = 0.3;
      if (rightScore > leftScore * (1 + threshold)) {
        return 'right';
      } else if (leftScore > rightScore * (1 + threshold)) {
        return 'left';
      }
      
      // Not enough difference, keep current
      return detectedArm;
    };

    const analyzeExerciseForm = (angle: number, landmarks: any[], exercise: ExerciseData, detectedArm: 'left' | 'right' = 'left') => {
      if (!exerciseStarted) {
        setFeedback(`Ready to start! Target: ${targetSets} sets × ${targetRepsPerSet} reps. Click "Start Exercise" to begin.`);
        setIsCorrectForm(null);
        return;
      }
      
      // Determine exercise phase based on dynamic thresholds
      let currentState = 'ready';
      let feedbackText = '';
      let formCorrect = null;

      const { liftingMin, loweringMax, restMax } = exercise.repThresholds;
      const { startingPosition, targetRange, optimalPeak } = exercise.targetRanges;
      
      // Determine if this is a "lifting" exercise (shoulder abduction) or "curling" exercise (bicep curl)
      const isLiftingExercise = exercise.exerciseName.toLowerCase().includes('abduction') || 
                               exercise.exerciseName.toLowerCase().includes('flexion') ||
                               exercise.exerciseName.toLowerCase().includes('raise') ||
                               exercise.exerciseName.toLowerCase().includes('extension');
      
      const isCurlingExercise = exercise.exerciseName.toLowerCase().includes('curl') ||
                                exercise.exerciseName.toLowerCase().includes('bicep');
      
      const isLegExercise = exercise.exerciseName.toLowerCase().includes('squat') ||
                           exercise.exerciseName.toLowerCase().includes('lunge') ||
                           exercise.exerciseName.toLowerCase().includes('hip') ||
                           exercise.exerciseName.toLowerCase().includes('leg');
      
      // Dynamic action verbs based on exercise type
      let actionVerb, actionVerbGerund, bodyPart;
      
      if (isLegExercise) {
        actionVerb = exercise.exerciseName.toLowerCase().includes('squat') ? 'squat' : 
                    exercise.exerciseName.toLowerCase().includes('lunge') ? 'lunge' : 'lift';
        actionVerbGerund = exercise.exerciseName.toLowerCase().includes('squat') ? 'squatting' : 
                          exercise.exerciseName.toLowerCase().includes('lunge') ? 'lunging' : 'lifting';
        bodyPart = 'leg';
      } else if (isCurlingExercise) {
        actionVerb = 'curl';
        actionVerbGerund = 'curling';
        bodyPart = 'forearm';
      } else {
        actionVerb = 'lift';
        actionVerbGerund = 'lifting';
        bodyPart = 'arm';
      }
      
      // Rep counting logic - check if optimal peak is reached
      const currentTime = Date.now();
      let isInOptimalPeak = false;
      
      if (isLegExercise) {
        // For leg exercises like squats, optimal peak is usually the lowest point (highest angle for knee flexion)
        if (exercise.exerciseName.toLowerCase().includes('squat')) {
          isInOptimalPeak = angle >= optimalPeak[0] && angle <= optimalPeak[1];
        } else {
          // For other leg exercises, use standard logic
          isInOptimalPeak = angle >= optimalPeak[0] && angle <= optimalPeak[1];
        }
      } else {
        // For arm exercises
        isInOptimalPeak = (isLiftingExercise && angle >= optimalPeak[0] && angle <= optimalPeak[1]) ||
                         (isCurlingExercise && angle >= optimalPeak[0] && angle <= optimalPeak[1]);
      }
      
      // Count rep when reaching optimal peak for the first time in this movement cycle
      if (isInOptimalPeak && !hasReachedPeakRef.current && currentTime - lastRepTimeRef.current > 1000 && !isRestingBetweenSets && !exerciseComplete) {
        hasReachedPeakRef.current = true;
        lastRepTimeRef.current = currentTime;
        repCounterRef.current += 1;
        setRepCount(repCounterRef.current);
        console.log(`Rep counted! Current set: ${currentSet}, Rep: ${repCounterRef.current}/${targetRepsPerSet}`);
        
        // Check if set is completed
        if (repCounterRef.current >= targetRepsPerSet) {
          console.log(`Set ${currentSet} completed!`);
          
          if (currentSet >= targetSets) {
            // All sets completed
            setExerciseComplete(true);
            setExerciseStarted(false);
            setFeedback('🎉 Congratulations! Exercise completed successfully!');
            
            // Complete session and award XP
            completeSessionWithXP();
          } else {
            // Start rest period between sets
            const restTime = currentExercise?.prescription?.restBetweenSets || 60;
            setIsRestingBetweenSets(true);
            setRestTimer(restTime);
            setCurrentSet(prev => prev + 1);
            setRepCount(0);
            repCounterRef.current = 0;
            setFeedback(`Set ${currentSet} complete! Rest for ${restTime} seconds before Set ${currentSet + 1}`);
          }
        }
      }
      
      // Reset peak flag when returning to starting position
      let isInStartingPosition = false;
      
      if (isLegExercise) {
        // For leg exercises, starting position is usually standing (lower angle for knee flexion)
        isInStartingPosition = angle <= startingPosition[1] || angle >= startingPosition[0];
      } else {
        // For arm exercises
        isInStartingPosition = (isLiftingExercise && angle <= startingPosition[1]) ||
                              (isCurlingExercise && angle >= startingPosition[0]);
      }
      
      if (isInStartingPosition && hasReachedPeakRef.current) {
        hasReachedPeakRef.current = false;
      }

      // Provide feedback based on current angle
      if (exerciseComplete) {
        feedbackText = '🎉 Congratulations! Exercise completed successfully!';
        formCorrect = true;
        currentState = 'complete';
      } else if (isRestingBetweenSets) {
        feedbackText = `😴 Rest time: ${restTimer}s remaining before Set ${currentSet}/${targetSets}`;
        formCorrect = null;
        currentState = 'resting';
      } else if (isInOptimalPeak) {
        feedbackText = `✅ Excellent! Set ${currentSet}/${targetSets} - Rep ${repCounterRef.current}/${targetRepsPerSet} completed`;
        formCorrect = true;
        currentState = actionVerbGerund;
      } else if (isLegExercise) {
        // Leg exercise specific feedback
        if (exercise.exerciseName.toLowerCase().includes('squat') && angle < optimalPeak[0]) {
          feedbackText = `📈 Go deeper! Set ${currentSet}/${targetSets} - Rep ${repCounterRef.current + 1}/${targetRepsPerSet}`;
          formCorrect = true;
          currentState = actionVerbGerund;
        } else if (angle > liftingMin) {
          feedbackText = `📈 Keep going! ${actionVerbGerund === 'squatting' ? 'Go deeper' : 'Continue movement'} - Set ${currentSet}/${targetSets}`;
          formCorrect = true;
          currentState = actionVerbGerund;
        } else {
          feedbackText = `🏁 Ready for Set ${currentSet}/${targetSets} - ${targetRepsPerSet - repCounterRef.current} reps remaining`;
          formCorrect = true;
          currentState = 'ready';
        }
      } else if ((isLiftingExercise && angle > liftingMin) || (isCurlingExercise && angle < liftingMin)) {
        feedbackText = `📈 Keep going! ${isLiftingExercise ? 'Raise' : 'Curl'} your ${bodyPart} ${isLiftingExercise ? 'higher' : 'more'} - Set ${currentSet}/${targetSets}`;
        formCorrect = true;
        currentState = actionVerbGerund;
      } else if (isInStartingPosition) {
        feedbackText = `🏁 Ready for Set ${currentSet}/${targetSets} - ${targetRepsPerSet - repCounterRef.current} reps remaining`;
        formCorrect = true;
        currentState = 'ready';
      } else {
        feedbackText = `📈 Start your movement - Set ${currentSet}/${targetSets}`;
        formCorrect = true;
        currentState = 'ready';
      }

      // Check for form errors using dynamic form checks with limb-specific landmarks
      exercise.formChecks.forEach(check => {
        const adjustedKeypoints = check.keypoints.map(idx => {
          if (detectedArm === 'right') {
            // Adjust for right arm/leg
            if (idx === 11) return 12; // Left shoulder -> Right shoulder
            if (idx === 13) return 14; // Left elbow -> Right elbow
            if (idx === 15) return 16; // Left wrist -> Right wrist
            if (idx === 23) return 24; // Left hip -> Right hip
            if (idx === 25) return 26; // Left knee -> Right knee
            if (idx === 27) return 28; // Left ankle -> Right ankle
          }
          return idx;
        });
        
        const keypoints = adjustedKeypoints.map(idx => landmarks[idx]).filter(Boolean);
        if (keypoints.length >= 2) {
          // Form checks for arm exercises
          if (check.condition.includes('wrist higher than shoulder') && currentState === actionVerbGerund) {
            const shoulder = landmarks[detectedArm === 'left' ? 11 : 12];
            const wrist = landmarks[detectedArm === 'left' ? 15 : 16];
            if (shoulder && wrist && wrist.y < shoulder.y - 0.1) {
              feedbackText = `⚠️ ${check.errorMessage}`;
              formCorrect = false;
            }
          } else if (check.condition.includes('elbow below shoulder') && currentState === actionVerbGerund) {
            const shoulder = landmarks[detectedArm === 'left' ? 11 : 12];
            const elbow = landmarks[detectedArm === 'left' ? 13 : 14];
            if (shoulder && elbow && elbow.y > shoulder.y + 0.05) {
              feedbackText = `⚠️ ${check.errorMessage}`;
              formCorrect = false;
            }
          }
          // Form checks for leg exercises
          else if (check.condition.includes('knee alignment') && currentState === actionVerbGerund) {
            const hip = landmarks[detectedArm === 'left' ? 23 : 24];
            const knee = landmarks[detectedArm === 'left' ? 25 : 26];
            const ankle = landmarks[detectedArm === 'left' ? 27 : 28];
            if (hip && knee && ankle) {
              // Check if knee is tracking over the ankle properly
              const kneeAnkleDistance = Math.abs(knee.x - ankle.x);
              if (kneeAnkleDistance > 0.1) {
                feedbackText = `⚠️ ${check.errorMessage}`;
                formCorrect = false;
              }
            }
          }
          else if (check.condition.includes('back straight') && currentState === actionVerbGerund) {
            const shoulder = landmarks[detectedArm === 'left' ? 11 : 12];
            const hip = landmarks[detectedArm === 'left' ? 23 : 24];
            if (shoulder && hip) {
              // Check torso alignment
              const torsoAngle = Math.abs(shoulder.x - hip.x);
              if (torsoAngle > 0.15) {
                feedbackText = `⚠️ ${check.errorMessage}`;
                formCorrect = false;
              }
            }
          }
          // Add bicep curl specific form check
          else if (check.condition.includes('Elbow moving off thigh') && currentState === actionVerbGerund) {
            // For bicep curls, check if elbow stays supported
            feedbackText = `⚠️ ${check.errorMessage}`;
            formCorrect = false;
          }
        }
      });

      // Update state only if it changed
      if (currentState !== lastStateRef.current) {
        setExerciseState(currentState);
        lastStateRef.current = currentState;
      }

      setFeedback(feedbackText);
      setIsCorrectForm(formCorrect);
    };

    initializeMediaPipe();

    return () => {
      isCleanedUp = true; // Set cleanup flag first
      
      // Stop camera first
      if (camera) {
        try {
          camera.stop();
        } catch (error) {
          // Suppress camera cleanup errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (!errorMessage.includes('deleted object')) {
            console.warn('Camera cleanup warning:', error);
          }
        }
      }
      
      // Close pose detection with delay to ensure camera is stopped
      if (pose) {
        setTimeout(() => {
          try {
            pose.close();
          } catch (error) {
            // Suppress pose cleanup errors
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes('deleted object')) {
              console.warn('Pose cleanup warning:', error);
            }
          }
        }, 100);
      }
    };
  }, [isMediaPipeLoaded, currentExercise, exerciseStarted]);

  return (
    <>
      {/* Load MediaPipe scripts */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
        onLoad={() => {
          setScriptsLoaded(prev => ({ ...prev, camera: true }));
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
        onLoad={() => {
          setScriptsLoaded(prev => ({ ...prev, pose: true }));
        }}
      />

      {/* User Profile Form Modal */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {/* Level Up Notification */}
        {levelUpMessage && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 animate-bounce">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-lg">Level Up!</p>
                <p className="text-sm opacity-90">{levelUpMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">{/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI Physiotherapy Coach
            </h1>
            <p className="text-gray-600">
              {currentExercise ? currentExercise.exerciseName : 'Shoulder Abduction Exercise'} - Real-time Form Analysis
            </p>
            
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleStartExercise}
                disabled={isGeneratingPrescription}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isGeneratingPrescription
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : exerciseStarted 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isGeneratingPrescription ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Prescription...
                  </div>
                ) : exerciseStarted ? 'Stop Exercise' : 'Start Exercise'}
              </button>
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showDemo ? 'Hide Demo' : 'Show Demo'}
              </button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="hidden"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="w-full h-auto"
                />
                
                {/* Overlay with angle indicator */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                  {(() => {
                    const exercise = currentExercise || defaultExercise;
                    const bodyPart = getExerciseBodyPart(exercise);
                    const angleName = exercise?.angleCalculations?.primaryAngle?.name || "Angle";
                    return `${angleName}: ${armAngle}°`;
                  })()}
                </div>
                
                {/* Sets and Reps counter overlay */}
                <div className="absolute top-4 right-4 bg-blue-600 bg-opacity-90 text-white px-4 py-2 rounded">
                  <div className="text-center">
                    {exerciseComplete ? (
                      <>
                        <div className="text-lg font-bold">✅ COMPLETE</div>
                        <div className="text-xs">{targetSets} SETS DONE</div>
                      </>
                    ) : isRestingBetweenSets ? (
                      <>
                        <div className="text-xl font-bold">{restTimer}s</div>
                        <div className="text-xs">REST TIME</div>
                        <div className="text-xs mt-1">Set {currentSet-1} → {currentSet}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{repCount}/{targetRepsPerSet}</div>
                        <div className="text-xs">REPS</div>
                        <div className="text-xs mt-1">Set {currentSet}/{targetSets}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Target Ranges Overlay */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded text-xs">
                  <div className="font-semibold mb-1">Target Ranges</div>
                  {(() => {
                    const ranges = currentExercise?.targetRanges || defaultExercise.targetRanges;
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between gap-3">
                          <span className="text-blue-300">Start:</span>
                          <span>{ranges.startingPosition[0]}-{ranges.startingPosition[1]}°</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-green-300">Target:</span>
                          <span>{ranges.targetRange[0]}-{ranges.targetRange[1]}°</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-purple-300">Peak:</span>
                          <span>{ranges.optimalPeak[0]}-{ranges.optimalPeak[1]}°</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* YouTube Demo */}
            {showDemo && (
              <div className="mt-6">
                <YouTubeDemo 
                  exerciseName={currentExercise?.exerciseName || defaultExercise.exerciseName}
                  isVisible={showDemo}
                />
              </div>
            )}
          </div>

          {/* Feedback Panel */}
          <div className="space-y-4">
            {/* Current Feedback */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Real-time Feedback
              </h3>
              <div className={`p-4 rounded-lg ${
                isCorrectForm === true ? 'bg-green-50 border border-green-200' :
                isCorrectForm === false ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-sm font-medium text-gray-800">
                  {feedback}
                </p>
              </div>
            </div>

            {/* Exercise Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Exercise Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Set:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {exerciseComplete ? 'Complete!' : `${currentSet} / ${targetSets}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Reps:</span>
                  <span className="text-xl font-bold text-green-600">
                    {exerciseComplete ? 'All done!' : `${repCount} / ${targetRepsPerSet}`}
                  </span>
                </div>
                {isRestingBetweenSets && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rest Time:</span>
                    <span className="text-lg font-bold text-purple-600">{restTimer}s</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Phase:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    exerciseState === 'complete' ? 'bg-green-100 text-green-800' :
                    exerciseState === 'resting' ? 'bg-purple-100 text-purple-800' :
                    exerciseState === 'lifting' || exerciseState === 'curling' ? 'bg-green-100 text-green-800' :
                    exerciseState === 'lowering' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {exerciseState === 'resting' ? 'Resting' : 
                     exerciseState === 'complete' ? 'Complete' :
                     exerciseState.charAt(0).toUpperCase() + exerciseState.slice(1)}
                  </span>
                </div>
                {/* Progress bar for current set */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Set Progress</span>
                    <span>{Math.round((repCount / targetRepsPerSet) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((repCount / targetRepsPerSet) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {/* Overall progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(((currentSet - 1) * targetRepsPerSet + repCount) / (targetSets * targetRepsPerSet) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((currentSet - 1) * targetRepsPerSet + repCount) / (targetSets * targetRepsPerSet) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {currentExercise?.prescription && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">
                      <div className="font-medium mb-1">Exercise Prescription:</div>
                      <div>• Sets: {currentExercise.prescription.sets}</div>
                      <div>• Reps per set: {currentExercise.prescription.repsPerSet}</div>
                      <div>• Rest between sets: {currentExercise.prescription.restBetweenSets}s</div>
                      <div className="mt-2 text-xs text-gray-600 italic">
                        {currentExercise.prescription.reasoning}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Exercise Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Instructions
              </h3>
              {currentExercise && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    {currentExercise.description}
                  </p>
                </div>
              )}
              <div className="space-y-2 text-sm text-gray-600">
                {(currentExercise?.steps || defaultExercise.steps).map((step, index) => (
                  <p key={index}>{index + 1}. {step}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with tips */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Tips:</strong> Keep your core engaged, avoid shrugging your shoulders, 
              and maintain a slow, controlled movement throughout the exercise. Reach the optimal peak angle to count a rep!
            </p>
            <p className="text-xs text-gray-500">
              Note: This is for demonstration purposes only. Consult a licensed physiotherapist for proper exercise guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}