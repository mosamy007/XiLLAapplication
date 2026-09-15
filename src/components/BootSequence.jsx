import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { Radio } from 'lucide-react';

export default function BootSequence() {
  const { showBootSequence, skipBootSequence } = useGame();
  const { playBlip, playLaser, playVictory } = useAudio();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!showBootSequence) return;

    // Immediately mark as seen so page reloads during the sequence won't re-trigger it
    try {
      localStorage.setItem('xilla_boot_seen', 'true');
    } catch (e) {}

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        skipBootSequence();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Sequence timeline (Warning removed, streamlined Kaiju awakening sequence)
    const timers = [
      setTimeout(() => { setStep(1); playBlip(300); }, 500),
      setTimeout(() => { setStep(2); playBlip(450); }, 1300),
      setTimeout(() => { setStep(3); playLaser(); }, 2200),
      setTimeout(() => { setStep(4); playVictory(); }, 3200),
      setTimeout(() => { skipBootSequence(); }, 4400),
    ];

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      timers.forEach(clearTimeout);
    };
  }, [showBootSequence, skipBootSequence]);

  if (!showBootSequence) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-cyber-black flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background CRT Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none" />

      {/* Skip Button Top Right */}
      <button
        onClick={skipBootSequence}
        className="absolute top-6 right-6 font-pixel text-[10px] text-gray-400 hover:text-neon-cyan px-3 py-2 border border-gray-700 bg-cyber-dark/80 transition-colors z-20 cursor-pointer"
      >
        [ESC] SKIP BOOT SEQUENCE
      </button>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center">
        {step >= 1 && (
          <div className="flex items-center gap-2 text-neon-cyan font-tech text-xs tracking-widest uppercase mb-4 animate-pulse">
            <Radio className="w-4 h-4" />
            <span>XiLLA CITY EMERGENCY NETWORK // V.1.0</span>
          </div>
        )}

        {step >= 2 && (
          <div className="font-tech text-gray-300 text-sm tracking-wider space-y-1 mb-6">
            <p className="text-gray-400">SIGNAL SEARCHING...</p>
            <p className="text-neon-green font-bold">SIGNAL DETECTED [SECTOR 7]</p>
          </div>
        )}

        {step >= 3 && (
          <div className="space-y-3 transform transition-transform duration-500 scale-105">
            <h1 className="font-pixel text-4xl sm:text-6xl text-neon-cyan glow-text-cyan tracking-wider">
              XiLLA
            </h1>
            <h2 className="font-pixel text-xl sm:text-3xl text-neon-pink glow-text-pink tracking-widest">
              HAS AWAKENED
            </h2>
          </div>
        )}

        {step >= 4 && (
          <p className="font-tech text-xs sm:text-sm text-neon-yellow tracking-widest mt-8 animate-pulse">
            INITIALIZING SURVIVOR DEFENSE PROTOCOLS...
          </p>
        )}
      </div>
    </div>
  );
}
