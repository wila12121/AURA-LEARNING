import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Send,
  Eye,
  EyeOff,
  BookOpen,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { DeepDiveResult, AnswerEvaluation } from '../types/student';

interface DeepDiveWorkspaceProps {
  onOpenQuizForTopic: (topic: string) => void;
  onOpenTimerForTopic: (topic: string) => void;
}

const SAMPLE_QUESTIONS = [
  {
    topic: 'Physics & Relativity',
    question: 'Why is the speed of light constant in all inertial reference frames regardless of the observer motion?',
  },
  {
    topic: 'Machine Learning & Math',
    question: 'How does backpropagation actually compute gradients via the chain rule in a multi-layer neural network?',
  },
  {
    topic: 'Biochemistry',
    question: 'How does the sodium-potassium pump (Na+/K+-ATPase) maintain electrochemical gradients against concentration?',
  },
  {
    topic: 'Economics & Game Theory',
    question: 'What is the intuition behind Nash Equilibrium, and why is it not always the Pareto optimal outcome?',
  },
];

export const DeepDiveWorkspace: React.FC<DeepDiveWorkspaceProps> = ({
  onOpenQuizForTopic,
  onOpenTimerForTopic,
}) => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Physics & Mathematics');
  const [depth, setDepth] = useState('college');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DeepDiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Self-check scratchpad state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeconstruct = async (questionToAsk?: string) => {
    const q = (questionToAsk || question).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setEvaluation(null);
    setShowSolution(false);
    setStudentAnswer('');

    try {
      const res = await fetch('/api/explain-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          subject,
          depth,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Deep dive error:', err);
      setError(err.message || 'Failed to generate deep dive breakdown. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateStudentAnswer = async () => {
    if (!result || !studentAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: result.selfCheckChallenge.question,
          studentAnswer: studentAnswer.trim(),
          context: result.title,
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation service temporarily unavailable');
      }

      const evalData = await res.json();
      setEvaluation(evalData);
      setShowSolution(true);
    } catch (err: any) {
      console.error('Evaluation error:', err);
      // Reveal solution directly if evaluation fails
      setShowSolution(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const copyNotes = () => {
    if (!result) return;
    const text = `# ${result.title}
\n## Core Mental Model\n${result.coreIntuition}
\n## Step-by-Step Mechanisms\n${result.formalSteps.map((s) => `${s.stepNumber}. ${s.title}: ${s.explanation} ${s.formulaOrKeyConcept ? `(${s.formulaOrKeyConcept})` : ''}`).join('\n')}
\n## Real-World Analogy\n${result.realWorldAnalogy}
\n## Common Pitfalls\n${result.commonPitfalls.map((p) => `- ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-16">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300 mb-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Complex Question Deconstruction</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">
          Unravel Intricate Conceptual Problems
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Break dense formulas, multi-stage mechanisms, and abstract paradoxes into intuitive mental models, derivations, and analogies.
        </p>
      </div>

      {/* Input Glass Card */}
      <div className="liquid-glass rounded-3xl p-5 sm:p-6 mb-8 border border-white/12 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)]">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          What complex question or problem would you like broken down?
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Why does dividing by zero break calculus? Explain the intuition of limits vs indeterminacy..."
          rows={3}
          className="liquid-glass-input w-full p-4 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/8 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Domain:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="liquid-glass-input py-1 px-2.5 rounded-lg border border-white/10 bg-slate-900/80 text-slate-200 cursor-pointer"
              >
                <option value="Physics & Mathematics">Physics & Mathematics</option>
                <option value="Biochemistry & Medicine">Biochemistry & Medicine</option>
                <option value="Computer Science & AI">Computer Science & AI</option>
                <option value="Economics & Philosophy">Economics & Philosophy</option>
                <option value="Engineering & Chemistry">Engineering & Chemistry</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Depth:</span>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="liquid-glass-input py-1 px-2.5 rounded-lg border border-white/10 bg-slate-900/80 text-slate-200 cursor-pointer"
              >
                <option value="highschool">Introductory</option>
                <option value="college">University Core</option>
                <option value="graduate">Advanced / Research</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleDeconstruct()}
            disabled={!question.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer ml-auto"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Deconstructing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Deconstruct Concept</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Inspiration Cards */}
      {!result && !isLoading && (
        <div className="mb-10">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Or try one of these classic conceptual challenges:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_QUESTIONS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(sample.question);
                  handleDeconstruct(sample.question);
                }}
                className="text-left p-4 rounded-2xl liquid-glass-subtle hover:bg-white/8 border border-white/8 hover:border-teal-400/30 transition-all group cursor-pointer"
              >
                <span className="text-[11px] font-medium text-teal-400/80 block mb-1">
                  {sample.topic}
                </span>
                <p className="text-xs text-slate-200 font-medium group-hover:text-teal-200 transition-colors line-clamp-2">
                  {sample.question}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="liquid-glass rounded-3xl p-8 border border-white/10 text-center animate-pulse space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-500/20 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-teal-300 animate-spin" style={{ animationDuration: '2.5s' }} />
          </div>
          <h3 className="text-lg font-semibold text-white">Synthesizing Pedagogical Breakdown...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Isolating the core mental model, structuring sequential mechanics, discovering tangible analogies, and formulating common exam traps.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Workspace */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Top Title & Action Bar */}
          <div className="liquid-glass rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-lg">
            <div>
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block">
                Deep Dive Breakdown
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {result.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyNotes}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Export Notes'}</span>
              </button>
              <button
                onClick={() => onOpenQuizForTopic(result.title)}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quiz Me</span>
              </button>
            </div>
          </div>

          {/* Section 1: The Core Mental Model */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-teal-500/25 bg-gradient-to-br from-teal-950/20 to-slate-900/40 shadow-xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold tracking-wide uppercase mb-2">
              <Lightbulb className="w-4 h-4 text-teal-400" />
              <span>01. The Core Mental Model (Intuition First)</span>
            </div>
            <p className="text-base text-slate-100 leading-relaxed font-normal">
              {result.coreIntuition}
            </p>
          </div>

          {/* Section 2: Step-by-Step Formal Mechanics */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold tracking-wide uppercase mb-4">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>02. Sequential Mechanics & Derivation</span>
            </div>

            <div className="space-y-4">
              {result.formalSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl liquid-glass-subtle border border-white/8 transition-all hover:border-white/15"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-100 tracking-tight mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.explanation}
                      </p>
                      {step.formulaOrKeyConcept && (
                        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 font-mono text-xs text-indigo-200">
                          {step.formulaOrKeyConcept}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Real-World Analogy */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold tracking-wide uppercase mb-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>03. The Tangible Real-World Analogy</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              "{result.realWorldAnalogy}"
            </p>
          </div>

          {/* Section 4: High-Yield Traps */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-amber-500/20 bg-amber-950/10 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>04. Common Exam Pitfalls & Misconceptions</span>
            </div>
            <ul className="space-y-2">
              {result.commonPitfalls.map((pitfall, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{pitfall}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5: Interactive Self-Check Challenge */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/12 shadow-xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold tracking-wide uppercase mb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>05. Self-Check Challenge</span>
            </div>
            <p className="text-sm font-medium text-slate-100 mb-3">
              {result.selfCheckChallenge.question}
            </p>

            {result.selfCheckChallenge.hint && (
              <p className="text-xs text-slate-400 italic mb-4">
                Hint: {result.selfCheckChallenge.hint}
              </p>
            )}

            {/* Student scratchpad */}
            <div className="space-y-2 mb-4">
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Type your explanation or deduction here to evaluate your understanding..."
                rows={2}
                className="liquid-glass-input w-full p-3 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleEvaluateStudentAnswer}
                  disabled={!studentAnswer.trim() || isEvaluating}
                  className="px-4 py-1.5 rounded-lg bg-teal-500/25 hover:bg-teal-500/35 border border-teal-400/30 text-teal-200 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Evaluate My Answer with AI</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSolution ? 'Hide Solution' : 'Reveal Model Solution'}</span>
                </button>
              </div>
            </div>

            {/* AI Evaluation Result */}
            {evaluation && (
              <div className="my-4 p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-300">AI Pedagogical Assessment</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 font-mono font-bold">
                    {evaluation.scorePercent}% Comprehension
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {evaluation.verdict}
                </p>
                {evaluation.strengths.length > 0 && (
                  <div className="text-[11px] text-teal-200/90">
                    <span className="font-semibold text-teal-300">What you nailed: </span>
                    {evaluation.strengths.join('; ')}
                  </div>
                )}
                {evaluation.misconceptionsOrGaps.length > 0 && (
                  <div className="text-[11px] text-amber-200/90">
                    <span className="font-semibold text-amber-300">Gaps/Nuance to refine: </span>
                    {evaluation.misconceptionsOrGaps.join('; ')}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  {evaluation.encouragement}
                </p>
              </div>
            )}

            {/* Model Solution Reveal */}
            {showSolution && (
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-teal-500/20 text-xs text-slate-200 space-y-1 animate-in fade-in duration-200">
                <span className="font-semibold text-teal-300 block mb-1">Model Solution & Rigorous Reasoning:</span>
                <p className="leading-relaxed">{result.selfCheckChallenge.solution}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
