"use client";

import React from "react";
import { useGame } from "@/hooks/useGameState";
import Leaderboard from "@/components/Leaderboard";
import ActivityFeed from "@/components/ActivityFeed";
import HeistMap from "@/components/HeistMap";
import TurnCounter from "@/components/TurnCounter";

export default function GameLayout() {
  const { isConnected, gameState, messageHistory, joinRoom } = useGame();

  // Join game when component mounts
  React.useEffect(() => {
    if (isConnected) {
      joinRoom(`Player_${Math.random().toString(36).substring(2, 6)}`, "aggressive");
    }
  }, [isConnected, joinRoom]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <Leaderboard
              players={gameState.players}
              currentPlayerId={gameState.currentPlayer}
            />
            <ActivityFeed messages={messageHistory} />
          </div>

          <div className="md:col-span-2 bg-zinc-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-row items-center gap-4">
                <div className="top-2 right-2 w-3 h-3 bg-red-500 rounded-full flicker-animation" />
                <h2 className="text-xl font-bold">Live Map</h2>
              </div>
              {gameState && (
                <div className="text-sm">
                  <TurnCounter current={gameState.turn} total={10} />
                </div>
              )}
            </div>
            <HeistMap
              grid={gameState.grid}
              currentPlayer={gameState.currentPlayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
