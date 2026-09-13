import React from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { Play, Shield, ExternalLink, Users } from 'lucide-react';

export default function Hero({ onJoinClick }) {
  const { spotsRemaining, totalSpots, holderSpotsTaken, registeredSurvivors, projectConfig, requireIdentity } = useGame();
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

  const total = totalSpots || 5333;
  const remaining = spotsRemaining !== undefined ? spotsRemaining : 2421;
  const spotsTaken = Math.min(total, total - remaining);
  const percentageTaken = Math.min(100, Math.max(0, (spotsTaken / total) * 100));
  const survivorsCount = registeredSurvivors || 0;

  const web3CatHolders = projectConfig?.web3CatHolders || 1134;
  const migglesHolders = projectConfig?.migglesHolders || 1778;
  const liveHolderSpots = holderSpotsTaken || (web3CatHolders + migglesHolders);

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
        <div className="mb-3 flex items-center gap-2 px-3.5 py-1.5 bg-cyber-black/90 border border-neon-green text-neon-green font-pixel text-[10px] sm:text-xs shadow-pixel-green backdrop-blur-sm">
          <Users className="w-3.5 h-3.5 text-neon-green animate-pulse" />
          <span>SURVIVORS:</span>
          <span className="text-white font-bold text-xs sm:text-sm bg-neon-green/25 px-2 py-0.5 border border-neon-green">
            {survivorsCount.toLocaleString()}
          </span>
          <span className="font-tech text-[10px] text-gray-400 hidden sm:inline">REGISTERED</span>
        </div>

        {/* WL Spots Remaining Progress Bar */}
        <div className="w-full max-w-md sm:max-w-lg mb-4">
          <div className="relative w-full h-5 sm:h-6 bg-cyber-black/90 border-2 border-neon-cyan p-0.5 shadow-pixel-dark backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-neon-pink to-neon-pink/90 border-r-2 border-white transition-all duration-700 relative overflow-hidden"
              style={{ width: `${percentageTaken}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-scanline" />
            </div>
          </div>

          {/* Progress Text */}
          <div className="flex items-center justify-between font-pixel text-[9px] sm:text-[11px] text-gray-100 mt-1.5 px-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${remaining === 0 ? 'text-neon-yellow animate-pulse' : 'text-neon-pink'}`}>
                {remaining === 0 ? '0 (CAP REACHED)' : remaining.toLocaleString()}
              </span>
              <span className="text-gray-400">/</span>
              <span>{total.toLocaleString()} SPOTS REMAINING</span>
            </div>
            <span className="text-neon-cyan font-bold">{spotsTaken.toLocaleString()} / {total.toLocaleString()} ALLOCATED</span>
          </div>
        </div>

        {/* Real OpenSea Live Holder Spots Badge */}
        <div className="p-2 sm:p-2.5 bg-cyber-black/85 border-2 border-neon-cyan/50 backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-tech text-gray-200 shadow-pixel-dark">
          <span className="flex items-center gap-1.5 text-neon-yellow font-bold">
            <Shield className="w-3.5 h-3.5 text-neon-yellow shrink-0" />
            <span>{liveHolderSpots.toLocaleString()} SPOTS TAKEN BY HOLDERS:</span>
          </span>
          <a
            href="https://opensea.io/collection/web3-cat"
            target="_blank"
            rel="noreferrer"
            title="Contract: 0xe1f0f12725cfecdeb2e9b07fc5b25906fc7597b3 (Robinhood)"
            className="text-neon-cyan hover:underline flex items-center gap-1.5 font-bold"
          >
            <span>Web3 Cats</span>
            <span className="text-[8px] sm:text-[9px] text-gray-300 bg-cyber-dark px-1 py-0.5 border border-gray-700 font-pixel">Robinhood</span>
            <span className="text-white">({web3CatHolders.toLocaleString()})</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
          </a>
          <span className="text-gray-600 font-bold">|</span>
          <a
            href="https://opensea.io/collection/miggles-on-base"
            target="_blank"
            rel="noreferrer"
            title="Contract: 0x71cfbebb61a42d2e5ccff0831663cd58d2e442d9 (Base)"
            className="text-neon-cyan hover:underline flex items-center gap-1.5 font-bold"
          >
            <span>Miggles</span>
            <span className="text-[8px] sm:text-[9px] text-neon-cyan bg-neon-cyan/10 px-1 py-0.5 border border-neon-cyan/40 font-pixel">Base</span>
            <span className="text-white">({migglesHolders.toLocaleString()})</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
          </a>
        </div>

      </div>
    </section>
  );
}
