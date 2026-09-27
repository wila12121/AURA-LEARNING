import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  Zap, 
  BookOpen, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  ArrowRight,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ChatMessage, TutoringMode, DepthLevel } from '../types/student';
import { FormattedContent } from './FormattedContent';

interface TutorWorkspaceProps {
  activeSubject: string;
  onSelectSubject: (sub: string) => void;
  onOpenTimerForTopic: (topic: string) => void;
  onOpenQuizForTopic: (topic: string) => void;
}

const PRESET_SUBJECTS = [
  'General Science & Math',
  'Organic Chemistry',
  'Calculus & Linear Algebra',
  'Neurobiology',
  'Computer Science & Algorithms',
  'Micro & Macro Economics',
  'World History & Philosophy'
];

const INITIAL_STARTERS = [
  {
    title: 'Socratic Derivation',
    prompt: 'Can you guide me through understanding why the derivative of sin(x) is cos(x) without just giving the formula away?',
    mode: 'socratic' as TutoringMode,
  },
  {
    title: 'Intuitive Mental Model',
    prompt: 'Explain how the Transformer self-attention mechanism works using a simple real-world analogy.',
    mode: 'explainer' as TutoringMode,
  },
  {
    title: 'Mechanism Breakdown',
    prompt: 'Walk me through the ATP synthase rotary motor in cellular respiration step by step.',
    mode: 'explainer' as TutoringMode,
  },
  {
    title: 'Concept Drill',
    prompt: 'Drill me on identifying asymptotic runtimes (Big-O) for divide-and-conquer algorithms.',
    mode: 'drill' as TutoringMode,
  },
];

