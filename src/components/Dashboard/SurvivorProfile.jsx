import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { Award, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function SurvivorProfile() {
  const { handle, xp, wallet, setIsIdentityModalOpen, completedTaskIds } = useGame();
  const { playBlip } = useAudio();
  const [realRank, setRealRank] = useState('--');

  // Fetch real rank from API
  useEffect(() => {
    if (!handle) {
      setRealRank('--');
      return;
    }
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find(
          (s) => s.handle.toLowerCase() === handle.toLowerCase()
        );
        if (found) {
          setRealRank(`#${String(found.rank).padStart(2, '0')}`);
        } else {
          setRealRank(data.length === 0 ? '#01' : `#${String(data.length + 1).padStart(2, '0')}`);
        }
      })
      .catch(() => setRealRank('#01'));
  }, [handle, xp, completedTaskIds]);

  // Real status and progression thresholds
  const currentXp = handle ? xp : 0;
  const statusTitle = currentXp >= 1500 ? 'ALPHA' : currentXp >= 500 ? 'KAIJU HUNTER' : currentXp >= 100 ? 'HUNTER' : 'RECRUIT';
  const targetXp = currentXp >= 1500 ? 2500 : currentXp >= 500 ? 1500 : 500;
  const xpNeeded = Math.max(0, targetXp - currentXp);
  const progressPercent = Math.min(100, Math.max(5, (currentXp / targetXp) * 100));

  return (
    <div className="flex flex-col mt-4 pt-3 border-t-2 border-neon-cyan/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-pixel text-xs text-neon-cyan tracking-wider">
            YOUR SURVIVOR
          </h3>
        </div>
        {handle ? (
          <div className="flex items-center gap-2">
            <span className="font-tech text-xs text-neon-cyan font-bold">
              {handle}
            </span>
            <button
              onClick={() => { playBlip(); setIsIdentityModalOpen(true); }}
              className="text-[8px] font-pixel text-neon-pink hover:text-white underline cursor-pointer transition-colors"
              title="Switch to another X handle"
            >
              [SWITCH]
            </button>
          </div>
        ) : (
          <button
            onClick={() => { playBlip(); setIsIdentityModalOpen(true); }}
            className="text-[9px] font-pixel text-neon-pink hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>CONNECT @HANDLE</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Profile Box */}
      <div className="p-3 bg-cyber-black border-2 border-neon-cyan/60 flex items-center gap-3">
        {/* Pixel Avatar */}
        <div className="w-14 h-14 shrink-0 border-2 border-neon-cyan bg-cyber-dark p-0.5 overflow-hidden">
          <img
            src="/assets/characters/kaiju-king.png"
            alt="My Survivor"
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Info & Real Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[11px] text-gray-400">
              {handle ? realRank : 'UNRANKED'}
            </span>
            <span className="font-pixel text-xs text-neon-cyan font-bold">
              {currentXp.toLocaleString()} XP
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="font-pixel text-[9px] text-neon-yellow">
              {statusTitle}
            </span>
            <span className="font-tech text-[10px] text-gray-400">
              {handle
                ? xpNeeded > 0
                  ? `${xpNeeded} XP TO NEXT TIER`
                  : 'MAX TIER'
                : 'ENTER @HANDLE TO JOIN'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-cyber-dark border border-neon-cyan/50 mt-1.5 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-kaiju-purple to-neon-cyan transition-all duration-500"
              style={{ width: `${handle ? progressPercent : 0}%` }}
            />
          </div>

          {wallet ? (
            <p className="font-tech text-[10px] text-neon-green truncate mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-neon-green" />
              <span>WL: {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</span>
            </p>
          ) : handle ? (
            <p className="font-tech text-[10px] text-gray-500 truncate mt-1">
              Complete missions to secure your WL spot
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
