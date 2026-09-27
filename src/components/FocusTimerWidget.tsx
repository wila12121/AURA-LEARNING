import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, X, CloudRain, Waves, Radio, Compass } from 'lucide-react';
import { soundSynthesizer } from '../utils/audioSynthesizer';
import { AmbientSoundType } from '../types/student';

interface FocusTimerWidgetProps {
  currentTopic?: string;
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (topic: string, minutes: number) => void;
}

export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = ({
  currentTopic = 'Focused Study Session',
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [timerMode, setTimerMode] = useState<'focus25' | 'focus50' | 'break5' | 'break10'>('focus25');
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');
  const [volume, setVolume] = useState(0.25);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Set duration when mode changes
  useEffect(() => {
    let secs = 25 * 60;
    if (timerMode === 'focus25') secs = 25 * 60;
    else if (timerMode === 'focus50') secs = 50 * 60;
    else if (timerMode === 'break5') secs = 5 * 60;
    else if (timerMode === 'break10') secs = 10 * 60;

    setDuration(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  }, [timerMode]);

  // Tick timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      soundSynthesizer.playCompletionChime();
      if (timerMode.startsWith('focus')) {
        setCompletedSessions((c) => c + 1);
        if (onSessionComplete) {
          onSessionComplete(currentTopic, Math.round(duration / 60));
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode, duration, currentTopic, onSessionComplete]);

  // Ambient sound handler
  const handleSoundChange = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    soundSynthesizer.playSound(sound);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundSynthesizer.setVolume(newVol);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((duration - timeLeft) / duration) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl liquid-glass border border-white/12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close timer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300 mb-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Liquid Focus Sanctuary</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white line-clamp-1">
            {currentTopic}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immerse in deep flow with soothing synthesized soundscapes
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/8 mb-8 max-w-xs mx-auto">
          <button
            onClick={() => setTimerMode('focus25')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timerMode === 'focus25'
                ? 'bg-teal-500/25 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimerMode('focus50')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timerMode === 'focus50'
                ? 'bg-teal-500/25 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            50m Flow
          </button>
          <button
            onClick={() => setTimerMode('break5')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timerMode === 'break5'
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5m Rest
          </button>
          <button
            onClick={() => setTimerMode('break10')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timerMode === 'break10'
                ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10m Long Rest
          </button>
        </div>

        {/* Circular Liquid Glow Timer Display */}
        <div className="relative flex items-center justify-center my-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background SVG Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800/80"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-teal-400 transition-all duration-700 ease-out"
                strokeWidth="4"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.4))',
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-light font-mono tabular-nums tracking-tight text-white drop-shadow-sm">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs uppercase tracking-widest text-teal-300/80 mt-2 font-medium">
                {timerMode.startsWith('focus') ? 'Deep Study' : 'Regenerate'}
              </span>
              {completedSessions > 0 && (
                <span className="text-[11px] text-slate-400 mt-1">
                  {completedSessions} {completedSessions === 1 ? 'session' : 'sessions'} completed today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 my-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold shadow-[0_8px_25px_-5px_rgba(20,184,166,0.5)] transition-all flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" /> Pause Flow
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950 ml-0.5" /> Start Focus
              </>
            )}
          </button>
        </div>

        {/* Ambient Soundscapes bar */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              Ambient Frequency
            </span>
            <div className="flex items-center gap-2">
              {ambientSound !== 'off' ? (
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-teal-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                title="Volume"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'off', label: 'Mute', icon: VolumeX },
              { id: 'rain', label: 'Rain', icon: CloudRain },
              { id: 'ocean', label: 'Ocean', icon: Waves },
              { id: 'whitenoise', label: 'Noise', icon: Radio },
              { id: 'binaural', label: '6Hz Theta', icon: Sparkles },
            ].map((sound) => {
              const Icon = sound.icon;
              const isActive = ambientSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSoundChange(sound.id as AmbientSoundType)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500/20 border-teal-400/40 text-teal-200'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  {sound.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
