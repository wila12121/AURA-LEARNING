/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LiquidBackground } from './components/LiquidBackground';
import { Navigation } from './components/Navigation';
import { TutorWorkspace } from './components/TutorWorkspace';
import { DeepDiveWorkspace } from './components/DeepDiveWorkspace';
import { ScheduleWorkspace } from './components/ScheduleWorkspace';
import { ActiveRecallWorkspace } from './components/ActiveRecallWorkspace';
import { FocusTimerWidget } from './components/FocusTimerWidget';
import { AmbientSoundType } from './types/student';
import { soundSynthesizer } from './utils/audioSynthesizer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tutor' | 'deepdive' | 'schedule' | 'recall'>('tutor');
  const [activeSubject, setActiveSubject] = useState<string>('Calculus & Linear Algebra');
  const [activeQuizTopic, setActiveQuizTopic] = useState<string>('Calculus & Stokes Theorem');

  // Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerTopic, setTimerTopic] = useState('Personalized Deep Work Session');

  // Ambient sound state
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');

  const handleToggleSound = () => {
    if (ambientSound === 'off') {
      soundSynthesizer.playSound('rain');
      setAmbientSound('rain');
    } else {
      soundSynthesizer.stop();
      setAmbientSound('off');
    }
  };

  const handleOpenTimerForTopic = (topic: string, _durationMinutes?: number) => {
    setTimerTopic(topic);
    setIsTimerOpen(true);
  };

  const handleOpenQuizForTopic = (topic: string) => {
    setActiveQuizTopic(topic);
    setActiveTab('recall');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Liquid Caustics & Glowing Ambient Background */}
      <LiquidBackground />

      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTimer={() => setIsTimerOpen(true)}
        ambientSound={ambientSound}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace View */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        {activeTab === 'tutor' && (
          <TutorWorkspace
            activeSubject={activeSubject}
            onSelectSubject={setActiveSubject}
            onOpenTimerForTopic={handleOpenTimerForTopic}
            onOpenQuizForTopic={handleOpenQuizForTopic}
          />
        )}

        {activeTab === 'deepdive' && (
          <DeepDiveWorkspace
            onOpenQuizForTopic={handleOpenQuizForTopic}
            onOpenTimerForTopic={handleOpenTimerForTopic}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleWorkspace
            onStartSessionTimer={handleOpenTimerForTopic}
            onOpenQuizForTopic={handleOpenQuizForTopic}
          />
        )}

        {activeTab === 'recall' && (
          <ActiveRecallWorkspace
            initialTopic={activeQuizTopic}
          />
        )}
      </main>

      {/* Liquid Focus Timer Sanctuary Modal */}
      <FocusTimerWidget
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        currentTopic={timerTopic}
        onSessionComplete={(topic, minutes) => {
          console.log(`Completed session: ${topic} for ${minutes} minutes`);
        }}
      />
    </div>
  );
}
