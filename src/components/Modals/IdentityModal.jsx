import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { ShieldAlert, X, Terminal, ArrowRight } from 'lucide-react';

export default function IdentityModal() {
  const { isIdentityModalOpen, setIsIdentityModalOpen, setSurvivorHandle, identityPromptReason, handle } = useGame();
  const { playBlip } = useAudio();
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isIdentityModalOpen) {
      setInputVal(handle ? handle.replace(/^@/, '') : '');
      setError('');
    }
  }, [isIdentityModalOpen, handle]);

  if (!isIdentityModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputVal.trim().replace(/^@/, '');
    if (!clean) {
      setError('Operative handle cannot be empty.');
      return;
    }
    if (clean.length < 2) {
      setError('Handle must be at least 2 characters.');
      return;
    }
    setError('');
    setSurvivorHandle(clean);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md pixel-panel border-4 border-neon-cyan bg-cyber-dark p-6 shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neon-cyan/40">
          <div className="flex items-center gap-2 text-neon-cyan font-pixel text-xs">
            <Terminal className="w-4 h-4 text-neon-cyan animate-pulse" />
            <span>OPERATIVE IDENTIFICATION</span>
          </div>
          {handle && (
            <button
              onClick={() => { playBlip(); setIsIdentityModalOpen(false); }}
              className="text-gray-400 hover:text-neon-pink p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Warning Alert Banner */}
        <div className="flex items-start gap-3 p-3 mb-4 bg-neon-pink/10 border-2 border-neon-pink text-gray-200">
          <ShieldAlert className="w-5 h-5 text-neon-pink shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-pixel text-neon-pink text-[10px] mb-1">
              {handle ? 'SWITCH OR CONNECT OPERATIVE' : 'MANDATORY PROTOCOL'}
            </p>
            <p className="text-gray-300">
              {handle 
                ? 'Entering a different @handle creates or switches to that handle\'s isolated profile, XP, and verified missions.'
                : identityPromptReason === 'JOIN_WL'
                ? 'You must identify your X handle before joining the WL ranking.'
                : 'Enter your X handle (@) to unlock mission execution and track your XP.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[10px] text-neon-cyan uppercase mb-2">
              X Handle (Twitter):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neon-cyan font-tech text-lg font-bold">@</span>
              <input
                type="text"
                autoFocus
                placeholder="username"
                value={inputVal}
                onChange={(e) => { setInputVal(e.target.value); setError(''); }}
                className="w-full bg-cyber-black text-white font-tech text-base pl-8 pr-3 py-2.5 border-2 border-neon-cyan focus:outline-none focus:border-neon-pink focus:shadow-glow-pink"
              />
            </div>
            {error && <p className="text-danger-red text-xs mt-1 font-tech font-bold">{error}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full pixel-btn pixel-btn-pink flex items-center justify-center gap-2 py-3 text-xs"
            >
              <span>LOCK IN IDENTITY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          All missions and XP rewards will sync to this identity.
        </p>
      </div>
    </div>
  );
}
