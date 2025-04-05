"use client";

import React from "react";

type Player = {
  id: string;
  name: string;
  points: number;
  rank: number;
  isCurrentPlayer?: boolean;
  status?: "ingame" | "out";
};

type LeaderboardProps = {
  players?: Player[];
};

export default function Leaderboard({ players }: LeaderboardProps) {
  // Default players if none provided
  const defaultPlayers: Player[] = [
    { id: "a", name: "Player A", points: 26, rank: 1, status: "ingame" },
    { id: "b", name: "Player B", points: 26, rank: 2 },
    { id: "c", name: "Player C", points: 26, rank: 2, isCurrentPlayer: true },
    { id: "d", name: "Player D", points: 26, rank: 3 },
  ];

  const displayPlayers = players || defaultPlayers;

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {displayPlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-zinc-500">#{player.rank}</span>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="font-medium">
                {player.name}
                {player.isCurrentPlayer && (
                  <span className="text-zinc-500 ml-2">You</span>
                )}
              </span>
              {player.id === "a" && (
                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded">
                  $GAME
                </span>
              )}
            </div>
            <span>{player.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
