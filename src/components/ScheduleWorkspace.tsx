import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Play, 
  Plus, 
  Trash2, 
  BookOpen, 
  RotateCcw,
  Compass,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers
} from 'lucide-react';
import { StudyPlan, StudySessionTask, SubjectItem } from '../types/student';

interface ScheduleWorkspaceProps {
  onStartSessionTimer: (topic: string, durationMinutes: number) => void;
  onOpenQuizForTopic: (topic: string) => void;
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 's1',
    name: 'Multivariable Calculus',
    category: 'STEM',
    difficulty: 'hard',
    examDate: 'Oct 14',
    targetGoal: 'Master Green’s Theorem & Stokes’ Theorem',
    masteryScore: 72,
    accentColor: '#14b8a6',
  },
  {
    id: 's2',
    name: 'Neuroscience & Synapses',
    category: 'STEM',
    difficulty: 'medium',
    examDate: 'Oct 22',
    targetGoal: 'Long-term potentiation & neurotransmitters',
    masteryScore: 84,
    accentColor: '#6366f1',
  },
  {
    id: 's3',
    name: 'Microeconomics',
    category: 'Social Sciences',
    difficulty: 'medium',
    examDate: 'Nov 02',
    targetGoal: 'Monopoly deadweight loss & game equilibria',
    masteryScore: 65,
    accentColor: '#38bdf8',
  },
];

