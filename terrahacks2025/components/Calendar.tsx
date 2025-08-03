'use client';

import { useState, useEffect } from 'react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructions: string[];
}

interface DayData {
  date: Date;
  exercises: Exercise[];
  completed: boolean;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

interface PhysioSession {
  id: number;
  condition_id: number;
  date_of_session: string;
  is_complete: boolean;
  session_description: string;
}

interface MedicalCondition {
  id: number;
  email: string;
  is_physio: boolean;
  location_on_body: string;
  description: string;
  pain_level: number;
}

interface CalendarProps {
  userSessions?: PhysioSession[];
  medicalConditions?: MedicalCondition[];
}

export default function Calendar({ userSessions = [], medicalConditions = [] }: CalendarProps) {
  // Set current date to the earliest session date, or today if no sessions
  const getInitialDate = () => {
    if (userSessions.length === 0) return new Date();
    
    const sessionDates = userSessions.map(session => new Date(session.date_of_session));
    const earliestDate = new Date(Math.min(...sessionDates.map(d => d.getTime())));
    return earliestDate;
  };
  
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingGoogleEvents, setIsLoadingGoogleEvents] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());

  // Convert user sessions to exercises - NO HARDCODING
  const convertSessionsToExercises = (sessions: PhysioSession[]): Exercise[] => {
    return sessions.map(session => ({
      id: session.id.toString(),
      name: session.session_description || `Session ${session.id}`,
      description: session.session_description || 'Physiotherapy session',
      duration: '30 minutes',
      difficulty: 'beginner' as const,
      category: 'Physiotherapy',
      instructions: [
        'Follow your physiotherapist\'s guidance',
        'Complete all prescribed exercises',
        'Maintain proper form throughout',
        'Take breaks as needed'
      ]
    }));
  };


  // Generate calendar data for the full month with user sessions
  const generateCalendarData = (date: Date): DayData[] => {
    const days: DayData[] = [];
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        date: new Date(0),
        exercises: [],
        completed: false
      });
    }
    
    // Generate days from 1 to last day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const dayKey = currentDay.toISOString().split('T')[0];
      
      // Find sessions for this specific day
      const sessionsForDay = userSessions.filter(session => {
        const sessionDate = new Date(session.date_of_session);
        return sessionDate.toISOString().split('T')[0] === dayKey;
      });
      
      // Convert sessions to exercises
      const exercisesForDay: Exercise[] = sessionsForDay.map(session => ({
        id: session.id.toString(),
        name: session.session_description || `Session ${session.id}`,
        description: session.session_description || 'Physiotherapy session',
        duration: '30 minutes',
        difficulty: 'beginner' as const,
        category: 'Physiotherapy',
        instructions: [
          'Follow your physiotherapist\'s guidance',
          'Complete all prescribed exercises',
          'Maintain proper form throughout',
          'Take breaks as needed'
        ]
      }));
      
      // Check if any sessions for this day are completed
      const isCompleted = sessionsForDay.some(session => session.is_complete) || completedDays.has(dayKey);
      
      days.push({
        date: new Date(currentDay),
        exercises: exercisesForDay,
        completed: isCompleted
      });
    }
    
    // Add empty slots to complete the last week
    const totalSlots = Math.ceil(days.length / 7) * 7;
    while (days.length < totalSlots) {
      days.push({
        date: new Date(0),
        exercises: [],
        completed: false
      });
    }
    
    return days;
  };

  const [calendarData, setCalendarData] = useState<DayData[]>([]);

  useEffect(() => {
    setCalendarData(generateCalendarData(currentDate));
  }, [currentDate, completedDays, userSessions, medicalConditions]);

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayNames = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isEmptySlot = (date: Date) => {
    return date.getTime() === 0; // Invalid date check
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (dayData: DayData) => {
    setSelectedDate(dayData.date);
    setSelectedDayData(dayData);
    setShowExerciseModal(true);
  };

  const handleMarkComplete = (dayData: DayData) => {
    const dayKey = dayData.date.toISOString().split('T')[0];
    setCompletedDays(prev => {
      const newSet = new Set(prev);
      newSet.add(dayKey);
      return newSet;
    });
    // Update the selected day data to reflect completion
    setSelectedDayData(prev => prev ? { ...prev, completed: true } : null);
  };

  const handlePreviousMonth = () => {
    // Move to previous month
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    // Move to next month
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Google Calendar API integration
  const loadGoogleCalendarEvents = async () => {
    setIsLoadingGoogleEvents(true);
    try {
      // This would be replaced with actual Google Calendar API call
      // For now, we'll simulate the API call
      const response = await fetch('/api/google-calendar');
      if (response.ok) {
        const events = await response.json();
        setGoogleEvents(events);
      }
    } catch (error) {
      console.error('Failed to load Google Calendar events:', error);
    } finally {
      setIsLoadingGoogleEvents(false);
    }
  };



  // Load Google Calendar events on component mount
  useEffect(() => {
    loadGoogleCalendarEvents();
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden p-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-3xl"></div>
      
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-indigo-500/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/5 to-pink-500/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Exercise Calendar</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-black">{getMonthName(currentDate)}</h3>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={loadGoogleCalendarEvents}
              disabled={isLoadingGoogleEvents}
              className="p-2 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              title="Sync with Google Calendar"
            >
              {isLoadingGoogleEvents ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {getDayNames().map((day) => (
            <div key={day} className="text-center py-2">
              <span className="text-sm font-semibold text-black/70">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((dayData, index) => (
            <div
              key={index}
              className={`
                relative p-3 rounded-2xl text-left min-h-[80px]
                ${isEmptySlot(dayData.date) 
                  ? 'bg-transparent' 
                  : 'bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer'
                }
                ${isToday(dayData.date) ? 'ring-2 ring-yellow-400 ring-offset-2 bg-yellow-50/50' : ''}
                ${isSelected(dayData.date) ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
              `}
              onClick={() => !isEmptySlot(dayData.date) && handleDateClick(dayData)}
            >
              {!isEmptySlot(dayData.date) && (
                <>
                  <div className="text-sm font-semibold text-black mb-2">
                    {dayData.date.getDate()}
                  </div>
                  
                  {/* Exercise indicators - small squares */}
                  <div className="flex flex-wrap gap-1">
                    {dayData.exercises.slice(0, 4).map((exercise, idx) => (
                      <div
                        key={idx}
                        className={`
                          w-1.5 h-1.5 rounded-sm
                          ${dayData.completed ? 'bg-red-500' : 'bg-blue-400'}
                        `}
                        title={exercise.name}
                      />
                    ))}
                    {dayData.exercises.length > 4 && (
                      <span className="text-xs text-black/50">+{dayData.exercises.length - 4}</span>
                    )}
                  </div>
                  
                  {/* Big checkmark for completed days */}
                  {dayData.completed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Modal */}
      {showExerciseModal && selectedDayData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-black">
                    {selectedDayData.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-black/60">Your physiotherapy exercises for today</p>
                </div>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Exercises List */}
              <div className="space-y-6">
                {selectedDayData.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-black mb-2">{exercise.name}</h4>
                        <p className="text-black/70 mb-3">{exercise.description}</p>
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-sm text-black/60">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exercise.duration}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                          </span>
                          <span className="text-sm text-black/60">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {exercise.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h5 className="font-semibold text-black mb-3">Instructions:</h5>
                      <ol className="list-decimal list-inside space-y-2 text-black/80">
                        {exercise.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm">{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Exercise</span>
                      </button>
                                             <button 
                         onClick={() => handleMarkComplete(selectedDayData)}
                         className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                         <span>Mark Complete</span>
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Google Calendar Events */}
              {googleEvents.length > 0 && (
                <div className="mt-6 p-4 bg-green-50/50 rounded-2xl">
                  <h5 className="font-semibold text-black mb-3 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Google Calendar Events
                  </h5>
                  <div className="space-y-2">
                    {googleEvents.map((event) => (
                      <div key={event.id} className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-black">{event.summary}</p>
                        {event.description && (
                          <p className="text-sm text-black/70">{event.description}</p>
                        )}
                        <p className="text-xs text-black/50">
                          {event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black font-semibold">Total Exercises: {selectedDayData.exercises.length}</p>
                    <p className="text-black/60 text-sm">Estimated time: {selectedDayData.exercises.reduce((total, ex) => {
                      const minutes = parseInt(ex.duration.split(' ')[0]);
                      return total + minutes;
                    }, 0)} minutes</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105">
                    Start All Exercises
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 