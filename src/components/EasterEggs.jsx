import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { Sparkles, Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

export default function EasterEggs() {
  const { setSurvivorHandle, handle, requireIdentity } = useGame();
  const { playVictory, playLaser } = useAudio();
  const [keyIndex, setKeyIndex] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetKey = KONAMI_CODE[keyIndex];
      if (e.code === targetKey) {
        const nextIndex = keyIndex + 1;
        if (nextIndex === KONAMI_CODE.length) {
          // Konami Code Complete!
          triggerSecretUnlock();
          setKeyIndex(0);
        } else {
          setKeyIndex(nextIndex);
        }
      } else {
        setKeyIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyIndex]);

  const triggerSecretUnlock = () => {
    playLaser();
    setTimeout(() => {
      playVictory();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFE600', '#00F3FF', '#FF007A'],
      });
      setShowSecretModal(true);
    }, 200);
  };

  if (!showSecretModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md pixel-panel border-4 border-neon-yellow bg-cyber-dark p-6 shadow-2xl text-center">
        <button
          onClick={() => setShowSecretModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 border-2 border-neon-yellow bg-neon-yellow/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-neon-yellow animate-bounce" />
        </div>

        <h3 className="font-pixel text-base text-neon-yellow glow-text-yellow mb-2">
          SECRET TRANSMISSION DECRYPTED
        </h3>

        <p className="font-pixel text-[11px] text-neon-cyan uppercase mb-3">
          KONAMI CODE PROTOCOL RECOGNIZED
        </p>

        <div className="p-3 bg-cyber-black border border-gray-800 text-xs font-tech text-gray-300 leading-relaxed mb-6">
          "The kaiju slumbered beneath the Mariana trench for 10,000 years. Those who possess the ancient arcade knowledge shall lead the vanguard."
        </div>

        <button
          onClick={() => setShowSecretModal(false)}
          className="w-full pixel-btn pixel-btn-yellow text-xs py-3"
        >
          ACCEPT CLASSIFIED REWARD
        </button>
      </div>
    </div>
  );
}
