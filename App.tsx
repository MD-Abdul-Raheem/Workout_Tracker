
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DAYS_OF_WEEK, DayOfWeek, Exercise, WeeklyPlan, MuscleGroup, HistoryEntry, WeeklyStats } from './types';
import { generateWorkoutForDay } from './services/geminiService';
import { 
  DumbbellIcon, 
  ChevronLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  CalendarIcon, 
  ClockIcon,
  AILogo,
  BarChartIcon,
  EditIcon
} from './components/Icon';
import { DigitalClock } from './components/Clock';
import { CalendarModal } from './components/CalendarModal';
import { Toast } from './components/Toast';

// --- Local Storage Keys ---
const STORAGE_KEY = 'ironlog_data_v3'; 
const HISTORY_KEY = 'ironlog_history_v1';
const LAST_ACTIVE_WEEK_KEY = 'ironlog_last_active_week_v1';
const TITLES_KEY = 'ironlog_titles_v1';

// --- Default Titles ---
const DEFAULT_TITLES: Record<string, string> = {
  Monday: "Chest & Triceps",
  Tuesday: "Back & Biceps",
  Wednesday: "Shoulders & Forearms",
  Thursday: "Arms (Bi & Tri)",
  Friday: "Legs",
  Saturday: "Abs & Shoulders",
  Sunday: "Active Recovery"
};

// --- Default Initial Plan with Detailed Targets ---
const INITIAL_WORKOUT_PLAN: WeeklyPlan = {
  Monday: [
    { id: 'm1', name: 'Machine Chest Press', muscleGroup: 'Mid Chest', sets: 3, reps: ['12', '12', '12'], weight: ['40', '40', '40'], notes: 'Focus: Push Strength', completed: false },
    { id: 'm2', name: 'Incline Dumbbell Press', muscleGroup: 'Upper Chest', sets: 3, reps: ['10', '10', '10'], weight: ['20', '20', '20'], notes: 'Targets upper chest', completed: false },
    { id: 'm3', name: 'Pec Deck (Butterfly)', muscleGroup: 'Inner Chest', sets: 3, reps: ['15', '15', '15'], weight: ['30', '30', '30'], notes: 'Squeeze hard', completed: false },
    { id: 'm4', name: 'Tricep Cable Pushdowns', muscleGroup: 'Tricep Lateral Head', sets: 3, reps: ['12', '12', '12'], weight: ['15', '15', '15'], notes: '', completed: false },
    { id: 'm5', name: 'Overhead Dumbbell Ext', muscleGroup: 'Tricep Long Head', sets: 3, reps: ['12', '12', '12'], weight: ['12', '12', '12'], notes: '', completed: false },
    { id: 'm6', name: 'Push-Ups', muscleGroup: 'Chest / Core', sets: 2, reps: ['20', '20'], weight: ['0', '0'], notes: 'Failure finisher', completed: false },
  ],
  Tuesday: [
    { id: 't1', name: 'Lat Pulldown (Wide Grip)', muscleGroup: 'Lats (Width)', sets: 3, reps: ['12', '12', '12'], weight: ['40', '40', '40'], notes: 'Back Width', completed: false },
    { id: 't2', name: 'Seated Cable Row', muscleGroup: 'Mid Back (Thickness)', sets: 3, reps: ['12', '12', '12'], weight: ['40', '40', '40'], notes: 'Back Thickness', completed: false },
    { id: 't3', name: 'Single-Arm DB Row', muscleGroup: 'Lower Lats', sets: 3, reps: ['10', '10', '10'], weight: ['16', '16', '16'], notes: 'Lats focus', completed: false },
    { id: 't4', name: 'Dumbbell Bicep Curls', muscleGroup: 'Bicep Short Head', sets: 3, reps: ['12', '12', '12'], weight: ['10', '10', '10'], notes: '', completed: false },
    { id: 't5', name: 'Hammer Curls', muscleGroup: 'Brachialis', sets: 3, reps: ['12', '12', '12'], weight: ['10', '10', '10'], notes: 'Forearm width', completed: false },
    { id: 't6', name: 'Face Pulls', muscleGroup: 'Rear Delts', sets: 3, reps: ['15', '15', '15'], weight: ['15', '15', '15'], notes: 'Rotator cuff', completed: false },
  ],
  Wednesday: [
    { id: 'w1', name: 'Seated DB Overhead Press', muscleGroup: 'Front / Side Delts', sets: 3, reps: ['10', '10', '10'], weight: ['16', '16', '16'], notes: 'Overhead strength', completed: false },
    { id: 'w2', name: 'Dumbbell Lateral Raises', muscleGroup: 'Side Delts', sets: 3, reps: ['15', '15', '15'], weight: ['8', '8', '8'], notes: 'Width', completed: false },
    { id: 'w3', name: 'Front Plate Raise', muscleGroup: 'Front Delts', sets: 3, reps: ['12', '12', '12'], weight: ['10', '10', '10'], notes: 'Front Delt', completed: false },
    { id: 'w4', name: 'Dumbbell Shrugs', muscleGroup: 'Upper Traps', sets: 3, reps: ['15', '15', '15'], weight: ['24', '24', '24'], notes: 'Traps', completed: false },
    { id: 'w5', name: 'Wrist Curls (Palms Up)', muscleGroup: 'Forearm Flexors', sets: 3, reps: ['20', '20', '20'], weight: ['10', '10', '10'], notes: 'Inner Forearm', completed: false },
    { id: 'w6', name: 'Reverse Barbell Curl', muscleGroup: 'Forearm Extensors', sets: 3, reps: ['15', '15', '15'], weight: ['15', '15', '15'], notes: 'Outer Forearm', completed: false },
  ],
  Thursday: [
    { id: 'th1', name: 'EZ Bar Curl', muscleGroup: 'Bicep Overall', sets: 3, reps: ['12', '12', '12'], weight: ['20', '20', '20'], notes: 'Mass', completed: false },
    { id: 'th2', name: 'Skull Crushers', muscleGroup: 'Tricep Long Head', sets: 3, reps: ['12', '12', '12'], weight: ['20', '20', '20'], notes: 'Mass', completed: false },
    { id: 'th3', name: 'Preacher Curl Machine', muscleGroup: 'Bicep Short Head', sets: 3, reps: ['12', '12', '12'], weight: ['25', '25', '25'], notes: 'Isolation', completed: false },
    { id: 'th4', name: 'Bench Dips', muscleGroup: 'Triceps', sets: 3, reps: ['12', '12', '12'], weight: ['0', '0', '0'], notes: 'Bodyweight', completed: false },
    { id: 'th5', name: 'Concentration Curls', muscleGroup: 'Bicep Peak', sets: 2, reps: ['15', '15'], weight: ['10', '10'], notes: 'Squeeze', completed: false },
    { id: 'th6', name: 'Rope Pushdowns', muscleGroup: 'Tricep Lateral Head', sets: 2, reps: ['15', '15'], weight: ['15', '15'], notes: 'Detail', completed: false },
  ],
  Friday: [
    { id: 'f1', name: 'Leg Press Machine', muscleGroup: 'Quads / Glutes', sets: 3, reps: ['12', '12', '12'], weight: ['80', '80', '80'], notes: 'Compound', completed: false },
    { id: 'f2', name: 'Walking Lunges', muscleGroup: 'Glutes / Quads', sets: 3, reps: ['10', '10', '10'], weight: ['12', '12', '12'], notes: 'Unilateral', completed: false },
    { id: 'f3', name: 'Leg Extension', muscleGroup: 'Quads (Isolation)', sets: 3, reps: ['15', '15', '15'], weight: ['35', '35', '35'], notes: 'Pump', completed: false },
    { id: 'f4', name: 'Lying Leg Curls', muscleGroup: 'Hamstrings', sets: 3, reps: ['12', '12', '12'], weight: ['35', '35', '35'], notes: 'Posterior chain', completed: false },
    { id: 'f5', name: 'Hip Adduction Machine', muscleGroup: 'Inner Thighs', sets: 3, reps: ['15', '15', '15'], weight: ['30', '30', '30'], notes: 'Adductors', completed: false },
    { id: 'f6', name: 'Standing Calf Raises', muscleGroup: 'Calves', sets: 4, reps: ['15', '15', '15', '15'], weight: ['40', '40', '40', '40'], notes: 'Gastrocnemius', completed: false },
  ],
  Saturday: [
    { id: 's1', name: 'Plank', muscleGroup: 'Core Stability', sets: 3, reps: ['45', '45', '45'], weight: ['0', '0', '0'], notes: 'Secs duration', completed: false },
    { id: 's2', name: 'Hanging Leg Raise', muscleGroup: 'Lower Abs', sets: 3, reps: ['12', '12', '12'], weight: ['0', '0', '0'], notes: 'Hip Flexors', completed: false },
    { id: 's3', name: 'Machine Crunch', muscleGroup: 'Upper Abs', sets: 3, reps: ['15', '15', '15'], weight: ['30', '30', '30'], notes: 'Isolation', completed: false },
    { id: 's4', name: 'Rear Delt Fly', muscleGroup: 'Rear Delts', sets: 3, reps: ['15', '15', '15'], weight: ['10', '10', '10'], notes: 'Postural', completed: false },
    { id: 's5', name: 'Upright Rows', muscleGroup: 'Side Delts / Traps', sets: 3, reps: ['12', '12', '12'], weight: ['20', '20', '20'], notes: 'Pull', completed: false },
    { id: 's6', name: 'Cardio (Treadmill)', muscleGroup: 'Cardiovascular', sets: 1, reps: ['20'], weight: ['0'], notes: 'Mins', completed: false },
  ],
  Sunday: [
    { id: 'su2', name: 'Light Cardio', muscleGroup: 'Active Recovery', sets: 1, reps: ['30'], weight: ['0'], notes: 'Mins walking', completed: false },
  ]
};

