import React from 'react';
import MissionBoard from './MissionBoard';
import Leaderboard from './Leaderboard';
import SurvivorProfile from './SurvivorProfile';
export default function DashboardGrid() {
  return (
    <section id="missions" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* 2-Column Responsive Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Column 1: PLAY TO SURVIVE (Missions) - 7 cols */}
        <div className="lg:col-span-7 pixel-panel p-4 sm:p-6 flex flex-col justify-between">
          <MissionBoard />
        </div>

        {/* Column 2: SURVIVOR RANKINGS & YOUR SURVIVOR - 5 cols */}
        <div id="rankings" className="lg:col-span-5 pixel-panel p-4 sm:p-6 flex flex-col justify-between space-y-6">
          <Leaderboard />
          <SurvivorProfile />
        </div>
      </div>
    </section>
  );
}