export const TutorWorkspace: React.FC<TutorWorkspaceProps> = ({
  activeSubject,
  onSelectSubject,
  onOpenTimerForTopic,
  onOpenQuizForTopic,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `### Welcome to your Personal Liquid AI Tutor ✨

I adapt to your personal pace and thinking style. Whether you want me to **guide you step-by-step (Socratic)** so you discover the answer yourself, provide **crystal-clear analogies**, or **drill you on exam questions**, I am here to help you truly master the material.

> 💡 **Tip:** Select your preferred mode above and ask any question, or click one of the suggested exploratory starters below.`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Guide me through understanding Bayes Theorem intuitively',
          'Why does entropy always increase in a closed system?',
          'How does the immune system remember past infections?',
        ],
      },
    ];
  });

  const [input, setInput] = useState('');
  const [tutoringMode, setTutoringMode] = useState<TutoringMode>('socratic');
  const [depthLevel, setDepthLevel] = useState<DepthLevel>('academic');
  const [isStreaming, setIsStreaming] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle Speech Synthesis
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(msgId);

    // Clean markdown before speaking
    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/[*_`]/g, '')
      .replace(/>\s+/g, '')
      .replace(/🔮 Suggested Next Steps:[\s\S]*/, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
      subject: activeSubject,
      tutoringMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsStreaming(true);

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      subject: activeSubject,
      tutoringMode,
    };

    setMessages((prev) => [...prev, initialBotMessage]);

    try {
      // Prepare history for stream
      const historyPayload = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          subject: activeSubject,
          tutoringMode,
          depthLevel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === botMessageId
                          ? { ...msg, content: accumulated }
                          : msg
                      )
                    );
                  } else if (parsed.error) {
                    accumulated += `\n\n*Error: ${parsed.error}*`;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === botMessageId
                          ? { ...msg, content: accumulated }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  // partial chunk
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Tutoring request error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `Sorry, I encountered a temporary connection issue. Please verify your GEMINI_API_KEY is active in the Secrets panel, or try again in a moment.`,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Ready for a new session in **${activeSubject}**. What concept, problem set, or question should we explore together?`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full">
      {/* Configuration Glass Strip */}
      <div className="liquid-glass rounded-2xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 shadow-lg">
        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <select
            value={activeSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="liquid-glass-input text-xs font-medium text-slate-200 py-1.5 px-3 rounded-lg border border-white/10 bg-slate-900/80 cursor-pointer focus:ring-1 focus:ring-teal-400"
          >
            {PRESET_SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-slate-200">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Tutoring Mode Segmented Control */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-900/60 border border-white/8">
          <button
            onClick={() => setTutoringMode('socratic')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              tutoringMode === 'socratic'
                ? 'bg-teal-500/25 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Socratic Guide: Asks leading questions to help you deduce answers yourself"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Socratic Guide</span>
          </button>
          <button
            onClick={() => setTutoringMode('explainer')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              tutoringMode === 'explainer'
                ? 'bg-teal-500/25 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Direct Explainer: Comprehensive analogies, structured breakdowns, and clear derivations"
          >
            <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
            <span>Direct Explainer</span>
          </button>
          <button
            onClick={() => setTutoringMode('drill')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              tutoringMode === 'drill'
                ? 'bg-teal-500/25 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Exam Drill: Active recall testing and common trap diagnosis"
          >
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Exam Drill</span>
          </button>
        </div>

        {/* Depth Level and Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={depthLevel}
            onChange={(e) => setDepthLevel(e.target.value as DepthLevel)}
            className="liquid-glass-input text-xs text-slate-300 py-1.5 px-2.5 rounded-lg border border-white/10 bg-slate-900/80 cursor-pointer"
            title="Learning Depth"
          >
            <option value="intuitive">Intuitive / Visual</option>
            <option value="academic">Academic Core</option>
            <option value="rigorous">Rigorous / Advanced</option>
          </select>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-white/5 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isSpeaking = speakingId === message.id;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 ${
                  isUser
                    ? 'bg-gradient-to-br from-teal-500/20 to-emerald-500/15 border border-teal-400/30 text-slate-100 shadow-[0_8px_25px_-5px_rgba(20,184,166,0.2)]'
                    : 'liquid-glass border border-white/10 text-slate-200 shadow-lg'
                }`}
              >
                {/* Meta header for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/8 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      <span className="font-medium text-teal-300">AuraLearn AI</span>
                      <span className="text-slate-600">·</span>
                      <span className="capitalize">{message.tutoringMode || tutoringMode}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleSpeak(message.id, message.content)}
                        className={`p-1 rounded-md text-xs transition-colors ${
                          isSpeaking ? 'text-teal-300 bg-teal-500/20' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title={isSpeaking ? 'Stop speaking' : 'Read explanation aloud'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content body */}
                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <FormattedContent
                    content={message.content}
                    onSuggestionClick={(s) => handleSendMessage(s)}
                  />
                )}

                {/* Assistant quick action buttons */}
                {!isUser && message.content.length > 80 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/8 text-[11px] text-slate-400">
                    <button
                      onClick={() => handleSendMessage(`Can you explain this again using a simple real-world analogy?`)}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors cursor-pointer"
                    >
                      Give Me An Analogy
                    </button>
                    <button
                      onClick={() => onOpenQuizForTopic(activeSubject)}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 transition-colors cursor-pointer"
                    >
                      Test My Understanding
                    </button>
                    <button
                      onClick={() => onOpenTimerForTopic(activeSubject)}
                      className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors cursor-pointer"
                    >
                      Start 25m Focus Block
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming Thinking Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl liquid-glass border border-white/10 max-w-xs text-xs text-teal-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Formulating personalized pedagogical response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts (if chat is fresh) */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {INITIAL_STARTERS.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTutoringMode(starter.mode);
                handleSendMessage(starter.prompt);
              }}
              className="text-left p-3 rounded-xl liquid-glass-subtle hover:bg-white/8 border border-white/8 hover:border-teal-400/30 text-xs transition-all group cursor-pointer"
            >
              <div className="font-semibold text-teal-300 flex items-center justify-between mb-1">
                <span>{starter.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors">
                {starter.prompt}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Input Glass Bar */}
      <div className="relative liquid-glass rounded-2xl p-2 border border-white/12 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)]">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask a question or describe a problem in ${activeSubject}... (Shift+Enter for new line)`}
          rows={2}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans"
        />

        <div className="flex items-center justify-between px-2 pt-1 border-t border-white/6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Mode:</span>
            <span className="text-teal-400 capitalize font-medium">{tutoringMode}</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{depthLevel}</span>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ask Tutor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
