"use client";

import React, { useEffect, useState } from "react";

type Player = {
  id: string;
  name: string;
  personality: string;
  territories: number;
  resources: number;
};

type LeaderboardProps = {
  players: Player[];
};

export default function Leaderboard({ players }: LeaderboardProps) {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Sort players by territories (descending)
    const sorted = [...players].sort((a, b) => b.territories - a.territories);
    setSortedPlayers(sorted);
  }, [players]); // Re-sort whenever players prop changes

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-zinc-800 rounded"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{index + 1}.</span>
              <span className="font-medium">{player.name}</span>
            </div>
            <div className="text-sm text-zinc-400">
              {player.territories} territories
            </div>
          </div>
        ))}
        {sortedPlayers.length === 0 && (
          <div className="text-sm text-zinc-500 text-center py-4">
            No players yet
          </div>
        )}
      </div>
    </div>
  );
}
