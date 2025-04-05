import React from "react";
import HeistMap from "@/components/HeistMap";
import Leaderboard from "@/components/Leaderboard";
import ActivityFeed from "@/components/ActivityFeed";
export default function GameLayout() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        {/* <Header /> */}

        {/* Game Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <Leaderboard />
            <ActivityFeed />
          </div>

          {/* Main Game Area (spans 2 columns) */}
          <div className="md:col-span-2 bg-zinc-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Heist Map</h2>
              {/* <TurnCounter current={1} total={10} /> */}
            </div>
            <HeistMap />
          </div>
        </div>
      </div>
    </div>
  );
}
