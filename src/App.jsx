import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { AudioProvider } from './context/AudioContext';

import BootSequence from './components/BootSequence';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardGrid from './components/Dashboard/DashboardGrid';
import SurvivalProtocol from './components/SurvivalProtocol';
import LoreSection from './components/LoreSection';
import IntelArrival from './components/IntelArrival';
import Footer from './components/Footer';

import IdentityModal from './components/Modals/IdentityModal';
import WalletModal from './components/Modals/WalletModal';
import LeaderboardModal from './components/Modals/LeaderboardModal';
import EasterEggs from './components/EasterEggs';

import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('xilla_admin_key') || null;
  });

  useEffect(() => {
    // Check if current URL path is /admin
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin')) {
      setIsAdminRoute(true);
    }
  }, []);

  // Admin Route Handler
  if (isAdminRoute) {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token) => {
            setAdminToken(token);
          }}
        />
      );
    }
    return (
      <AdminDashboard
        adminToken={adminToken}
        onLogout={() => {
          sessionStorage.removeItem('xilla_admin_key');
          setAdminToken(null);
        }}
      />
    );
  }

  // Public Game Website
  return (
    <AudioProvider>
      <GameProvider>
        <div className="relative min-h-screen bg-cyber-black text-gray-100 flex flex-col font-tech selection:bg-neon-pink selection:text-white">
          
          {/* CRT Arcade Scanlines & Vignette Overlays */}
          <div className="crt-overlay" />
          <div className="crt-vignette" />

          {/* Interactive Modals */}
          <BootSequence />
          <IdentityModal />
          <WalletModal />
          <LeaderboardModal />
          <EasterEggs />

          {/* Navigation */}
          <Navbar />

          {/* Main Gameplay View */}
          <main className="flex-1 flex flex-col">
            <Hero />
            <DashboardGrid />
            <SurvivalProtocol />
            <LoreSection />
            <IntelArrival />
          </main>

          {/* Footer */}
          <Footer />

        </div>
      </GameProvider>
    </AudioProvider>
  );
}
