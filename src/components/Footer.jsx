import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const { projectConfig } = useGame();
  const links = projectConfig?.links || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-cyber-black border-t-2 border-neon-cyan/40 py-8 px-4 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tech text-gray-400">
        
        {/* Left: Branding & Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-pixel text-neon-cyan text-sm tracking-wider glow-text-cyan">
            ▲ XiLLA
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span>© 2026 XiLLA PROTOCOL. ALL RIGHTS RESERVED.</span>
        </div>

        {/* Center: Socials & Ecosystem Links */}
        <div className="flex items-center flex-wrap justify-center gap-4 font-pixel text-[10px]">
          {links.twitter && (
            <a
              href={links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-cyan transition-colors"
            >
              X (TWITTER)
            </a>
          )}
          {links.opensea && (
            <a
              href={links.opensea}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-cyan transition-colors"
            >
              OPENSEA
            </a>
          )}
          {links.discord && (
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-pink transition-colors"
            >
              DISCORD
            </a>
          )}
          {links.telegram && (
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-neon-yellow transition-colors"
            >
              TELEGRAM
            </a>
          )}
          <a
            href="#missions"
            className="text-gray-400 hover:text-neon-green transition-colors"
          >
            MISSIONS
          </a>
        </div>

        {/* Right: Scroll to Top */}
        <div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[11px] hover:text-neon-cyan px-2.5 py-1 border border-gray-800 bg-cyber-dark hover:border-neon-cyan transition-colors"
          >
            <span>RETURN TO TOP</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
}
