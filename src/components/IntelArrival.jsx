import React from 'react';
import { useGame } from '../context/GameContext';
import { ExternalLink, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function IntelArrival() {
  const { projectConfig } = useGame();

  const defaultMilestones = [
    {
      id: 'stage_1',
      title: 'SIGNAL DETECTED',
      status: 'COMPLETE',
      desc: 'Deep subterranean pulse confirmed by city sensors. Emergency protocol activated.',
    },
    {
      id: 'stage_2',
      title: 'CITY AWAKENS',
      status: 'CURRENT PHASE',
      desc: 'XiLLA City opens for survivor recon. Missions initiated, WL leaderboard live.',
    },
    {
      id: 'stage_3',
      title: 'SURVIVORS ASSEMBLE',
      status: 'UPCOMING',
      desc: 'Final WL slots locked. Tactical wallet verification completed across all districts.',
    },
    {
      id: 'stage_4',
      title: 'XiLLA ARRIVES',
      status: 'FINAL PROTOCOL',
      desc: 'The official generation event. Survivors mint their pixel Kaiju operatives.',
    },
  ];

  // Dynamic stages from admin config (filter active)
  const rawStages = projectConfig?.stages && Array.isArray(projectConfig.stages)
    ? projectConfig.stages
    : defaultMilestones;
  
  const milestones = rawStages.filter((s) => s.active !== false);

  // Dynamic ecosystem links: only render platforms that have valid URLs
  const links = projectConfig?.links || {};
  const activeLinks = [];

  if (links.twitter && links.twitter.trim()) {
    activeLinks.push({
      id: 'twitter',
      label: 'X (TWITTER)',
      url: links.twitter.trim(),
      className: 'bg-cyber-black text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-cyber-black',
    });
  }
  if (links.opensea && links.opensea.trim()) {
    activeLinks.push({
      id: 'opensea',
      label: 'OPENSEA',
      url: links.opensea.trim(),
      className: 'bg-neon-cyan text-cyber-black border-neon-cyan hover:bg-white hover:border-white font-bold',
    });
  }
  if (links.discord && links.discord.trim()) {
    activeLinks.push({
      id: 'discord',
      label: 'DISCORD',
      url: links.discord.trim(),
      className: 'bg-neon-pink text-white border-neon-pink hover:bg-white hover:text-cyber-black font-bold',
    });
  }
  if (links.telegram && links.telegram.trim()) {
    activeLinks.push({
      id: 'telegram',
      label: 'TELEGRAM',
      url: links.telegram.trim(),
      className: 'bg-cyber-black text-neon-yellow border-neon-yellow hover:bg-neon-yellow hover:text-cyber-black',
    });
  }

  // Fallback if admin has not added any custom links
  if (activeLinks.length === 0) {
    activeLinks.push({
      id: 'default_x',
      label: 'VIEW OFFICIAL BROADCAST',
      url: projectConfig?.officialXUrl || 'https://x.com/XiLLANFTs',
      className: 'bg-neon-green text-cyber-black border-neon-green hover:bg-white hover:border-white font-bold',
    });
  }

  return (
    <section id="intel" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t-2 border-neon-cyan/20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-pixel text-xl sm:text-2xl text-neon-green glow-text-green uppercase mb-2">
          THE ARRIVAL
        </h2>
        <p className="font-tech text-xs sm:text-sm text-gray-400">
          Official progression timeline towards the global mint event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'COMPLETE';
          const isCurrent = m.status === 'CURRENT PHASE';
          const isFinal = m.status === 'FINAL PROTOCOL';

          return (
            <div
              key={m.id || idx}
              className={`p-4 border-2 bg-cyber-dark relative flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-neon-cyan shadow-pixel-cyan'
                  : isDone
                  ? 'border-neon-green/60'
                  : isFinal
                  ? 'border-neon-pink/70'
                  : 'border-gray-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] text-gray-400">
                    STAGE 0{m.stageNumber || idx + 1}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 font-pixel text-[9px] text-neon-green">
                      <CheckCircle className="w-3 h-3" />
                      DONE
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1 font-pixel text-[9px] text-neon-cyan animate-pulse">
                      <Clock className="w-3 h-3" />
                      ACTIVE
                    </span>
                  ) : isFinal ? (
                    <span className="flex items-center gap-1 font-pixel text-[9px] text-neon-pink">
                      <Sparkles className="w-3 h-3" />
                      MINT
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] text-gray-500">PENDING</span>
                  )}
                </div>

                <h3 className="font-pixel text-xs text-white mb-2">{m.title}</h3>
                <p className="font-tech text-xs text-gray-400 leading-relaxed">{m.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-800 text-[10px] font-tech text-gray-400">
                {m.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* External Ecosystem Channels Box */}
      <div className="pixel-panel p-6 border-neon-green/60 bg-cyber-dark/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-pixel text-sm text-neon-green mb-1">
            OFFICIAL ECOSYSTEM ANNOUNCEMENTS
          </h3>
          <p className="font-tech text-xs text-gray-300">
            For official deployment updates, ecosystem partnerships, and smart contract details, follow the official XiLLA transmission channels.
          </p>
        </div>

        {/* Dynamic Link Buttons - only non-empty links rendered */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {activeLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`pixel-btn text-xs px-4 py-2 border-2 flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 ${link.className}`}
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
