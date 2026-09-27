import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Layers, 
  Calendar, 
  Zap, 
  Clock, 
  Volume2, 
  VolumeX,
  Compass
} from 'lucide-react';
import { AmbientSoundType } from '../types/student';

interface NavigationProps {
  activeTab: 'tutor' | 'deepdive' | 'schedule' | 'recall';
  onSelectTab: (tab: 'tutor' | 'deepdive' | 'schedule' | 'recall') => void;
  onOpenTimer: () => void;
  ambientSound: AmbientSoundType;
  onToggleSound: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenTimer,
  ambientSound,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 backdrop-blur-2xl bg-slate-950/60 border-b border-white/8 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo with liquid glow */}
        <div 
          onClick={() => onSelectTab('tutor')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[1px] shadow-[0_0_20px_rgba(20,184,166,0.35)] group-hover:shadow-[0_0_25px_rgba(20,184,166,0.55)] transition-all">
            <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
          </div>
          <div>
            <span className="font-display text-lg font-semibold tracking-tight text-white group-hover:text-teal-200 transition-colors">
              AuraLearn
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400 ml-2 font-light">
              Liquid AI Study Companion
            </span>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <nav className="flex items-center p-1 rounded-2xl bg-slate-900/60 border border-white/8 shadow-inner overflow-x-auto">
          <button
            onClick={() => onSelectTab('tutor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tutor'
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Socratic Tutor</span>
          </button>

          <button
            onClick={() => onSelectTab('deepdive')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deepdive'
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Deep Dive</span>
          </button>

          <button
            onClick={() => onSelectTab('schedule')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Plan</span>
          </button>

          <button
            onClick={() => onSelectTab('recall')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'recall'
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Active Recall</span>
          </button>
        </nav>

        {/* Ambient Sound & Quick Timer Tools */}
        <div className="flex items-center gap-2">
          {/* Ambient Soundscapes toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              ambientSound !== 'off'
                ? 'bg-teal-500/20 border-teal-400/40 text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                : 'bg-white/5 border-white/8 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
            title={ambientSound !== 'off' ? `Playing: ${ambientSound}` : 'Toggle Ambient Audio'}
          >
            {ambientSound !== 'off' ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
                <span className="hidden md:inline capitalize text-[11px]">{ambientSound}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Audio</span>
              </>
            )}
          </button>

          {/* Focus Timer Launch Button */}
          <button
            onClick={onOpenTimer}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/25 to-emerald-500/20 hover:from-teal-500/35 hover:to-emerald-500/30 border border-teal-400/35 text-teal-200 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Timer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