const INITIAL_PLAN: StudyPlan = {
  planTitle: 'Adaptive 7-Day Cognitive Spaced Repetition Schedule',
  overview: 'Engineered using the Ebbinghaus forgetting curve: high-intensity problem solving in the morning/evening, interleaved with 15-minute active recall checkpoints 3 days post-learning.',
  dailyTargetHours: 2.2,
  keyStrategies: [
    'Interleaving: Alternate between Calculus and Neuroscience to strengthen neural pathways',
    'Active Recall Drills: Always test before re-reading notes',
    'Spaced Checkpoints: Re-test Day 1 topics on Day 4'
  ],
  days: [
    {
      dayIndex: 0,
      dayName: 'Monday',
      isRestDay: false,
      focusSubject: 'Multivariable Calculus',
      dailyGoal: 'Derive and practice Stokes’ Theorem line integrals',
      sessions: [
        {
          id: 'mon-1',
          subject: 'Multivariable Calculus',
          topic: 'Line Integrals & Vector Fields',
          durationMinutes: 45,
          technique: 'Problem-Set Drill',
          tasks: ['Work through 4 textbook boundary problems', 'Map visual intuition in 3D'],
          completed: true,
          difficulty: 'hard',
          energyLevelRequired: 'high',
        },
        {
          id: 'mon-2',
          subject: 'Neuroscience & Synapses',
          topic: 'Synaptic Vesicle Exocytosis',
          durationMinutes: 30,
          technique: 'Feynman Explanation',
          tasks: ['Explain SNARE complex role out loud', 'Draw active zone membrane fusion'],
          completed: false,
          difficulty: 'medium',
          energyLevelRequired: 'medium',
        },
      ],
    },
    {
      dayIndex: 1,
      dayName: 'Tuesday',
      isRestDay: false,
      focusSubject: 'Microeconomics',
      dailyGoal: 'Derive Oligopoly Nash Equilibria (Cournot vs Bertrand)',
      sessions: [
        {
          id: 'tue-1',
          subject: 'Microeconomics',
          topic: 'Cournot Duopoly Model',
          durationMinutes: 45,
          technique: 'Mathematical Derivation',
          tasks: ['Derive reaction curves algebraically', 'Calculate equilibrium price & deadweight loss'],
          completed: false,
          difficulty: 'medium',
          energyLevelRequired: 'high',
        },
        {
          id: 'tue-2',
          subject: 'Multivariable Calculus',
          topic: 'Active Recall Check: Green’s Theorem',
          durationMinutes: 20,
          technique: 'Spaced Repetition Flashcards',
          tasks: ['Solve 2 quick curl test problems without formula sheet'],
          completed: false,
          difficulty: 'easy',
          energyLevelRequired: 'medium',
        },
      ],
    },
    {
      dayIndex: 2,
      dayName: 'Wednesday',
      isRestDay: false,
      focusSubject: 'Neuroscience & Synapses',
      dailyGoal: 'Long-term Potentiation (LTP) & NMDA Receptor Cascade',
      sessions: [
        {
          id: 'wed-1',
          subject: 'Neuroscience & Synapses',
          topic: 'NMDA/AMPA Receptor Dynamics',
          durationMinutes: 50,
          technique: 'Deep Concept Mapping',
          tasks: ['Diagram magnesium block removal mechanism', 'Trace CaMKII and retrograde messenger pathway'],
          completed: false,
          difficulty: 'hard',
          energyLevelRequired: 'high',
        },
      ],
    },
    {
      dayIndex: 3,
      dayName: 'Thursday',
      isRestDay: false,
      focusSubject: 'Multivariable Calculus',
      dailyGoal: 'Divergence Theorem & Surface Integrals',
      sessions: [
        {
          id: 'thu-1',
          subject: 'Multivariable Calculus',
          topic: 'Flux Integrals across Closed Surfaces',
          durationMinutes: 50,
          technique: 'High-Yield Exam Drill',
          tasks: ['Convert surface flux integrals to triple volume integrals'],
          completed: false,
          difficulty: 'hard',
          energyLevelRequired: 'high',
        },
        {
          id: 'thu-2',
          subject: 'Microeconomics',
          topic: 'Bertrand Competition & Capacity Constraints',
          durationMinutes: 30,
          technique: 'Case Analysis',
          tasks: ['Analyze price wars and edge-case assumptions'],
          completed: false,
          difficulty: 'medium',
          energyLevelRequired: 'medium',
        },
      ],
    },
    {
      dayIndex: 4,
      dayName: 'Friday',
      isRestDay: false,
      focusSubject: 'Cross-Topic Synthesis',
      dailyGoal: 'Weekly Active Recall & Weak-Spot Consolidation',
      sessions: [
        {
          id: 'fri-1',
          subject: 'Multivariable Calculus',
          topic: 'Weekly Timed Quiz Drill',
          durationMinutes: 40,
          technique: 'Timed Simulation',
          tasks: ['Complete 3 past exam challenge questions under 35 mins'],
          completed: false,
          difficulty: 'hard',
          energyLevelRequired: 'high',
        },
        {
          id: 'fri-2',
          subject: 'Neuroscience & Synapses',
          topic: 'Spaced Recall: LTP vs LTD',
          durationMinutes: 25,
          technique: 'Flashcard Drill',
          tasks: ['Review high-yield molecular differences'],
          completed: false,
          difficulty: 'medium',
          energyLevelRequired: 'low',
        },
      ],
    },
    {
      dayIndex: 5,
      dayName: 'Saturday',
      isRestDay: false,
      focusSubject: 'Deep Exploration',
      dailyGoal: 'Microeconomics Problem Sets & Review',
      sessions: [
        {
          id: 'sat-1',
          subject: 'Microeconomics',
          topic: 'Price Discrimination & Surplus Transfer',
          durationMinutes: 45,
          technique: 'Graphical Modeling',
          tasks: ['Graph 1st, 2nd, and 3rd degree surplus allocations'],
          completed: false,
          difficulty: 'medium',
          energyLevelRequired: 'medium',
        },
      ],
    },
    {
      dayIndex: 6,
      dayName: 'Sunday',
      isRestDay: true,
      focusSubject: 'Rest & Mental Consolidation',
      dailyGoal: 'Consolidate memory with light walk and 15m review',
      sessions: [
        {
          id: 'sun-1',
          subject: 'General Review',
          topic: 'Weekly Reflection & Next Week Preview',
          durationMinutes: 20,
          technique: 'Reflective Audit',
          tasks: ['Identify the 2 hardest concepts from this week for priority next week'],
          completed: false,
          difficulty: 'easy',
          energyLevelRequired: 'low',
        },
      ],
    },
  ],
  spacedRepetitionCheckpoints: [
    { dayOffset: 3, topic: 'Calculus Green’s Theorem', description: 'Review Day 1 derivations to prevent 40% memory decay' },
    { dayOffset: 5, topic: 'NMDA Receptor Cascade', description: 'Quick 10m recall of calcium second-messenger steps' },
  ],
};

