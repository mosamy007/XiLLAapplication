import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { Trophy, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

export default function Leaderboard() {
  const { setIsLeaderboardModalOpen, handle, xp, completedTaskIds } = useGame();
  const { playBlip } = useAudio();
  const [topSurvivors, setTopSurvivors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = () => {
    fetch(`/api/leaderboard?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTotalCount(data.length);
          setTopSurvivors(data.slice(0, 10));
        }
        setLoading(false);
      })
      .catch(() => {
        setTopSurvivors([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
    // Live polling every 4 seconds so rankings update immediately
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, [xp, completedTaskIds]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-neon-yellow" />
          <h2 className="font-pixel text-xs sm:text-sm text-neon-yellow tracking-wider">
            SURVIVOR RANKINGS
          </h2>
          <span className="flex items-center gap-1 font-pixel text-[8px] text-neon-green px-1.5 py-0.5 bg-neon-green/10 border border-neon-green/30">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            LIVE
          </span>
        </div>
        <button
          onClick={() => { playBlip(500); setIsLeaderboardModalOpen(true); }}
          className="font-pixel text-[9px] text-gray-400 hover:text-neon-cyan flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>VIEW ALL {totalCount > 10 ? `(${totalCount})` : ''}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Table - STRICTLY REAL DATA, ZERO MOCKS */}
      <div className="w-full overflow-hidden border border-gray-800 bg-cyber-black/80 min-h-[160px] max-h-[340px] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-xs font-tech text-gray-500 animate-pulse">
            LOADING REAL LEADERBOARD...
          </div>
        ) : topSurvivors.length === 0 ? (
          <div className="p-6 text-center text-xs font-tech flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-6 h-6 text-neon-yellow/70 animate-pulse" />
            <p className="font-pixel text-[10px] text-neon-cyan">NO SURVIVORS REGISTERED YET</p>
            <p className="text-gray-400 text-[11px] max-w-xs">
              Complete Task 01 on the left to claim the #01 spot on the leaderboard!
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-cyber-dark text-gray-400 font-pixel text-[8px] uppercase border-b border-gray-800">
              <tr>
                <th className="py-1.5 px-2">#</th>
                <th className="py-1.5 px-2">SURVIVOR</th>
                <th className="py-1.5 px-2 text-right">XP</th>
                <th className="py-1.5 px-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-tech">
              {topSurvivors.map((survivor) => {
                const isCurrent = handle && survivor.handle.toLowerCase() === handle.toLowerCase();
                return (
                  <tr
                    key={survivor.rank}
                    className={`transition-colors ${
                      isCurrent ? 'bg-neon-cyan/15 font-bold' : 'hover:bg-cyber-navy/40'
                    }`}
                  >
                    <td className="py-1.5 px-2 font-pixel text-[9px] text-gray-400">
                      {String(survivor.rank).padStart(2, '0')}
                    </td>
                    <td className="py-1.5 px-2 flex items-center gap-2">
                      <img
                        src="/assets/characters/kaiju-king.png"
                        alt="avatar"
                        className="w-5 h-5 border border-gray-700 shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="font-bold text-white text-[11px] truncate max-w-[90px] sm:max-w-[120px]">
                        {survivor.handle}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right text-neon-yellow font-bold text-[11px]">
                      {survivor.xp.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-2 text-right font-pixel text-[8px]">
                      <span
                        className="px-1.5 py-0.5 border"
                        style={{
                          borderColor: survivor.statusColor || '#00F3FF',
                          color: survivor.statusColor || '#00F3FF',
                        }}
                      >
                        {survivor.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
