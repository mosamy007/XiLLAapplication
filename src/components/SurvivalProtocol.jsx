import React from 'react';
import { ShieldCheck, Crosshair, TrendingUp, Trophy } from 'lucide-react';

export default function SurvivalProtocol() {
  const steps = [
    {
      num: '01',
      title: 'ENTER',
      desc: 'Connect your X handle to breach the city perimeter and initialize your survivor profile.',
      icon: <Crosshair className="w-6 h-6 text-neon-cyan" />,
      color: 'border-neon-cyan text-neon-cyan',
    },
    {
      num: '02',
      title: 'COMPLETE',
      desc: 'Execute recon missions, broadcast emergency transmissions, and uncover classified intel.',
      icon: <ShieldCheck className="w-6 h-6 text-neon-pink" />,
      color: 'border-neon-pink text-neon-pink',
    },
    {
      num: '03',
      title: 'CLIMB',
      desc: 'Accumulate XP to ascend the survivor leaderboard into elite Alpha status.',
      icon: <TrendingUp className="w-6 h-6 text-neon-yellow" />,
      color: 'border-neon-yellow text-neon-yellow',
    },
    {
      num: '04',
      title: 'SURVIVE',
      desc: 'Submit your wallet address to lock in your guaranteed WL allocation before spots run out.',
      icon: <Trophy className="w-6 h-6 text-neon-green" />,
      color: 'border-neon-green text-neon-green',
    },
  ];

  return (
    <section id="protocol" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t-2 border-neon-cyan/20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-pixel text-xl sm:text-2xl text-neon-cyan glow-text-cyan uppercase mb-3">
          SURVIVAL PROTOCOL
        </h2>
        <p className="font-pixel text-[11px] text-neon-pink uppercase mb-2">
          XiLLA HAS AWAKENED. THE CITY IS CHANGING.
        </p>
        <p className="font-tech text-xs sm:text-sm text-gray-400">
          Complete missions, earn XP, rise through the survivor rankings, and prove you belong among the chosen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`pixel-panel p-5 flex flex-col justify-between border-2 ${step.color} hover:-translate-y-1 transition-transform`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-pixel text-2xl font-bold">{step.num}</span>
                <div className="p-2 bg-cyber-black border border-current">{step.icon}</div>
              </div>
              <h3 className="font-pixel text-sm font-bold text-white mb-2">{step.title}</h3>
              <p className="font-tech text-xs text-gray-300 leading-relaxed">{step.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[10px] font-pixel text-gray-400">
              <span>PHASE {step.num}</span>
              <span className="text-neon-green">ACTIVE</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