export const ScheduleWorkspace: React.FC<ScheduleWorkspaceProps> = ({
  onStartSessionTimer,
  onOpenQuizForTopic,
}) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>(DEFAULT_SUBJECTS);
  const [weeklyHours, setWeeklyHours] = useState(14);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [preferredWindow, setPreferredWindow] = useState('evening');
  const [challenges, setChallenges] = useState('Struggling to remember multi-step math derivations and biology molecular pathways');

  const [plan, setPlan] = useState<StudyPlan>(INITIAL_PLAN);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // New Subject input
  const [newSubName, setNewSubName] = useState('');
  const [newSubExamDate, setNewSubExamDate] = useState('');
  const [newSubDiff, setNewSubDiff] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleGenerateAISchedule = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({
            name: s.name,
            examDate: s.examDate,
            difficulty: s.difficulty,
          })),
          weeklyHours,
          daysPerWeek,
          preferredTimeOfDay: preferredWindow,
          currentChallenges: challenges,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate schedule from server');
      }

      const generatedPlan = await res.json();
      setPlan(generatedPlan);
      setShowConfigModal(false);
    } catch (err: any) {
      console.error('Schedule generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskComplete = (dayIndex: number, sessionId: string) => {
    setPlan((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayIndex !== dayIndex) return day;
        return {
          ...day,
          sessions: day.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return { ...sess, completed: !sess.completed };
          }),
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const newSub: SubjectItem = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      category: 'STEM',
      difficulty: newSubDiff,
      examDate: newSubExamDate || 'TBD',
      masteryScore: 50,
      accentColor: '#14b8a6',
    };
    setSubjects((prev) => [...prev, newSub]);
    setNewSubName('');
    setNewSubExamDate('');
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Stats
  const allSessions = plan.days.flatMap((d) => d.sessions);
  const completedSessions = allSessions.filter((s) => s.completed);
  const totalMinutes = allSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = completedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const progressPercent = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  const currentDay = plan.days[selectedDayIndex] || plan.days[0];

  return (
    <div className="max-w-5xl mx-auto w-full pb-16">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300 mb-1 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>Spaced Repetition & Study Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Personalized Learning Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Intelligently distributed study blocks optimized to beat the forgetting curve.
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Regenerate AI Plan</span>
        </button>
      </div>

      {/* Progress & Strategy Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Progress Card */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Weekly Completion</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white tabular-nums font-mono">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-400">
                ({Math.round(completedMinutes / 60 * 10) / 10} / {Math.round(totalMinutes / 60 * 10) / 10} hrs)
              </span>
            </div>
            {/* Liquid progress bar */}
            <div className="w-36 h-1.5 rounded-full bg-slate-800/80 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <TrendingUp className="w-7 h-7 text-teal-400/50" />
        </div>

        {/* Daily Target */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Daily Focus Target</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-teal-300 tabular-nums font-mono">
                {plan.dailyTargetHours || 2.5}
              </span>
              <span className="text-xs text-slate-400">hours/day</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {allSessions.length} total cognitive sessions
            </span>
          </div>
          <Clock className="w-7 h-7 text-teal-400/50" />
        </div>

        {/* Active Courses */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Active Subjects</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-indigo-300 tabular-nums font-mono">
                {subjects.length}
              </span>
              <span className="text-xs text-slate-400">tracked</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate max-w-[180px]">
              Next: {subjects[0]?.name || 'Study'}
            </span>
          </div>
          <Brain className="w-7 h-7 text-indigo-400/50" />
        </div>
      </div>

      {/* Days Segmented Navigator */}
      <div className="liquid-glass rounded-2xl p-1.5 mb-6 border border-white/10 flex items-center gap-1 overflow-x-auto shadow-md">
        {plan.days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const completedCount = day.sessions.filter((s) => s.completed).length;
          const totalCount = day.sessions.length;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-500/25 border border-teal-400/35 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold">{day.dayName}</span>
                {day.isRestDay ? (
                  <span className="text-[10px] text-indigo-300 font-medium">Rest</span>
                ) : (
                  <span className="text-[10px] font-mono tabular-nums text-slate-400">
                    {completedCount}/{totalCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {day.focusSubject}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      {currentDay && (
        <div className="space-y-4">
          {/* Day Header Box */}
          <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
                <span>{currentDay.dayName}</span>
                <span>·</span>
                <span className="text-slate-300">{currentDay.focusSubject}</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Goal: {currentDay.dailyGoal}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenQuizForTopic(currentDay.focusSubject)}
                className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quiz Today's Focus</span>
              </button>
            </div>
          </div>

          {/* Session Cards */}
          <div className="space-y-3">
            {currentDay.sessions.map((session) => (
              <div
                key={session.id}
                className={`liquid-glass rounded-2xl p-4 sm:p-5 border transition-all ${
                  session.completed
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => handleToggleTaskComplete(currentDay.dayIndex, session.id)}
                      className="mt-1 text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                      title={session.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {session.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-teal-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-teal-300">
                          {session.subject}
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {session.durationMinutes} mins
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-[11px] text-indigo-300">
                          {session.technique}
                        </span>
                      </div>

                      <h4 className={`text-sm font-semibold text-slate-100 ${session.completed ? 'line-through opacity-70' : ''}`}>
                        {session.topic}
                      </h4>

                      {/* Sub-tasks */}
                      {session.tasks && session.tasks.length > 0 && (
                        <ul className="mt-2.5 space-y-1 text-xs text-slate-300">
                          {session.tasks.map((task, tidx) => (
                            <li key={tidx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400/60 mt-1.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Right: Launch Timer Button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => onStartSessionTimer(`${session.subject}: ${session.topic}`, session.durationMinutes)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Launch Liquid Focus Sanctuary with this session"
                    >
                      <Play className="w-3.5 h-3.5 fill-teal-300" />
                      <span>Focus ({session.durationMinutes}m)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spaced Repetition Checkpoints timeline */}
          {plan.spacedRepetitionCheckpoints && plan.spacedRepetitionCheckpoints.length > 0 && (
            <div className="mt-8 liquid-glass rounded-2xl p-5 border border-indigo-500/20 bg-indigo-950/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>Cognitive Spaced Repetition Reminders</span>
              </div>
              <div className="space-y-2">
                {plan.spacedRepetitionCheckpoints.map((cp, cidx) => (
                  <div key={cidx} className="flex items-start gap-3 text-xs text-slate-300 p-2.5 rounded-xl liquid-glass-subtle border border-white/5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-semibold">
                      +{cp.dayOffset}d Recall
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-100">{cp.topic}: </span>
                      <span className="text-slate-300">{cp.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Schedule Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl liquid-glass border border-white/12 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              Configure Your Adaptive Study Plan
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Gemini will synthesize an optimal 7-day spaced repetition schedule based on your subjects, upcoming exams, and cognitive energy peaks.
            </p>

            {/* Subject List Manager */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Enrolled Subjects & Exams
              </label>

              <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2.5 rounded-xl liquid-glass-subtle border border-white/8 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{sub.name}</span>
                      <span className="text-slate-400 ml-2">Exam: {sub.examDate || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-teal-400">
                        {sub.difficulty}
                      </span>
                      <button
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Subject Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Subject name (e.g. Molecular Biology)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="liquid-glass-input flex-1 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Exam Date (e.g. Nov 12)"
                  value={newSubExamDate}
                  onChange={(e) => setNewSubExamDate(e.target.value)}
                  className="liquid-glass-input w-28 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                />
                <select
                  value={newSubDiff}
                  onChange={(e) => setNewSubDiff(e.target.value as any)}
                  className="liquid-glass-input px-2 py-1.5 rounded-lg text-xs text-slate-300"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  onClick={handleAddSubject}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/25 hover:bg-teal-500/35 border border-teal-400/30 text-teal-200 text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Time Controls */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Weekly Study Hours: {weeklyHours}h
                </label>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Preferred Focus Window
                </label>
                <select
                  value={preferredWindow}
                  onChange={(e) => setPreferredWindow(e.target.value)}
                  className="liquid-glass-input w-full px-3 py-1.5 rounded-lg text-xs text-slate-200"
                >
                  <option value="morning">Morning (Early clarity)</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening / Night</option>
                </select>
              </div>
            </div>

            {/* Current Weaknesses or Challenges */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Specific Conceptual Weaknesses or Exam Focus
              </label>
              <textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="e.g. Need more practice with line integrals and organic synthesis mechanisms..."
                rows={2}
                className="liquid-glass-input w-full p-2.5 rounded-xl text-xs text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAISchedule}
                disabled={isGenerating || subjects.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Adaptive Schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Optimized Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
