export type TutoringMode = 'socratic' | 'explainer' | 'drill';
export type DepthLevel = 'intuitive' | 'academic' | 'rigorous';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestedFollowUps?: string[];
  subject?: string;
  tutoringMode?: TutoringMode;
}

export interface SubjectItem {
  id: string;
  name: string;
  category: 'STEM' | 'Humanities' | 'Social Sciences' | 'Languages' | 'Other';
  difficulty: 'easy' | 'medium' | 'hard';
  examDate?: string;
  targetGoal?: string;
  masteryScore: number; // 0 - 100
  accentColor: string;
}

export interface FormalStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formulaOrKeyConcept?: string;
}

export interface SelfCheckChallenge {
  question: string;
  hint: string;
  solution: string;
}

export interface DeepDiveResult {
  title: string;
  coreIntuition: string;
  formalSteps: FormalStep[];
  realWorldAnalogy: string;
  commonPitfalls: string[];
  practicalApplication?: string;
  selfCheckChallenge: SelfCheckChallenge;
}

export interface StudySessionTask {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  technique: string;
  tasks: string[];
  completed?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  energyLevelRequired?: 'low' | 'medium' | 'high';
}

export interface StudyDay {
  dayIndex: number;
  dayName: string;
  isRestDay: boolean;
  focusSubject: string;
  dailyGoal: string;
  sessions: StudySessionTask[];
}

export interface SpacedRepetitionCheckpoint {
  dayOffset: number;
  topic: string;
  description: string;
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  dailyTargetHours: number;
  keyStrategies: string[];
  days: StudyDay[];
  spacedRepetitionCheckpoints: SpacedRepetitionCheckpoint[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  keyConcept: string;
}

export interface QuizResult {
  topic: string;
  questions: QuizQuestion[];
}

export interface AnswerEvaluation {
  scorePercent: number;
  verdict: string;
  strengths: string[];
  misconceptionsOrGaps: string[];
  improvedExplanation: string;
  encouragement: string;
}

export type AmbientSoundType = 'off' | 'rain' | 'ocean' | 'whitenoise' | 'binaural';
