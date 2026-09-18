import React from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { Play, Shield, ExternalLink, Users } from 'lucide-react';

export default function Hero({ onJoinClick }) {
  const { registeredSurvivors, requireIdentity } = useGame();
  const { playLaser } = useAudio();

  const handleJoinWL = () => {
    playLaser();
    if (!requireIdentity('JOIN_WL')) return;

    if (onJoinClick) {
      onJoinClick();
    } else {
      const el = document.getElementById('missions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const survivorsCount = registeredSurvivors || 0;

  return (
    <section 
      id="hero" 
      className="relative w-full border-b-4 border-neon-pink bg-cyber-black select-none overflow-hidden"
    >
      {/* HERO.GIF AS THE DIRECT FULL BACKGROUND OF THE HERO SECTION */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <img
          src="/assets/hero/Hero.gif"
          alt="XiLLA City Background"
          className="w-full h-full object-cover object-center filter contrast-105 brightness-95"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Subtle dark overlay for perfect text contrast while keeping the animation vivid */}
        <div className="absolute inset-0 bg-cyber-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/85 via-transparent to-cyber-black/45" />
        {/* Subtle scanline texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />
      </div>

      {/* CONTENT LAYER POSITIONED DIRECTLY ON TOP OF HERO.GIF BACKGROUND */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-10 sm:pb-12 flex flex-col items-center text-center">
        
        {/* Sector Live Status Tag */}
        <div className="mb-3 sm:mb-4">
          <div className="px-3 py-1 bg-cyber-black/80 border border-neon-cyan text-neon-cyan font-pixel text-[8px] sm:text-[9px] tracking-widest uppercase flex items-center gap-2 shadow-pixel-cyan backdrop-blur-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-danger-red animate-ping" />
            <span>SECTOR 07 // EMERGENCY BROADCAST LIVE</span>
          </div>
        </div>

        {/* Hero Display Titles */}
        <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-neon-cyan glow-text-cyan tracking-wider mb-1 sm:mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
          XiLLA
        </h1>

        <h2 className="font-pixel text-xl sm:text-3xl md:text-4xl text-neon-pink glow-text-pink tracking-wide mb-2 sm:mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
          HAS AWAKENED
        </h2>

        {/* Copy */}
        <p className="font-pixel text-[10px] sm:text-xs md:text-sm text-gray-100 uppercase tracking-wider mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          THE CITY NEEDS SURVIVORS.
        </p>
        <p className="font-tech text-xs sm:text-sm text-gray-300 tracking-wide mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          Enter the city. Complete missions. Earn your WL.
        </p>

        {/* Action Button: JOIN THE WL */}
        <div className="mb-4">
          <button
            onClick={handleJoinWL}
            className="pixel-btn text-xs sm:text-sm px-8 py-3 flex items-center gap-2 bg-neon-cyan border-neon-cyan text-cyber-black shadow-glow-cyan hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-cyber-black" />
            <span>JOIN THE WL</span>
          </button>
        </div>

        {/* Live Registered Survivors Counter */}
        <div className="mb-4 flex items-center gap-2 px-3.5 py-1.5 bg-cyber-black/90 border border-neon-green text-neon-green font-pixel text-[10px] sm:text-xs shadow-pixel-green backdrop-blur-sm">
          <Users className="w-3.5 h-3.5 text-neon-green animate-pulse" />
          <span>SURVIVORS:</span>
          <span className="text-white font-bold text-xs sm:text-sm bg-neon-green/25 px-2 py-0.5 border border-neon-green">
            {survivorsCount.toLocaleString()}
          </span>
          <span className="font-tech text-[10px] text-gray-400 hidden sm:inline">REGISTERED</span>
        </div>

        {/* Auto GTD Collections Showcase */}
        <div className="w-full max-w-2xl p-3 sm:p-3.5 bg-cyber-black/90 border-2 border-neon-yellow/70 backdrop-blur-md flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-tech text-gray-200 shadow-pixel-yellow">
          <div className="flex items-center gap-1.5 text-neon-yellow font-pixel text-[10px] sm:text-xs font-bold tracking-wider">
            <Shield className="w-4 h-4 text-neon-yellow shrink-0 animate-pulse" />
            <span>AUTO GTD:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://opensea.io/collection/web3-cat"
              target="_blank"
              rel="noreferrer"
              title="Web3 Cats on OpenSea (Robinhood)"
              className="group flex items-center gap-1.5 text-neon-cyan hover:text-neon-yellow transition-colors font-bold"
            >
              <span>Web3 Cats</span>
              <span className="text-[8px] sm:text-[9px] text-gray-300 bg-cyber-dark px-1.5 py-0.5 border border-gray-700 font-pixel">Robinhood</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-neon-yellow" />
            </a>

            <span className="text-gray-600 font-bold">/</span>

            <a
              href="https://opensea.io/collection/miggles-on-base"
              target="_blank"
              rel="noreferrer"
              title="Miggles on OpenSea (Base)"
              className="group flex items-center gap-1.5 text-neon-cyan hover:text-neon-yellow transition-colors font-bold"
            >
              <span>Miggles</span>
              <span className="text-[8px] sm:text-[9px] text-neon-cyan bg-neon-cyan/10 px-1.5 py-0.5 border border-neon-cyan/40 font-pixel">Base</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-neon-yellow" />
            </a>

            <span className="text-gray-600 font-bold">/</span>

            <a
              href="https://opensea.io/collection/internetmonkes"
              target="_blank"
              rel="noreferrer"
              title="Internet Monks on OpenSea (Robinhood)"
              className="group flex items-center gap-1.5 text-neon-cyan hover:text-neon-yellow transition-colors font-bold"
            >
              <span>Internet Monks</span>
              <span className="text-[8px] sm:text-[9px] text-gray-300 bg-cyber-dark px-1.5 py-0.5 border border-gray-700 font-pixel">Robinhood</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-neon-yellow" />
            </a>

            <span className="text-gray-600 font-bold">/</span>

            <a
              href="https://opensea.io/collection/banger-bots"
              target="_blank"
              rel="noreferrer"
              title="Banger Bots on OpenSea (Ethereum)"
              className="group flex items-center gap-1.5 text-neon-cyan hover:text-neon-yellow transition-colors font-bold"
            >
              <span>Banger Bots</span>
              <span className="text-[8px] sm:text-[9px] text-neon-pink bg-neon-pink/10 px-1.5 py-0.5 border border-neon-pink/40 font-pixel">Ethereum</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-neon-yellow" />
            </a>
          </div>

          <div className="w-full sm:w-auto mt-1 sm:mt-0 flex justify-center">
            <span className="text-neon-green font-pixel text-[9px] sm:text-[10px] px-2 py-0.5 bg-neon-green/15 border border-neon-green text-center">
              HOLDERS ARE AUTO GTD
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
