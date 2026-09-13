import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { ChevronRight, Radio, Sparkles } from 'lucide-react';

export default function LoreSection() {
  const { playBlip } = useAudio();
  const [activeScene, setActiveScene] = useState(0);

  const scenes = [
    {
      title: 'ACT I: THE FIRST SIGNAL',
      tag: 'YEAR UNKNOWN // SECTOR 0',
      text: 'The first signal came from beneath the city. Ocean sensors at the southern trench detected a subterranean pulse that shattered seismic sensors across Tokyo bay.',
      alert: 'SEISMIC ANOMALY RECORDED',
    },
    {
      title: 'ACT II: THE RESONANCE',
      tag: 'TRANSMISSION 084 // DEEP SEA',
      text: 'The second signal was closer. Power grids across the downtown corridor began pulsing with neon resonance. Broadcast networks hijacked by an impossible frequency.',
      alert: 'EMERGENCY FREQUENCY DETECTED',
    },
    {
      title: 'ACT III: THE HEARTBEAT',
      tag: 'RED ZONE EPICENTER',
      text: 'We thought it was an earthquake warning. We were wrong. It was a heartbeat. The ancient guardian has opened its eyes in the neon abyss.',
      alert: 'ENTITY AWAKENED',
    },
    {
      title: 'ACT IV: XiLLA',
      tag: 'TOTAL CITY AWAKENING',
      text: 'XiLLA has awakened. The city belongs to those who adapt. Join the survivors. Prove your loyalty. Prepare for the arrival.',
      alert: 'SURVIVAL MANDATE IN EFFECT',
    },
  ];

  return (
    <section id="lore" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t-2 border-neon-cyan/20">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="font-pixel text-xl sm:text-2xl text-neon-pink glow-text-pink uppercase mb-2">
          CLASSIFIED ARCHIVES
        </h2>
        <p className="font-tech text-xs sm:text-sm text-gray-400">
          Declassified logs detailing the rise of the titan beneath the neon towers.
        </p>
      </div>

      {/* City Banner Art */}
      <div className="w-full border-2 border-neon-cyan mb-8 overflow-hidden relative shadow-pixel-cyan bg-cyber-black">
        <img
          src="/assets/city/xilla-city-banner.gif"
          alt="XiLLA City Banner"
          className="w-full h-auto block filter contrast-125"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Cinematic Scene Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Acts Navigation */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          {scenes.map((scene, idx) => (
            <button
              key={idx}
              onClick={() => { playBlip(480 + idx * 50); setActiveScene(idx); }}
              className={`p-3.5 border-2 text-left font-pixel text-xs transition-all flex items-center justify-between ${
                activeScene === idx
                  ? 'border-neon-pink bg-cyber-panel text-neon-pink shadow-pixel-pink translate-x-1'
                  : 'border-gray-800 bg-cyber-black text-gray-400 hover:border-gray-600'
              }`}
            >
              <span>{scene.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Right: Active Narrative Scene View */}
        <div className="lg:col-span-8 pixel-panel border-neon-pink p-6 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800 text-[11px] font-tech text-gray-400">
              <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
                <Radio className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                {scenes[activeScene].tag}
              </span>
              <span className="font-pixel text-[9px] text-danger-red bg-danger-red/10 border border-danger-red/40 px-2 py-0.5">
                {scenes[activeScene].alert}
              </span>
            </div>

            <h3 className="font-pixel text-base text-white mb-3">
              {scenes[activeScene].title}
            </h3>

            <p className="font-tech text-sm sm:text-base text-gray-300 leading-relaxed">
              {scenes[activeScene].text}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400 font-tech">
            <span>TRANSMISSION SECURE // 256-BIT ENCRYPTION</span>
            <span className="font-pixel text-[10px] text-neon-cyan">LOG {activeScene + 1} OF 4</span>
          </div>
        </div>
      </div>
    </section>
  );
}
