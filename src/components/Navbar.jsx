import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAudio } from '../context/AudioContext';
import { Volume2, VolumeX, Shield, User, Menu, X as CloseIcon } from 'lucide-react';

export default function Navbar({ onNavigate, currentSection }) {
  const { handle, setIsIdentityModalOpen } = useGame();
  const { isMuted, toggleAudio, playBlip } = useAudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'hero', label: 'WORLD' },
    { id: 'missions', label: 'MISSIONS' },
    { id: 'protocol', label: 'PROTOCOL' },
    { id: 'lore', label: 'LORE' },
    { id: 'intel', label: 'INTEL' },
  ];

  const handleNavClick = (id) => {
    playBlip(550);
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-cyber-dark/95 backdrop-blur-md border-b-2 border-neon-cyan/40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2 text-neon-cyan font-pixel text-lg sm:text-xl tracking-wider glow-text-cyan hover:opacity-90 transition-opacity"
          >
            <span className="text-neon-pink">▲</span>
            <span>XiLLA</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-tech tracking-wider">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`hover:text-neon-cyan transition-colors uppercase font-bold py-1 ${
                currentSection === link.id
                  ? 'text-neon-cyan border-b-2 border-neon-cyan'
                  : 'text-gray-300'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Controls: Audio & Identity */}
        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-tech text-gray-300 hover:text-neon-cyan border border-gray-700 bg-cyber-black transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-danger-red" />
                <span className="hidden sm:inline">AUDIO: OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                <span className="hidden sm:inline text-neon-green">AUDIO: ON</span>
              </>
            )}
          </button>

          {/* Survivor Identity / Connect Button */}
          {handle ? (
            <button
              onClick={() => { playBlip(); setIsIdentityModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tech font-bold text-neon-cyan border-2 border-neon-cyan bg-cyber-panel hover:bg-neon-cyan/15 transition-colors shadow-pixel-cyan"
            >
              <Shield className="w-3.5 h-3.5 text-neon-green" />
              <span>{handle}</span>
            </button>
          ) : (
            <button
              onClick={() => { playBlip(); setIsIdentityModalOpen(true); }}
              className="pixel-btn pixel-btn-pink text-[10px] sm:text-xs py-1.5 px-3"
            >
              <User className="w-3.5 h-3.5" />
              <span>IDENTIFY OPERATIVE</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-gray-300 hover:text-neon-cyan border border-gray-700 bg-cyber-black"
          >
            {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyber-black border-b-2 border-neon-cyan p-4 flex flex-col gap-3 font-tech text-sm">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="text-left py-2 px-3 hover:bg-cyber-panel text-gray-200 hover:text-neon-cyan border-l-2 border-transparent hover:border-neon-cyan"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
