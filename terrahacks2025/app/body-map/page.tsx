'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, UserProfile } from '@/service/ProfileService';
import { supabase } from '@/supabase/client';


interface BodyZone {
  id: string;
  name: string;
  description: string;
  commonInjuries: string[];
  painPatterns: string[];
  color: string;
}

const bodyZones: BodyZone[] = [
  {
    id: 'head',
    name: 'Head',
    description: 'Contains the brain and sensory organs.',
    commonInjuries: ['Concussion', 'Tension headache', 'Migraine', 'Sinusitis'],
    painPatterns: ['Throbbing pain', 'Pressure sensation', 'Sensitivity to light', 'Nausea'],
    color: '#3B82F6'
  },
  {
    id: 'neck',
    name: 'Neck (Cervical Spine)',
    description: 'The cervical spine supports the head and allows for neck movement.',
    commonInjuries: ['Whiplash', 'Cervical strain', 'Herniated disc', 'Cervical radiculopathy'],
    painPatterns: ['Stiffness', 'Sharp pain with movement', 'Radiating pain to shoulders/arms', 'Headaches'],
    color: '#8B5CF6'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    description: 'Complex joint allowing wide range of arm movement.',
    commonInjuries: ['Rotator cuff tear', 'Frozen shoulder', 'Shoulder impingement', 'Bursitis'],
    painPatterns: ['Pain with overhead movement', 'Weakness in arm', 'Night pain', 'Clicking/popping'],
    color: '#06B6D4'
  },
  {
    id: 'upper-back',
    name: 'Upper Back (Thoracic Spine)',
    description: 'Mid-back region providing stability and rib cage support.',
    commonInjuries: ['Thoracic strain', 'Costovertebral joint dysfunction', 'Postural kyphosis'],
    painPatterns: ['Aching between shoulder blades', 'Pain with breathing', 'Stiffness', 'Postural pain'],
    color: '#10B981'
  },
  {
    id: 'lower-back',
    name: 'Lower Back (Lumbar Spine)',
    description: 'Lower spine supporting body weight and trunk movement.',
    commonInjuries: ['Lumbar strain', 'Herniated disc', 'Sciatica', 'Spondylolisthesis'],
    painPatterns: ['Low back pain', 'Radiating leg pain', 'Stiffness', 'Pain with bending/lifting'],
    color: '#F59E0B'
  },
  {
    id: 'chest',
    name: 'Chest',
    description: 'Contains heart, lungs, and rib cage.',
    commonInjuries: ['Rib fracture', 'Costochondritis', 'Muscle strain', 'Intercostal neuralgia'],
    painPatterns: ['Sharp chest pain', 'Pain with breathing', 'Tenderness to touch', 'Radiating pain'],
    color: '#EF4444'
  },
  {
    id: 'elbows',
    name: 'Elbows',
    description: 'Hinge joint connecting upper and lower arm.',
    commonInjuries: ['Tennis elbow', 'Golfer\'s elbow', 'Bursitis', 'Ulnar nerve entrapment'],
    painPatterns: ['Pain with gripping', 'Tenderness on bony prominences', 'Weakness', 'Stiffness'],
    color: '#EC4899'
  },
  {
    id: 'wrists-hands',
    name: 'Wrists & Hands',
    description: 'Complex joints enabling fine motor skills and grip.',
    commonInjuries: ['Carpal tunnel syndrome', 'De Quervain\'s tenosynovitis', 'Trigger finger', 'Wrist sprain'],
    painPatterns: ['Numbness/tingling', 'Pain with repetitive movements', 'Weakness', 'Stiffness'],
    color: '#84CC16'
  },
  {
    id: 'hips',
    name: 'Hips',
    description: 'Ball-and-socket joints supporting body weight and leg movement.',
    commonInjuries: ['Hip bursitis', 'Labral tear', 'Hip impingement', 'Osteoarthritis'],
    painPatterns: ['Groin pain', 'Lateral hip pain', 'Stiffness', 'Pain with walking'],
    color: '#6366F1'
  },
  {
    id: 'knees',
    name: 'Knees',
    description: 'Complex hinge joints supporting body weight and movement.',
    commonInjuries: ['ACL/MCL tear', 'Meniscus tear', 'Patellofemoral pain', 'Osteoarthritis'],
    painPatterns: ['Pain with stairs', 'Swelling', 'Instability', 'Clicking/popping'],
    color: '#F97316'
  },
  {
    id: 'ankles-feet',
    name: 'Ankles & Feet',
    description: 'Complex structures supporting body weight and locomotion.',
    commonInjuries: ['Ankle sprain', 'Plantar fasciitis', 'Achilles tendinitis', 'Bunions'],
    painPatterns: ['Pain with walking', 'Morning stiffness', 'Swelling', 'Instability'],
    color: '#8B5A2B'
  }
];

