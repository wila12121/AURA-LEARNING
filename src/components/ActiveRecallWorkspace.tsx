import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight,
  Brain,
  Award
} from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types/student';

interface ActiveRecallWorkspaceProps {
  initialTopic?: string;
}

const DEFAULT_QUIZ: QuizResult = {
  topic: 'Calculus & Stokes Theorem',
  questions: [
    {
      id: 'q1',
      question: 'What is the fundamental geometric meaning of the curl of a 3D vector field at a point?',
      options: [
        'The net fluid expansion or contraction away from the point',
        'The infinitesimal circulation and axis of rotation per unit area',
        'The gradient of the scalar potential field along the normal vector',
        'The total outward flux passing through an enclosed surface'
      ],
      correctIndex: 1,
      explanation: 'The curl measures the microscopic rotation (circulation per unit area) around a point, oriented along the axis of rotation via the right-hand rule. Option A describes divergence, and Option D describes flux.',
      keyConcept: 'Curl = Microscopic rotation density; Divergence = Microscopic expansion density.'
    },
    {
      id: 'q2',
      question: 'Under what specific geometric condition does Stokes’ Theorem relate a surface integral of curl to a line integral?',
      options: [
        'The surface must be a completely closed sphere or torus without any boundary',
        'The surface must be an oriented smooth surface bounded by a closed, piecewise-smooth curve C',
        'The vector field must have zero divergence everywhere in space',
        'The line integral must be evaluated in a clockwise direction regardless of surface orientation'
      ],
      correctIndex: 1,
      explanation: 'Stokes’ Theorem states that ∬_S (∇ × F) · dS = ∮_∂S F · dr, requiring an oriented surface S bounded by a closed curve ∂S with consistent right-hand orientation.',
      keyConcept: 'Stokes Theorem links the surface flux of curl to the circulation around its boundary curve.'
    },
    {
      id: 'q3',
      question: 'In cellular neurobiology, why does an action potential only propagate forward along an axon and not backward?',
      options: [
        'Because neurotransmitters are only synthesized at the axon hillock',
        'Due to the absolute and relative refractory period of voltage-gated sodium channels',
        'Because myelin sheaths mechanically block backward ion diffusion',
        'Because potassium ions are actively pumped out of the cell toward the soma'
      ],
      correctIndex: 1,
      explanation: 'Following depolarization, voltage-gated Na+ channels enter an inactivated state (refractory period). Even though local current spreads in both directions, backward membrane cannot re-fire, enforcing unidirectional propagation.',
      keyConcept: 'Inactivation gates of Na+ channels enforce unidirectional axon signal propagation.'
    }
  ]
};

export const ActiveRecallWorkspace: React.FC<ActiveRecallWorkspaceProps> = ({
  initialTopic = 'Calculus & Stokes Theorem',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'introductory' | 'intermediate' | 'advanced'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<QuizResult>(DEFAULT_QUIZ);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [qId: string]: boolean }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerateQuiz = async (topicToUse?: string) => {
    const t = (topicToUse || topic).trim();
    if (!t || isGenerating) return;

    setIsGenerating(true);
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          difficulty,
          count: 4,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate quiz from server');
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuiz(data);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (selectedAnswers[qId] !== undefined) return; // already answered

    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Score calculation
  const totalQuestions = quiz.questions.length;
  const correctCount = quiz.questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const currentQ = quiz.questions[currentIndex];
  const hasAnsweredCurrent = currentQ && selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300 mb-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
          <Zap className="w-3.5 h-3.5" />
          <span>Active Recall Drill Arena</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">
          Cement Memory Through Retrieval Practice
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Cognitive research proves retrieval practice is 3× more effective than passive re-reading. Test your intuition on any topic.
        </p>
      </div>

      {/* Quiz Generator Input Bar */}
      <div className="liquid-glass rounded-2xl p-3 sm:p-4 mb-8 border border-white/10 flex flex-wrap items-center gap-3 shadow-md">
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic to test (e.g. Organic Chemistry Stereocenters, Navier-Stokes, Game Theory)"
            className="liquid-glass-input w-full px-3.5 py-2 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="liquid-glass-input py-2 px-3 rounded-xl border border-white/10 bg-slate-900/80 text-xs text-slate-200 cursor-pointer"
        >
          <option value="introductory">Introductory</option>
          <option value="intermediate">Intermediate Core</option>
          <option value="advanced">Advanced Exam Level</option>
        </select>

        <button
          onClick={() => handleGenerateQuiz()}
          disabled={!topic.trim() || isGenerating}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Generate Drill</span>
            </>
          )}
        </button>
      </div>

      {/* Quiz Completed Screen */}
      {isCompleted ? (
        <div className="liquid-glass rounded-3xl p-8 border border-teal-500/30 text-center animate-in zoom-in-95 duration-200 space-y-5">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center mx-auto text-teal-300">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
              Drill Completed
            </span>
            <h2 className="text-3xl font-bold text-white mt-1">
              {scorePercent}% Mastery Achieved
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              You answered {correctCount} out of {totalQuestions} questions correctly for <span className="font-semibold text-teal-200">{quiz.topic}</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/10 max-w-md mx-auto text-xs text-slate-300">
            {scorePercent >= 80 ? (
              <span className="text-teal-300 font-medium">
                🌟 Outstanding conceptual grip! Your neural pathways on this concept are strongly encoded.
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                📖 Good effort! Review the detailed explanations for missed questions and try another retrieval drill.
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRestartQuiz}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Drill</span>
            </button>
            <button
              onClick={() => handleGenerateQuiz()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>New AI Drill</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        currentQ && (
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]">
            {/* Progress Bar & Header */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
              <span className="font-semibold text-teal-300">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-slate-400 font-mono">
                {quiz.topic}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-1.5 mb-6">
              {quiz.questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                      : idx < currentIndex
                      ? 'bg-emerald-500/70'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed mb-6">
              {currentQ.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const isAnswered = selectedAnswers[currentQ.id] !== undefined;
                const isCorrect = optIdx === currentQ.correctIndex;

                let stateClasses = 'border-white/8 liquid-glass-subtle hover:bg-white/8 hover:border-white/15';

                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses = 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    stateClasses = 'border-rose-500/40 bg-rose-950/25 text-rose-200';
                  } else {
                    stateClasses = 'border-white/5 opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${stateClasses}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isAnswered && isCorrect
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : isAnswered && isSelected && !isCorrect
                          ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                          : 'border-white/20 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>

                    <span className="text-xs sm:text-sm text-slate-100 flex-1 leading-relaxed">
                      {option}
                    </span>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Key Concept Box */}
            {hasAnsweredCurrent && (
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-950/25 border border-teal-500/25 space-y-2 animate-in fade-in duration-200 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                  <Brain className="w-4 h-4 text-teal-400" />
                  <span>Cognitive Diagnostic Breakdown</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentQ.explanation}
                </p>
                {currentQ.keyConcept && (
                  <div className="pt-2 border-t border-teal-500/15 text-[11px] text-teal-200/90 font-medium">
                    💡 <span className="font-semibold text-teal-300">Memory Anchor: </span>
                    {currentQ.keyConcept}
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCurrent}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'View Results' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