// --- Helper to get fresh empty plan ---
const getEmptyPlan = (): WeeklyPlan => DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {} as WeeklyPlan);

// --- Calendar Helper ---
const getCurrentWeekCalendar = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
  const mondayIndex = currentDay === 0 ? 6 : currentDay - 1;
  
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - mondayIndex);
  mondayDate.setHours(0, 0, 0, 0);

  return DAYS_OF_WEEK.map((dayName, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    return {
      dayName,
      dateNum: date.getDate(),
      fullDate: date,
      isToday: date.toDateString() === today.toDateString()
    };
  });
};

const getWeekLabel = (calendar: ReturnType<typeof getCurrentWeekCalendar>) => {
  if (calendar.length === 0) return 'Unknown Week';
  const start = calendar[0].fullDate;
  const end = calendar[calendar.length - 1].fullDate;
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

const getCurrentMondayDateString = () => {
  const calendar = getCurrentWeekCalendar();
  return calendar[0].fullDate.toISOString();
};

function App() {
  // --- State ---
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      
      const oldSaved = localStorage.getItem('ironlog_data_v2') || localStorage.getItem('ironlog_data_v1');
      if (oldSaved) {
          const parsed = JSON.parse(oldSaved);
          Object.keys(parsed).forEach(day => {
            parsed[day].forEach((ex: any) => {
               const setLen = ex.sets || 3;
               if (typeof ex.reps === 'number') ex.reps = Array(setLen).fill(String(ex.reps));
               if (typeof ex.weight === 'number') ex.weight = Array(setLen).fill(String(ex.weight));
            });
          });
          return parsed;
      }
      return INITIAL_WORKOUT_PLAN;
    } catch (e) {
      return INITIAL_WORKOUT_PLAN;
    }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(TITLES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TITLES;
    } catch (e) {
      return DEFAULT_TITLES;
    }
  });

  const [currentView, setCurrentView] = useState<'week' | 'day' | 'history' | 'snapshot'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  
  const [snapshotData, setSnapshotData] = useState<{ date: Date, exercises: Exercise[], dayLabel: string } | null>(null);
  
  // Modals State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [titleEditModal, setTitleEditModal] = useState<{ isOpen: boolean, day: string, text: string }>({
    isOpen: false, day: '', text: ''
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Toast State
  const [toast, setToast] = useState<{ message: string, isVisible: boolean, type: 'success' | 'info' }>({ 
    message: '', isVisible: false, type: 'success' 
  });

  const weekCalendar = useMemo(() => getCurrentWeekCalendar(), []);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyPlan)); }, [weeklyPlan]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(TITLES_KEY, JSON.stringify(workoutTitles)); }, [workoutTitles]);

  // --- Helper: Show Toast ---
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  // --- Statistics ---
  const calculateStats = (plan: WeeklyPlan): WeeklyStats => {
    let totalExercises = 0;
    let totalSets = 0;
    let totalVolume = 0;
    const muscleCounts: Record<string, number> = {};

    // Helper to categorize detail muscle groups into broader categories for stats
    const categorizeMuscle = (detail: string) => {
        const d = detail.toLowerCase();
        if (d.includes('chest') || d.includes('pec')) return 'Chest';
        if (d.includes('back') || d.includes('lat') || d.includes('row')) return 'Back';
        if (d.includes('leg') || d.includes('quad') || d.includes('ham') || d.includes('glute') || d.includes('calf') || d.includes('thigh')) return 'Legs';
        if (d.includes('shoulder') || d.includes('delt') || d.includes('trap')) return 'Shoulders';
        if (d.includes('arm') || d.includes('bicep') || d.includes('tricep') || d.includes('brachialis') || d.includes('forearm')) return 'Arms';
        if (d.includes('abs') || d.includes('core') || d.includes('plank')) return 'Core';
        if (d.includes('cardio') || d.includes('run') || d.includes('walk')) return 'Cardio';
        return 'Other';
    };

    DAYS_OF_WEEK.forEach(day => {
      const dayExercises = plan[day];
      if (dayExercises) {
        dayExercises.forEach(ex => {
          if (ex.completed) {
            totalExercises++;
            totalSets += ex.sets;
            let exVolume = 0;
            for(let i=0; i < ex.sets; i++) {
                const r = parseFloat(ex.reps[i]) || 0;
                const w = parseFloat(ex.weight[i]) || 0;
                exVolume += (r * w);
            }
            totalVolume += exVolume;
            const mg = ex.muscleGroup || 'Full Body';
            const mgKey = categorizeMuscle(String(mg));
            muscleCounts[mgKey] = (muscleCounts[mgKey] || 0) + ex.sets;
          }
        });
      }
    });

    const topMuscle = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalExercises,
      totalSets,
      totalVolume,
      topMuscle: topMuscle ? topMuscle[0] : 'N/A'
    };
  };

  const weeklyStats = useMemo(() => calculateStats(weeklyPlan), [weeklyPlan]);

  // --- AUTO-ARCHIVE ---
  useEffect(() => {
    const checkAndAutoArchive = () => {
      const currentMondayISO = getCurrentMondayDateString();
      const lastActiveMondayISO = localStorage.getItem(LAST_ACTIVE_WEEK_KEY);

      if (!lastActiveMondayISO) {
        localStorage.setItem(LAST_ACTIVE_WEEK_KEY, currentMondayISO);
        return;
      }

      if (currentMondayISO !== lastActiveMondayISO) {
        const hasExercises = Object.values(weeklyPlan).some((day: any) => day.length > 0);
        if (hasExercises) {
          const oldStats = calculateStats(weeklyPlan);
          const oldMonday = new Date(lastActiveMondayISO);
          const oldSunday = new Date(oldMonday);
          oldSunday.setDate(oldMonday.getDate() + 6);
          const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
          const oldWeekLabel = `${oldMonday.toLocaleDateString('en-US', options)} - ${oldSunday.toLocaleDateString('en-US', options)}`;

          const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            weekLabel: oldWeekLabel,
            dateArchived: new Date().toISOString(),
            startDate: lastActiveMondayISO,
            plan: weeklyPlan,
            stats: oldStats
          };

          setHistory(prev => [newEntry, ...prev]);
          const emptyPlan = getEmptyPlan();
          setWeeklyPlan(emptyPlan);
          showToast("New week started! Previous week auto-archived.", "info");
        } else {
             const emptyPlan = getEmptyPlan();
             setWeeklyPlan(emptyPlan);
        }
        localStorage.setItem(LAST_ACTIVE_WEEK_KEY, currentMondayISO);
      }
    };
    checkAndAutoArchive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const calculateMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalVolume = 0;
    let totalSets = 0;
    let totalExercises = 0;
    const muscleCounts: Record<string, number> = {};

    const categorizeMuscle = (detail: string) => {
        const d = detail.toLowerCase();
        if (d.includes('chest') || d.includes('pec')) return 'Chest';
        if (d.includes('back') || d.includes('lat') || d.includes('row')) return 'Back';
        if (d.includes('leg') || d.includes('quad') || d.includes('ham') || d.includes('glute') || d.includes('calf') || d.includes('thigh')) return 'Legs';
        if (d.includes('shoulder') || d.includes('delt') || d.includes('trap')) return 'Shoulders';
        if (d.includes('arm') || d.includes('bicep') || d.includes('tricep') || d.includes('brachialis') || d.includes('forearm')) return 'Arms';
        if (d.includes('abs') || d.includes('core') || d.includes('plank')) return 'Core';
        if (d.includes('cardio') || d.includes('run') || d.includes('walk')) return 'Cardio';
        return 'Other';
    };

    const processExercises = (exercises: Exercise[]) => {
      exercises.forEach(ex => {
         if (ex.completed) {
            totalExercises++;
            totalSets += ex.sets;
            let exVolume = 0;
            if (Array.isArray(ex.weight)) {
                for(let i=0; i < ex.sets; i++) {
                    const r = parseFloat(ex.reps[i]) || 0;
                    const w = parseFloat(ex.weight[i]) || 0;
                    exVolume += (r * w);
                }
            } else {
                const w = Number(ex.weight) || 0;
                const rSum = Array.isArray(ex.reps) ? ex.reps.reduce((acc, v) => acc + (parseFloat(v)||0), 0) : 0;
                exVolume = w * rSum;
            }
            totalVolume += exVolume;
            const mg = ex.muscleGroup || 'Full Body';
            const mgKey = categorizeMuscle(String(mg));
            muscleCounts[mgKey] = (muscleCounts[mgKey] || 0) + ex.sets;
         }
      });
    };

    Object.values(weeklyPlan).forEach(val => processExercises(val as Exercise[]));

    history.forEach(entry => {
       const d = new Date(entry.startDate || entry.dateArchived);
       if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          totalVolume += entry.stats.totalVolume;
          totalSets += entry.stats.totalSets;
          totalExercises += entry.stats.totalExercises;
          if (entry.plan) {
             Object.values(entry.plan).forEach((dayEx) => processExercises(dayEx as Exercise[]));
          }
       }
    });

    const topMuscle = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1])[0];
    return {
       totalVolume,
       totalSets,
       totalExercises,
       topMuscle: topMuscle ? topMuscle[0] : 'N/A',
       monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const monthlyStats = useMemo(() => calculateMonthlyStats(), [weeklyPlan, history]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    const sorted = [...history].sort((a, b) => 
      new Date(b.startDate || b.dateArchived).getTime() - new Date(a.startDate || a.dateArchived).getTime()
    );
    sorted.forEach(entry => {
      const date = new Date(entry.startDate || entry.dateArchived);
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return groups;
  }, [history]);

  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    weekCalendar.forEach((dayInfo, index) => {
      const dayName = DAYS_OF_WEEK[index];
      const exercises = weeklyPlan[dayName];
      if (exercises && exercises.some(e => e.completed)) {
         const d = dayInfo.fullDate;
         dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    history.forEach(entry => {
      if (entry.startDate) {
        const start = new Date(entry.startDate);
        DAYS_OF_WEEK.forEach((day, index) => {
          const exercises = entry.plan[day];
          if (exercises && exercises.some(e => e.completed)) {
            const current = new Date(start);
            current.setDate(start.getDate() + index);
            dates.add(`${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`);
          }
        });
      }
    });
    return Array.from(dates);
  }, [weeklyPlan, history, weekCalendar]);

  // --- Handlers ---
  const handleDayClick = (day: DayOfWeek) => { setSelectedDay(day); setCurrentView('day'); };
  const handleCalendarClick = (day: DayOfWeek) => { dayRefs.current[day]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const handleOpenWorkoutFromCalendar = (date: Date) => {
    setIsCalendarModalOpen(false);
    const currentWeekDay = weekCalendar.find(d => d.fullDate.toDateString() === date.toDateString());
    if (currentWeekDay) {
        setSelectedDay(currentWeekDay.dayName as DayOfWeek);
        setCurrentView('day');
        return;
    }
    const targetTime = date.getTime();
    const historyEntry = history.find(entry => {
        if (!entry.startDate) return false;
        const start = new Date(entry.startDate);
        start.setHours(0,0,0,0);
        const diffTime = targetTime - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 6;
    });

    if (historyEntry && historyEntry.startDate) {
        const start = new Date(historyEntry.startDate);
        start.setHours(0,0,0,0);
        const diffTime = targetTime - start.getTime();
        const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const dayName = DAYS_OF_WEEK[dayIndex];
        const exercises = historyEntry.plan[dayName] || [];
        setSnapshotData({ date: date, exercises: exercises, dayLabel: dayName });
        setCurrentView('snapshot');
    } else {
        setSnapshotData({ date: date, exercises: [], dayLabel: date.toLocaleDateString('en-US', { weekday: 'long' }) });
        setCurrentView('snapshot');
    }
  };

  const handleBackToWeek = () => { setCurrentView('week'); };

  const updateExercise = (day: DayOfWeek, exerciseId: string, updates: Partial<Exercise>) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: prev[day].map(ex => {
        if (ex.id === exerciseId) {
            if (updates.sets !== undefined && updates.sets !== ex.sets) {
                let newReps = [...ex.reps];
                let newWeights = [...ex.weight];
                if (updates.sets > ex.sets) {
                    const diff = updates.sets - ex.sets;
                    const lastRep = newReps.length > 0 ? newReps[newReps.length - 1] : '10';
                    const lastWeight = newWeights.length > 0 ? newWeights[newWeights.length - 1] : '0';
                    for(let i=0; i<diff; i++) { newReps.push(lastRep); newWeights.push(lastWeight); }
                } else {
                    newReps = newReps.slice(0, updates.sets);
                    newWeights = newWeights.slice(0, updates.sets);
                }
                return { ...ex, ...updates, reps: newReps, weight: newWeights };
            }
            return { ...ex, ...updates };
        }
        return ex;
      })
    }));
  };

  const updateRepValue = (day: DayOfWeek, exerciseId: string, index: number, value: string) => {
    setWeeklyPlan(prev => ({
        ...prev,
        [day]: prev[day].map(ex => {
            if (ex.id === exerciseId) {
                const newReps = [...ex.reps];
                newReps[index] = value;
                return { ...ex, reps: newReps };
            }
            return ex;
        })
    }));
  };

  const updateWeightValue = (day: DayOfWeek, exerciseId: string, index: number, value: string) => {
    setWeeklyPlan(prev => ({
        ...prev,
        [day]: prev[day].map(ex => {
            if (ex.id === exerciseId) {
                const newWeights = [...ex.weight];
                newWeights[index] = value;
                return { ...ex, weight: newWeights };
            }
            return ex;
        })
    }));
  };

  const addExercise = (day: DayOfWeek) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      muscleGroup: 'Muscle',
      sets: 3,
      reps: ['10', '10', '10'], 
      weight: ['10', '10', '10'],
      notes: '',
      completed: false
    };
    setWeeklyPlan(prev => ({ ...prev, [day]: [...prev[day], newExercise] }));
  };

  const deleteExercise = (day: DayOfWeek, exerciseId: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Delete Exercise?',
      message: 'This exercise will be permanently removed.',
      onConfirm: () => {
        setWeeklyPlan(prev => ({ ...prev, [day]: prev[day].filter(ex => ex.id !== exerciseId) }));
        setConfirmation(prev => ({ ...prev, isOpen: false }));
        showToast("Exercise deleted", "info");
      }
    });
  };

  const archiveCurrentWeek = () => {
    const hasExercises = Object.values(weeklyPlan).some((day: any) => day.length > 0);
    if (!hasExercises) return false;
    const stats = calculateStats(weeklyPlan);
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      weekLabel: getWeekLabel(weekCalendar),
      dateArchived: new Date().toISOString(),
      startDate: weekCalendar[0].fullDate.toISOString(),
      plan: weeklyPlan,
      stats: stats
    };
    setHistory(prev => [newEntry, ...prev]);
    return true;
  };

  const completeWeek = () => {
    setConfirmation({
      isOpen: true,
      title: 'Archive Week?',
      message: 'This will save your progress to History and start a fresh week. Are you sure?',
      onConfirm: () => {
        const archived = archiveCurrentWeek();
        if (archived) {
          const emptyPlan = getEmptyPlan();
          setWeeklyPlan(emptyPlan);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyPlan));
          setIsReportOpen(false); 
          setConfirmation(prev => ({ ...prev, isOpen: false }));
          showToast("Week saved to History!", "success");
        } else {
          setConfirmation(prev => ({ ...prev, isOpen: false }));
          alert("Cannot archive an empty week. Add some exercises first.");
        }
      }
    });
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyPlan));
    showToast("Workout saved successfully!", "success");
  };

  const handleGenerateWorkout = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedExercises = await generateWorkoutForDay(aiPrompt);
      const newExercises: Exercise[] = (generatedExercises as Partial<Exercise>[]).map(ex => ({
        ...ex,
        id: Math.random().toString(36).substr(2, 9),
        name: ex.name || "New Exercise",
        muscleGroup: ex.muscleGroup || 'Muscle',
        sets: ex.sets || 3,
        reps: Array.isArray(ex.reps) ? ex.reps : Array(ex.sets || 3).fill(String(ex.reps || 10)),
        weight: Array.isArray(ex.weight) ? ex.weight : Array(ex.sets || 3).fill(String(ex.weight || 10)),
        notes: ex.notes || "",
        completed: false
      }));

      setWeeklyPlan(prev => ({
        ...prev,
        [selectedDay]: [...prev[selectedDay], ...newExercises]
      }));
      setIsAIModalOpen(false);
      setAiPrompt('');
      showToast("AI exercises added to your plan", "success");
    } catch (error) {
      alert("Failed to generate workout. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditTitle = (day: string) => {
    setTitleEditModal({ isOpen: true, day, text: workoutTitles[day] || '' });
  };
  const saveTitle = () => {
    if (titleEditModal.day) {
      setWorkoutTitles(prev => ({ ...prev, [titleEditModal.day]: titleEditModal.text }));
      setTitleEditModal({ ...titleEditModal, isOpen: false });
      showToast("Title updated", "success");
    }
  };

  const handleExportData = () => {
    const data = { history, currentWeek: weeklyPlan, titles: workoutTitles, version: 3 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout_backup_v3_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.history && json.currentWeek) {
          if (window.confirm("This will overwrite your current data with the backup. Continue?")) {
             Object.keys(json.currentWeek).forEach(day => {
                json.currentWeek[day].forEach((ex: any) => {
                   const setLen = ex.sets || 3;
                   if (typeof ex.reps === 'number') ex.reps = Array(setLen).fill(String(ex.reps));
                   if (typeof ex.weight === 'number') ex.weight = Array(setLen).fill(String(ex.weight));
                });
             });
            setHistory(json.history);
            setWeeklyPlan(json.currentWeek);
            if (json.titles) setWorkoutTitles(json.titles);
            showToast("Data restored successfully!", "success");
          }
        } else {
          alert("Invalid backup file.");
        }
      } catch (err) { alert("Error reading file."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Components ---
  const renderConfirmationModal = () => {
    if (!confirmation.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
        <div className="glass-card w-full max-w-sm shadow-2xl p-6 rounded-2xl border border-zinc-700/50" onClick={e => e.stopPropagation()}>
           <h3 className="text-xl font-black uppercase italic text-white mb-2">{confirmation.title}</h3>
           <p className="text-zinc-300 text-sm mb-6 leading-relaxed">{confirmation.message}</p>
           <div className="flex gap-3">
             <button onClick={() => setConfirmation(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 text-zinc-400 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors bg-zinc-900/50 rounded-lg border border-transparent hover:border-zinc-700">Cancel</button>
             <button onClick={confirmation.onConfirm} className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-lg btn-shine">Confirm</button>
           </div>
        </div>
      </div>
    );
  };

  const renderTitleEditModal = () => {
    if (!titleEditModal.isOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
        <div className="glass-card w-full max-w-sm shadow-2xl p-6 rounded-2xl border border-zinc-700/50" onClick={e => e.stopPropagation()}>
           <h3 className="text-xl font-black uppercase italic text-white mb-2">Edit Title</h3>
           <p className="text-zinc-400 text-xs mb-4 uppercase tracking-wider">Focus for {titleEditModal.day}</p>
           <input type="text" autoFocus value={titleEditModal.text} onChange={(e) => setTitleEditModal(prev => ({...prev, text: e.target.value}))} className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-lg text-white font-bold focus:outline-none focus:border-white mb-6 placeholder-zinc-600 transition-all" placeholder="e.g. Chest & Back" />
           <div className="flex gap-3">
             <button onClick={() => setTitleEditModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 text-zinc-400 font-bold text-xs uppercase tracking-wider hover:text-white transition-colors bg-zinc-900/50 rounded-lg border border-transparent hover:border-zinc-700">Cancel</button>
             <button onClick={saveTitle} className="flex-1 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-lg btn-shine">Save</button>
           </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => (
    <div className="pb-24 animate-fade-in max-w-lg mx-auto min-h-screen text-white">
      {/* Changed sticky to relative and added background/blur to allow scrolling */}
      <header className="flex flex-col px-6 pt-8 pb-4 relative z-30 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <AILogo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
             <div>
                <h1 className="text-2xl font-black text-white tracking-tighter leading-none italic">
                  IRON<span className="text-zinc-500">LOG</span>
                </h1>
                <DigitalClock />
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsMonthlyReportOpen(true)} className="p-2.5 bg-zinc-900/80 rounded-full border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-lg"><BarChartIcon className="w-4 h-4 text-zinc-400" /></button>
            <button onClick={() => setCurrentView('history')} className="p-2.5 bg-zinc-900/80 rounded-full border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-lg"><ClockIcon className="w-4 h-4 text-zinc-400" /></button>
            <button onClick={() => setIsCalendarModalOpen(true)} className="p-2.5 bg-zinc-900/80 rounded-full border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-lg"><CalendarIcon className="w-4 h-4 text-zinc-400" /></button>
          </div>
        </div>
        {/* Increased padding (py-4, px-2) to prevent shadow clipping */}
        <div className="flex justify-between items-center w-full overflow-x-auto no-scrollbar gap-3 py-4 px-2">
          {weekCalendar.map((item) => (
            <button key={item.dayName} onClick={() => handleCalendarClick(item.dayName)} className={`flex flex-col items-center justify-center min-w-[44px] w-11 h-16 rounded-xl transition-all shrink-0 border ${item.isToday ? 'bg-white text-black border-white scale-110' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}>
              <span className="text-[9px] font-black uppercase tracking-wider opacity-70 mb-1">{item.dayName.substring(0, 3)}</span>
              <span className="text-lg font-black">{item.dateNum}</span>
            </button>
          ))}
        </div>
      </header>
      
      <div className="flex flex-col gap-4 px-4 mt-6">
        {DAYS_OF_WEEK.map((day, index) => {
          const exercises = weeklyPlan[day] as Exercise[];
          const count = exercises.length;
          const completedCount = exercises.filter(e => e.completed).length;
          const progress = count > 0 ? (completedCount / count) * 100 : 0;
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
          const calendarItem = weekCalendar.find(c => c.dayName === day);
          const dateLabel = calendarItem ? calendarItem.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : '';
          const dayTitle = workoutTitles[day] || 'Workout Focus';

          return (
            <div key={day} ref={el => dayRefs.current[day] = el} onClick={() => handleDayClick(day)} className={`group relative cursor-pointer p-0 transition-all rounded-2xl border overflow-hidden scroll-mt-40 shadow-lg ${isToday ? 'bg-zinc-900/80 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-black/40 border-zinc-800 hover:border-zinc-600'}`}>
              <div className="p-5 relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-baseline gap-3 mb-1">
                            <h3 className={`text-2xl font-black uppercase tracking-tighter italic leading-none ${isToday ? 'text-white' : 'text-zinc-300'}`}>{day}</h3>
                            <span className="text-[10px] font-bold text-zinc-600 tracking-wide">{dateLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 group/edit" onClick={(e) => e.stopPropagation()}>
                           <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{dayTitle}</p>
                           <button onClick={(e) => { e.stopPropagation(); handleEditTitle(day); }} className="opacity-0 group-hover/edit:opacity-100 p-1 text-zinc-500 hover:text-white transition-all"><EditIcon className="w-3 h-3" /></button>
                        </div>
                    </div>
                    {isToday && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white text-black shadow-glow">Today</span>}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                           <span className={`text-xs font-mono font-bold ${isToday ? 'text-white' : 'text-zinc-500'}`}>{completedCount}/{count}</span>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Exercises</span>
                      </div>
                      {count > 0 && completedCount === count && <CheckCircleIcon className="w-5 h-5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                  </div>
              </div>
              {/* Progress Bar Background */}
              <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
                  <div className="h-full bg-white transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 px-6 pb-12">
          <button onClick={() => setIsReportOpen(true)} className="w-full bg-zinc-900 border border-zinc-700 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-500 transition-all rounded-xl shadow-lg btn-shine">Week Report</button>
      </div>
    </div>
  );

  const renderDayView = () => {
    const exercises = weeklyPlan[selectedDay] as Exercise[];
    return (
      <div className="h-screen flex flex-col bg-transparent font-sans overflow-hidden">
        {/* Glass Header */}
        <div className="shrink-0 glass border-b border-white/10 px-4 flex items-center justify-between h-[72px] z-50">
          <button onClick={handleBackToWeek} className="p-2 -ml-2 text-zinc-300 hover:text-white transition-colors"><div className="flex items-center gap-1 font-bold uppercase tracking-wider text-xs"><ChevronLeftIcon className="w-5 h-5" />Back</div></button>
          <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">{selectedDay}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-auto relative custom-scrollbar">
          {exercises.length === 0 ? (
            <div className="text-center py-32 px-6 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800"><DumbbellIcon className="w-8 h-8 text-zinc-600" /></div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-white">Empty Workout</h3>
              <p className="text-zinc-500 text-sm mb-8">Start building your routine.</p>
              <div className="flex flex-col w-full max-w-xs gap-3">
                <button onClick={() => setIsAIModalOpen(true)} className="w-full bg-white text-black font-black uppercase tracking-wider py-4 px-6 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 btn-shine shadow-[0_0_20px_rgba(255,255,255,0.2)]"><SparklesIcon className="w-4 h-4" />AI Generate</button>
                <button onClick={() => addExercise(selectedDay)} className="w-full bg-zinc-900 text-white border border-zinc-700 font-black uppercase tracking-wider py-4 px-6 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" />Add Manual</button>
              </div>
            </div>
          ) : (
            <div className="min-w-full inline-block align-top pb-24">
              <table className="min-w-full min-w-[340px] table-fixed">
                <colgroup>
                  <col className="w-[28%]" /><col className="w-[14%]" /><col className="w-[28%]" /><col className="w-[22%]" /><col className="w-[8%]" />
                </colgroup>
                <thead className="glass sticky top-0 z-40 border-b border-white/5 shadow-lg">
                  <tr>
                    <th className="py-4 pl-4 pr-1 text-left text-[9px] font-black uppercase tracking-widest text-zinc-500">Exercise</th>
                    <th className="py-4 px-0 text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">Reps</th>
                    <th className="py-4 px-0 text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">{selectedDay === 'Sunday' ? 'Time' : 'Wgt'}</th>
                    <th className="py-4 pl-2 pr-1 text-left text-[9px] font-black uppercase tracking-widest text-zinc-500">Target</th>
                    <th className="py-4 pl-1 pr-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {exercises.map((ex) => (
                    <tr key={ex.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-4 pr-1 align-top">
                        <input type="text" value={ex.name} onChange={(e) => updateExercise(selectedDay, ex.id, { name: e.target.value })} className={`w-full bg-transparent font-bold text-sm text-white placeholder-zinc-700 focus:outline-none focus:placeholder-zinc-600 transition-colors ${ex.completed ? 'line-through opacity-50 text-zinc-500' : ''}`} placeholder="NAME" />
                        <div className="flex items-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Sets</span>
                           <input type="number" min="1" max="10" value={ex.sets} onChange={(e) => updateExercise(selectedDay, ex.id, { sets: parseInt(e.target.value) || 1 })} className="w-8 bg-zinc-900 border border-zinc-700 text-center text-[10px] font-bold text-white rounded focus:outline-none focus:border-white" />
                        </div>
                        <input value={ex.notes} onChange={(e) => updateExercise(selectedDay, ex.id, { notes: e.target.value })} placeholder="Add notes..." className="w-full bg-transparent text-[10px] text-zinc-500 mt-1 focus:outline-none focus:text-zinc-300 placeholder-zinc-800" />
                      </td>
                      <td className="py-4 px-0 align-top">
                         <div className="flex flex-col items-center gap-2">
                           {Array.from({ length: ex.sets }).map((_, i) => (
                              <input key={`rep-${i}`} type="text" inputMode="numeric" value={ex.reps[i] || ''} onChange={(e) => updateRepValue(selectedDay, ex.id, i, e.target.value)} className={`w-10 h-8 bg-zinc-900/50 border border-transparent focus:border-zinc-500 focus:bg-black text-center font-bold text-sm text-white focus:outline-none rounded transition-all ${ex.completed ? 'opacity-40' : ''}`} placeholder="-" />
                           ))}
                        </div>
                      </td>
                      <td className="py-4 px-0 align-top">
                         <div className="flex flex-col items-center gap-2">
                           {Array.from({ length: ex.sets }).map((_, i) => (
                              <input key={`wgt-${i}`} type="text" inputMode="decimal" value={ex.weight[i] || ''} onChange={(e) => updateWeightValue(selectedDay, ex.id, i, e.target.value)} className={`w-16 h-8 bg-zinc-900/50 border border-transparent focus:border-zinc-500 focus:bg-black text-center font-bold text-sm text-white focus:outline-none rounded transition-all ${ex.completed ? 'opacity-40' : ''}`} placeholder="-" />
                           ))}
                        </div>
                      </td>
                      <td className="py-4 pl-2 pr-1 align-top">
                         <textarea rows={ex.sets > 1 ? ex.sets : 2} value={ex.muscleGroup} onChange={(e) => updateExercise(selectedDay, ex.id, { muscleGroup: e.target.value })} className="w-full bg-transparent text-[10px] font-medium text-zinc-400 focus:outline-none focus:text-white resize-none border-b border-transparent focus:border-zinc-700 p-1 leading-relaxed" placeholder="Target" />
                      </td>
                      <td className="py-4 pl-1 pr-2 align-top text-right">
                        <div className="flex flex-col items-end gap-4 pt-1">
                          <button onClick={() => updateExercise(selectedDay, ex.id, { completed: !ex.completed })} className={`p-2 rounded-full transition-all duration-300 ${ex.completed ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-zinc-900 text-zinc-600 hover:text-white hover:bg-zinc-800 border border-zinc-800'}`}><CheckCircleIcon className={`w-4 h-4 ${ex.completed ? 'animate-pop' : ''}`} /></button>
                          <button onClick={() => deleteExercise(selectedDay, ex.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><TrashIcon className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 flex gap-3 glass sticky bottom-0 z-40 border-t border-white/5 backdrop-blur-xl">
                 <button onClick={() => setIsAIModalOpen(true)} className="flex-1 bg-black/80 border border-zinc-700 text-white font-bold text-[10px] uppercase tracking-wider py-3 px-4 hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 rounded-lg"><SparklesIcon className="w-3 h-3" />Add AI Exercise</button>
                <button onClick={() => addExercise(selectedDay)} className="flex-1 bg-white text-black font-bold text-[10px] uppercase tracking-wider py-3 px-4 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 rounded-lg btn-shine"><PlusIcon className="w-3 h-3" />Add Exercise</button>
              </div>

              <div className="p-6 pt-4">
                 <button onClick={handleSave} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all active:scale-[0.99] shadow-lg">Save Workout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHistoryView = () => (
    <div className="flex flex-col min-h-screen">
      <div className="shrink-0 glass border-b border-white/10 px-4 flex items-center justify-between h-[72px] sticky top-0 z-50">
        <button onClick={handleBackToWeek} className="p-2 -ml-2 text-zinc-300 hover:text-white transition-colors"><div className="flex items-center gap-1 font-bold uppercase tracking-wider text-xs"><ChevronLeftIcon className="w-5 h-5" />Back</div></button>
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">History</h2>
        <div className="flex gap-2">
            <button onClick={handleExportData} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600">Backup</button>
            <button onClick={handleImportClick} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600">Restore</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
        </div>
      </div>

      <div className="flex-1 p-4 pb-24 space-y-8">
        {history.length === 0 ? (
           <div className="text-center py-20 opacity-50"><ClockIcon className="w-12 h-12 mx-auto mb-4 text-zinc-600" /><p className="font-bold uppercase tracking-widest text-zinc-500">No History Yet</p></div>
        ) : (
          Object.entries(groupedHistory).map(([monthYear, entries]) => (
            <div key={monthYear} className="animate-fade-in">
              <h3 className="text-sm font-black uppercase text-zinc-500 mb-4 sticky top-[80px] glass py-2 px-3 rounded-lg inline-block z-10 backdrop-blur-md border border-white/5 shadow-lg">{monthYear}</h3>
              <div className="space-y-4 pl-2 border-l border-zinc-800 ml-4">
                {(entries as HistoryEntry[]).map(entry => (
                  <div key={entry.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-all ml-4 relative">
                    <div className="absolute -left-[25px] top-6 w-4 h-4 rounded-full bg-black border-2 border-zinc-700"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-black uppercase italic tracking-wider text-white">{entry.weekLabel}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">Started: {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xl font-black text-white">{entry.stats.totalVolume.toLocaleString()}</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Vol</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                        <div className="text-center"><p className="text-lg font-bold text-zinc-200">{entry.stats.totalExercises}</p><p className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Done</p></div>
                        <div className="text-center border-l border-white/5"><p className="text-lg font-bold text-zinc-200">{entry.stats.totalSets}</p><p className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Sets</p></div>
                        <div className="text-center border-l border-white/5"><p className="text-lg font-bold text-zinc-200 truncate px-1">{entry.stats.topMuscle}</p><p className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">Focus</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSnapshotView = () => {
    if (!snapshotData) return null;
    const { date, exercises, dayLabel } = snapshotData;
    return (
       <div className="h-screen flex flex-col bg-black text-white font-sans overflow-hidden">
        <div className="shrink-0 glass border-b border-white/10 px-4 flex items-center justify-between h-[72px] z-50">
          <button onClick={handleBackToWeek} className="p-2 -ml-2 text-zinc-300 hover:text-white transition-colors"><div className="flex items-center gap-1 font-bold uppercase tracking-wider text-xs"><ChevronLeftIcon className="w-5 h-5" />Back</div></button>
          <div className="text-center"><h2 className="text-xl font-black uppercase tracking-tighter italic text-white truncate">{dayLabel}</h2><p className="text-[10px] text-zinc-500 font-mono font-bold">{date.toLocaleDateString()}</p></div><div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-auto bg-black relative p-0">
             {exercises.length === 0 ? (
               <div className="text-center py-20 opacity-50"><DumbbellIcon className="w-12 h-12 mx-auto mb-4" /><p className="font-bold uppercase tracking-widest">No Workout Data</p></div>
             ) : (
                <table className="min-w-full divide-y divide-zinc-800 table-fixed">
                <colgroup><col className="w-[30%]" /><col className="w-[15%]" /><col className="w-[20%]" /><col className="w-[25%]" /><col className="w-[10%]" /></colgroup>
                <thead className="glass sticky top-0 z-40 border-b border-white/10"><tr><th className="py-3 pl-4 pr-1 text-left text-[9px] font-black uppercase tracking-widest text-zinc-500">Exercise</th><th className="py-3 px-0 text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">Reps</th><th className="py-3 px-0 text-center text-[9px] font-black uppercase tracking-widest text-zinc-500">Wgt</th><th className="py-3 pl-2 pr-1 text-left text-[9px] font-black uppercase tracking-widest text-zinc-500">Muscle</th><th className="py-3 pl-1 pr-2"></th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {exercises.map((ex) => (
                    <tr key={ex.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-4 pr-1 align-top"><div className={`font-bold text-sm text-white ${ex.completed ? 'line-through opacity-50' : ''}`}>{ex.name}</div>{ex.notes && <div className="text-[10px] text-zinc-600 mt-1">{ex.notes}</div>}</td>
                      <td className="py-3 px-0 align-top text-center font-bold text-zinc-300 text-xs">{Array.isArray(ex.reps) ? <div className="flex flex-col gap-1">{ex.reps.map((r, i) => <span key={i}>{r}</span>)}</div> : ex.reps}</td>
                      <td className="py-3 px-0 align-top text-center font-bold text-zinc-300 text-xs">{Array.isArray(ex.weight) ? <div className="flex flex-col gap-1">{ex.weight.map((w, i) => <span key={i}>{w}</span>)}</div> : ex.weight}</td>
                      <td className="py-3 pl-2 pr-1 align-top text-[10px] text-zinc-500">{ex.muscleGroup}</td>
                      <td className="py-3 pl-1 pr-2 align-top text-right">{ex.completed && <CheckCircleIcon className="w-4 h-4 text-green-500 inline-block" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
             )}
        </div>
        <div className="glass p-3 text-center text-[9px] uppercase font-bold tracking-widest text-zinc-500 border-t border-white/10">Snapshot View</div>
       </div>
    );
  }

  const renderAIModal = () => {
    if (!isAIModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in">
        <div className="glass-card w-full max-w-md shadow-2xl p-8 rounded-2xl border border-zinc-700/50" onClick={e => e.stopPropagation()}>
          <h3 className="text-2xl font-black uppercase italic mb-2 text-white">AI Builder</h3>
          <p className="text-zinc-400 font-mono text-xs mb-6 uppercase tracking-wider">Describe your target workout</p>
          <textarea autoFocus value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-600 p-4 rounded-xl text-white font-bold focus:outline-none focus:border-white resize-none mb-6 placeholder-zinc-600 shadow-inner" rows={3} placeholder="e.g. Chest and Triceps hypertrophy..." />
          <div className="flex gap-4">
            <button onClick={() => setIsAIModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-bold text-sm uppercase tracking-wider hover:text-white transition-all bg-zinc-900/50 rounded-lg">Cancel</button>
            <button onClick={handleGenerateWorkout} disabled={isGenerating || !aiPrompt.trim()} className="flex-1 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 transition-all rounded-lg btn-shine shadow-[0_0_15px_rgba(255,255,255,0.2)]">{isGenerating ? 'Working...' : 'Generate'}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekReportModal = () => {
    if (!isReportOpen) return null;
    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
        <div className="glass-card w-full max-w-md shadow-2xl p-8 rounded-2xl border border-zinc-700/50" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-3xl font-black uppercase italic mb-2 text-white">Week Report</h3>
          <p className="text-zinc-500 font-mono text-xs mb-8 uppercase tracking-wider">Current Week Summary</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Sets</p><p className="text-3xl font-black text-white">{weeklyStats.totalSets}</p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Completed</p><p className="text-3xl font-black text-white">{weeklyStats.totalExercises}</p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl col-span-2"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Volume</p><p className="text-3xl font-black text-white">{weeklyStats.totalVolume.toLocaleString()} <span className="text-sm text-zinc-600 font-bold">KG/LBS</span></p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl col-span-2"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Top Focus</p><p className="text-2xl font-black text-white uppercase">{weeklyStats.topMuscle}</p></div>
          </div>
          <div className="space-y-3">
             <button onClick={completeWeek} className="w-full bg-zinc-900 border border-zinc-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-800 hover:border-zinc-400 transition-all btn-shine">Complete & Archive Week</button>
            <button onClick={() => setIsReportOpen(false)} className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all rounded-xl">Close</button>
          </div>
        </div>
      </div>
    )
  }

  const renderMonthlyReportModal = () => {
    if (!isMonthlyReportOpen) return null;
    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
        <div className="glass-card w-full max-w-md shadow-2xl p-8 rounded-2xl border border-zinc-700/50" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-3xl font-black uppercase italic mb-2 text-white">{monthlyStats.monthName}</h3>
          <p className="text-zinc-500 font-mono text-xs mb-8 uppercase tracking-wider">Monthly Performance</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Completed</p><p className="text-3xl font-black text-white">{monthlyStats.totalExercises}</p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Sets</p><p className="text-3xl font-black text-white">{monthlyStats.totalSets}</p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl col-span-2"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Volume</p><p className="text-3xl font-black text-white">{monthlyStats.totalVolume.toLocaleString()} <span className="text-sm text-zinc-600 font-bold">LBS/KG</span></p></div>
             <div className="bg-zinc-900/50 p-4 border border-zinc-700 rounded-xl col-span-2"><p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Top Focus</p><p className="text-2xl font-black text-white uppercase">{monthlyStats.topMuscle}</p></div>
          </div>
          <button onClick={() => setIsMonthlyReportOpen(false)} className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all rounded-xl btn-shine">Close Report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black">
      {currentView === 'history' ? renderHistoryView() : currentView === 'snapshot' ? renderSnapshotView() : currentView === 'week' ? renderWeekView() : renderDayView()}
      {renderAIModal()}
      {renderWeekReportModal()}
      {renderMonthlyReportModal()}
      {renderConfirmationModal()}
      {renderTitleEditModal()}
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} completedDates={completedDates} onOpenWorkout={handleOpenWorkoutFromCalendar} />
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} type={toast.type} />
    </div>
  );
}

export default App;