export default function BodyMapPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedZones, setSelectedZones] = useState<BodyZone[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [painLevels, setPainLevels] = useState<{[key: string]: number}>({});
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/body-map');
    }
  }, [user, loading, router]);

  // Load user profile
  useEffect(() => {
    if (user?.email) {
      (async () => {
        try {
          const result = await ProfileService.getProfileByEmail(user.email);
          if (result) {
            setProfile(result);
          }
        } catch (e: unknown) {
          console.error('Failed to load profile:', e);
        }
      })();
    }
  }, [user]);

  const toggleZone = (zone: BodyZone) => {
    if (selectedZones.find(z => z.id === zone.id)) {
      // Remove zone
      setSelectedZones(selectedZones.filter(z => z.id !== zone.id));
      const newPainLevels = { ...painLevels };
      delete newPainLevels[zone.id];
      setPainLevels(newPainLevels);
    } else {
      // Add zone
      setSelectedZones([...selectedZones, zone]);
      setPainLevels({ ...painLevels, [zone.id]: 5 });
    }
  };

  const updatePainLevel = (zoneId: string, level: number) => {
    setPainLevels({ ...painLevels, [zoneId]: level });
  };

    const handleDone = async () => {
    if (selectedZones.length === 0 || submitting) return;

    try {
      setSubmitting(true);

      // Get current user email
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const email = user?.email;
      if (!email) throw new Error('No logged-in user. Please sign in again.');

      // Create one record per selected zone
      await Promise.all(
        selectedZones.map((zone) => {
          const description = zone.painPatterns.join(', '); // convert array to string
          const location_on_body = zone.name;
          const pain_level = painLevels[zone.id] ?? 5;
          const is_physio = false; // set true/false based on your app context

          return ProfileService.addMedicalCondition(
            email,
            is_physio,
            location_on_body,
            description,
            pain_level
          );
        })
      );

      // Navigate after success
      router.push('/ailments');
    } catch (err) {
      console.error('Failed to save medical conditions:', err);
      alert('Could not save your selections. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle body part selection and exercise generation
  const handleGenerateExercise = async (zone: BodyZone) => {
    if (!profile || !user) {
      alert('User profile not found. Please complete your profile setup.');
      return;
    }

    setIsGeneratingExercise(true);

    try {
      // Get pain level for this zone, default to 5 if not set
      const painLevel = painLevels[zone.id] || 5;

      // Prepare the request data for the exercise recommendation API
      const requestData = {
        height: profile.height_cm,
        weight: profile.weight_kg,
        age: profile.age,
        gender: profile.gender || 'other',
        painLocation: zone.name,
        painLevel: painLevel,
        fitnessLevel: profile.fitness_level || 'beginner',
        medicalHistory: `Pain in ${zone.name}. Common patterns: ${zone.painPatterns.join(', ')}`,
        currentLimitations: `Affected area: ${zone.description}`
      };

      // Call the exercise recommendation API
      const response = await fetch('/api/exercise-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate exercise recommendation');
      }

      const apiResponse = await response.json();
      console.log('Body-map: API response received:', apiResponse);
      
      // Extract the actual exercise data from the API response
      const exerciseData = apiResponse.success ? apiResponse.data : apiResponse;
      console.log('Body-map: Exercise data to store:', exerciseData);

      // Store the exercise data in sessionStorage and navigate to physio coach
      sessionStorage.setItem('generatedExercise', JSON.stringify(exerciseData));
      router.push('/physio-coach');

    } catch (error) {
      console.error('Error generating exercise:', error);
      alert('Failed to generate exercise recommendation. Please try again.');
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-lg animate-spin-slow"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Return to Ailments Button */}
          <div className="flex justify-end mb-6">
            <Link href="/ailments" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return to Ailments</span>
            </Link>
          </div>
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-5xl font-bold text-black mb-4">Interactive Body Assessment</h3>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
            <p className="text-black/80 text-xl">Click on body regions to assess pain levels and get personalized recommendations</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Body Outline */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-blue-50/50 rounded-3xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <h4 className="text-3xl font-bold text-black mb-8 text-center">Body Regions</h4>
                  
                  {/* Enhanced Body Outline SVG */}
                  <div className="flex justify-center">
                    <svg width="400" height="700" viewBox="0 0 400 700" className="cursor-pointer">
                      {/* Enhanced Head */}
                      <circle cx="200" cy="60" r="35" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Neck */}
                      <rect x="185" y="95" width="30" height="35" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3" rx="5"/>
                      
                      {/* Enhanced Torso */}
                      <ellipse cx="200" cy="220" rx="70" ry="90" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Arms */}
                      <ellipse cx="100" cy="200" rx="18" ry="45" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <ellipse cx="300" cy="200" rx="18" ry="45" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Forearms */}
                      <ellipse cx="90" cy="280" rx="15" ry="40" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <ellipse cx="310" cy="280" rx="15" ry="40" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Hands */}
                      <circle cx="85" cy="340" r="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <circle cx="315" cy="340" r="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Hips */}
                      <ellipse cx="200" cy="350" rx="60" ry="35" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Legs */}
                      <ellipse cx="150" cy="450" rx="25" ry="70" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <ellipse cx="250" cy="450" rx="25" ry="70" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Clickable Legs */}
                      <ellipse 
                        cx="150" cy="450" rx="25" ry="70" 
                        fill={hoveredZone === 'legs' ? '#10B981' + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'legs') ? '#10B981' : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone({
                          id: 'legs',
                          name: 'Legs (Thighs)',
                          description: 'Upper leg muscles supporting body weight and movement.',
                          commonInjuries: ['Hamstring strain', 'Quadriceps strain', 'IT band syndrome', 'Muscle cramps'],
                          painPatterns: ['Pain with walking/running', 'Stiffness', 'Muscle weakness', 'Tenderness'],
                          color: '#10B981'
                        })}
                        onMouseEnter={() => setHoveredZone('legs')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <ellipse 
                        cx="250" cy="450" rx="25" ry="70" 
                        fill={hoveredZone === 'legs' ? '#10B981' + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'legs') ? '#10B981' : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone({
                          id: 'legs',
                          name: 'Legs (Thighs)',
                          description: 'Upper leg muscles supporting body weight and movement.',
                          commonInjuries: ['Hamstring strain', 'Quadriceps strain', 'IT band syndrome', 'Muscle cramps'],
                          painPatterns: ['Pain with walking/running', 'Stiffness', 'Muscle weakness', 'Tenderness'],
                          color: '#10B981'
                        })}
                        onMouseEnter={() => setHoveredZone('legs')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Enhanced Knees */}
                      <circle cx="150" cy="540" r="20" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <circle cx="250" cy="540" r="20" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Enhanced Lower Legs */}
                      <ellipse cx="150" cy="620" rx="20" ry="50" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <ellipse cx="250" cy="620" rx="20" ry="50" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Clickable Lower Legs */}
                      <ellipse 
                        cx="150" cy="620" rx="20" ry="50" 
                        fill={hoveredZone === 'lower-legs' ? '#059669' + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'lower-legs') ? '#059669' : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone({
                          id: 'lower-legs',
                          name: 'Lower Legs (Calves)',
                          description: 'Calf muscles and lower leg structures.',
                          commonInjuries: ['Calf strain', 'Shin splints', 'Achilles tendinitis', 'Compartment syndrome'],
                          painPatterns: ['Pain with walking', 'Calf tightness', 'Shin pain', 'Swelling'],
                          color: '#059669'
                        })}
                        onMouseEnter={() => setHoveredZone('lower-legs')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <ellipse 
                        cx="250" cy="620" rx="20" ry="50" 
                        fill={hoveredZone === 'lower-legs' ? '#059669' + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'lower-legs') ? '#059669' : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone({
                          id: 'lower-legs',
                          name: 'Lower Legs (Calves)',
                          description: 'Calf muscles and lower leg structures.',
                          commonInjuries: ['Calf strain', 'Shin splints', 'Achilles tendinitis', 'Compartment syndrome'],
                          painPatterns: ['Pain with walking', 'Calf tightness', 'Shin pain', 'Swelling'],
                          color: '#059669'
                        })}
                        onMouseEnter={() => setHoveredZone('lower-legs')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Enhanced Feet */}
                      <ellipse cx="150" cy="680" rx="15" ry="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      <ellipse cx="250" cy="680" rx="15" ry="12" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="3"/>
                      
                      {/* Clickable Zones - All Body Parts */}
                      {/* Head */}
                      <circle 
                        cx="200" cy="60" r="35" 
                        fill={hoveredZone === 'head' ? bodyZones[0].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'head') ? bodyZones[0].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[0])}
                        onMouseEnter={() => setHoveredZone('head')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Neck */}
                      <rect 
                        x="185" y="95" width="30" height="35" 
                        fill={hoveredZone === 'neck' ? bodyZones[1].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'neck') ? bodyZones[1].color : 'transparent'}
                        strokeWidth="4"
                        rx="5"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[1])}
                        onMouseEnter={() => setHoveredZone('neck')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Shoulders */}
                      <ellipse 
                        cx="100" cy="200" rx="18" ry="45" 
                        fill={hoveredZone === 'shoulders' ? bodyZones[2].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'shoulders') ? bodyZones[2].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[2])}
                        onMouseEnter={() => setHoveredZone('shoulders')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <ellipse 
                        cx="300" cy="200" rx="18" ry="45" 
                        fill={hoveredZone === 'shoulders' ? bodyZones[2].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'shoulders') ? bodyZones[2].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[2])}
                        onMouseEnter={() => setHoveredZone('shoulders')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Upper Back */}
                      <ellipse 
                        cx="200" cy="220" rx="70" ry="90" 
                        fill={hoveredZone === 'upper-back' ? bodyZones[3].color + '20' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'upper-back') ? bodyZones[3].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[3])}
                        onMouseEnter={() => setHoveredZone('upper-back')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Lower Back */}
                      <ellipse 
                        cx="200" cy="220" rx="70" ry="90" 
                        fill={hoveredZone === 'lower-back' ? bodyZones[4].color + '20' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'lower-back') ? bodyZones[4].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[4])}
                        onMouseEnter={() => setHoveredZone('lower-back')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Chest */}
                      <ellipse 
                        cx="200" cy="220" rx="70" ry="90" 
                        fill={hoveredZone === 'chest' ? bodyZones[5].color + '20' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'chest') ? bodyZones[5].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[5])}
                        onMouseEnter={() => setHoveredZone('chest')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Elbows */}
                      <ellipse 
                        cx="90" cy="280" rx="15" ry="40" 
                        fill={hoveredZone === 'elbows' ? bodyZones[6].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'elbows') ? bodyZones[6].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[6])}
                        onMouseEnter={() => setHoveredZone('elbows')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <ellipse 
                        cx="310" cy="280" rx="15" ry="40" 
                        fill={hoveredZone === 'elbows' ? bodyZones[6].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'elbows') ? bodyZones[6].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[6])}
                        onMouseEnter={() => setHoveredZone('elbows')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Wrists & Hands */}
                      <circle 
                        cx="85" cy="340" r="12" 
                        fill={hoveredZone === 'wrists-hands' ? bodyZones[7].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'wrists-hands') ? bodyZones[7].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[7])}
                        onMouseEnter={() => setHoveredZone('wrists-hands')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <circle 
                        cx="315" cy="340" r="12" 
                        fill={hoveredZone === 'wrists-hands' ? bodyZones[7].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'wrists-hands') ? bodyZones[7].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[7])}
                        onMouseEnter={() => setHoveredZone('wrists-hands')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Hips */}
                      <ellipse 
                        cx="200" cy="350" rx="60" ry="35" 
                        fill={hoveredZone === 'hips' ? bodyZones[8].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'hips') ? bodyZones[8].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[8])}
                        onMouseEnter={() => setHoveredZone('hips')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Knees */}
                      <circle 
                        cx="150" cy="540" r="20" 
                        fill={hoveredZone === 'knees' ? bodyZones[9].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'knees') ? bodyZones[9].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[9])}
                        onMouseEnter={() => setHoveredZone('knees')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <circle 
                        cx="250" cy="540" r="20" 
                        fill={hoveredZone === 'knees' ? bodyZones[9].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'knees') ? bodyZones[9].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[9])}
                        onMouseEnter={() => setHoveredZone('knees')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      
                      {/* Ankles & Feet */}
                      <ellipse 
                        cx="150" cy="680" rx="15" ry="12" 
                        fill={hoveredZone === 'ankles-feet' ? bodyZones[10].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'ankles-feet') ? bodyZones[10].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[10])}
                        onMouseEnter={() => setHoveredZone('ankles-feet')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      <ellipse 
                        cx="250" cy="680" rx="15" ry="12" 
                        fill={hoveredZone === 'ankles-feet' ? bodyZones[10].color + '30' : 'transparent'}
                        stroke={selectedZones.find(z => z.id === 'ankles-feet') ? bodyZones[10].color : 'transparent'}
                        strokeWidth="4"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => toggleZone(bodyZones[10])}
                        onMouseEnter={() => setHoveredZone('ankles-feet')}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                    </svg>
                  </div>
                  
                  {/* Enhanced Zone Labels */}
                  <div className="mt-8 text-center">
                    <p className="text-black/70 text-lg font-medium">Click on body regions to select • Click again to deselect</p>
                    <p className="text-black/50 text-sm mt-2">Hover to preview • Multiple selections allowed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Zone Information Panel */}
            <div className="lg:col-span-1">
              {selectedZones.length > 0 ? (
                <div className="space-y-6">
                  {/* Action Buttons - Top */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 shadow-2xl border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
                    <div className="relative z-10 text-center">
                      <h4 className="text-xl font-bold text-white mb-3">Save Your Pain Assessment</h4>
                      <p className="text-white/90 text-sm mb-4">Save these pain areas to your ailments record for tracking and future reference.</p>
                      <button
                        onClick={handleDone}
                        disabled={submitting}
                        className={`w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-2xl border border-white/30 transition-all duration-300 ${
                          submitting 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'hover:bg-white/30 transform hover:scale-105'
                        }`}
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save to Ailments'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Selected Zones Information */}
                  {selectedZones.map((zone) => (
                    <div key={zone.id} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 relative overflow-hidden animate-fade-in-up">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-blue-50/50 rounded-3xl"></div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-12 translate-x-12"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-black" style={{color: zone.color}}>
                            {zone.name}
                          </h4>
                          <button
                            onClick={() => toggleZone(zone)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <p className="text-black/70 mb-4">{zone.description}</p>
                        
                        {/* Pain Scale */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-black mb-2">Pain Level (1-10):</h5>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={painLevels[zone.id] || 5}
                              onChange={(e) => updatePainLevel(zone.id, parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-lg font-bold" style={{color: zone.color}}>
                              {painLevels[zone.id] || 5}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Mild</span>
                            <span>Severe</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-semibold text-black mb-2">Common Injuries:</h5>
                            <ul className="text-sm text-black/70 space-y-1">
                              {zone.commonInjuries.map((injury, index) => (
                                <li key={index} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: zone.color}}></div>
                                  {injury}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-black mb-2">Pain Patterns:</h5>
                            <ul className="text-sm text-black/70 space-y-1">
                              {zone.painPatterns.map((pattern, index) => (
                                <li key={index} className="flex items-center">
                                  <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: zone.color}}></div>
                                  {pattern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-2">
                            <button
                              onClick={() => handleGenerateExercise(zone)}
                              disabled={isGeneratingExercise}
                              className={`w-full px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                isGeneratingExercise 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {isGeneratingExercise ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Generating...
                                </div>
                              ) : (
                                'Generate Exercise'
                              )}
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              Get AI-powered exercises for this specific pain area
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-blue-50/50 rounded-3xl"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-black mb-3">Select Body Regions</h4>
                    <p className="text-black/70 text-lg">Click on any part of the body to assess pain levels and get personalized recommendations for that area.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
} 