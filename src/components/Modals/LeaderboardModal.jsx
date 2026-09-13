import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { Trophy, X, Search, ShieldAlert } from 'lucide-react';

export default function LeaderboardModal() {
  const { isLeaderboardModalOpen, setIsLeaderboardModalOpen, handle, xp } = useGame();
  const { playBlip } = useAudio();
  const [board, setBoard] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLeaderboardModalOpen) {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          setBoard(data);
          setLoading(false);
        })
        .catch(() => {
          setBoard([]);
          setLoading(false);
        });
    }
  }, [isLeaderboardModalOpen]);

  if (!isLeaderboardModalOpen) return null;

  const filtered = board.filter(item => 
    item.handle.toLowerCase().includes(search.toLowerCase())
  );

  const userRankIndex = handle ? board.findIndex(s => s.handle.toLowerCase() === handle.toLowerCase()) : -1;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl pixel-panel border-4 border-neon-yellow bg-cyber-dark p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neon-yellow/40">
          <div className="flex items-center gap-2 text-neon-yellow font-pixel text-xs">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            <span>GLOBAL SURVIVOR LEADERBOARD (REAL-TIME)</span>
          </div>
          <button
            onClick={() => { playBlip(); setIsLeaderboardModalOpen(false); }}
            className="text-gray-400 hover:text-danger-red p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {board.length > 0 && (
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search survivor handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-cyber-black text-white pl-9 pr-3 py-2 border-2 border-gray-700 focus:border-neon-yellow focus:outline-none text-xs font-tech"
            />
          </div>
        )}

        {/* User Stats Highlight */}
        {handle && (
          <div className="p-3 mb-3 bg-neon-cyan/10 border-2 border-neon-cyan flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-neon-cyan">YOUR RANKING:</span>
              <span className="font-tech text-white font-bold">{handle}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-tech text-neon-yellow font-bold">{xp.toLocaleString()} XP</span>
              <span className="font-pixel text-[9px] text-neon-cyan bg-cyber-black px-2 py-0.5 border border-neon-cyan">
                {userRankIndex >= 0 ? `#${String(userRankIndex + 1).padStart(2, '0')}` : '#01'}
              </span>
            </div>
          </div>
        )}

        {/* Table / Empty State */}
        <div className="flex-1 overflow-y-auto border-2 border-gray-800 bg-cyber-black min-h-[160px] flex flex-col justify-center">
          {loading ? (
            <div className="p-8 text-center text-xs font-tech text-gray-500 animate-pulse">
              LOADING LIVE LEADERBOARD...
            </div>
          ) : board.length === 0 ? (
            <div className="p-8 text-center text-xs font-tech flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-8 h-8 text-neon-yellow animate-pulse" />
              <p className="font-pixel text-xs text-neon-cyan">NO REGISTERED SURVIVORS YET</p>
              <p className="text-gray-400 text-xs max-w-sm">
                Complete missions on the dashboard to register your handle and be the first survivor on the board!
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-cyber-navy border-b border-gray-800 text-gray-400 font-pixel text-[9px] uppercase sticky top-0">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">SURVIVOR</th>
                  <th className="p-2.5 text-right">XP</th>
                  <th className="p-2.5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 font-tech">
                {filtered.map((survivor) => {
                  const isCurrent = handle && survivor.handle.toLowerCase() === handle.toLowerCase();
                  return (
                    <tr
                      key={survivor.rank}
                      className={`hover:bg-cyber-navy/50 transition-colors ${
                        isCurrent ? 'bg-neon-cyan/15 font-bold' : ''
                      }`}
                    >
                      <td className="p-2.5 font-pixel text-[10px] text-gray-400">
                        {String(survivor.rank).padStart(2, '0')}
                      </td>
                      <td className="p-2.5 flex items-center gap-2">
                        <img
                          src="/assets/characters/kaiju-king.png"
                          alt="avatar"
                          className="w-6 h-6 border border-gray-700 shrink-0"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <span className="text-white font-bold">{survivor.handle}</span>
                      </td>
                      <td className="p-2.5 text-right text-neon-yellow font-bold">
                        {survivor.xp.toLocaleString()} XP
                      </td>
                      <td className="p-2.5 text-right font-pixel text-[9px]">
                        <span
                          className="px-2 py-0.5 border"
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

        <div className="pt-4 mt-auto">
          <button
            onClick={() => { playBlip(); setIsLeaderboardModalOpen(false); }}
            className="w-full pixel-btn pixel-btn-yellow text-xs py-2.5"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    </div>
  );
}
