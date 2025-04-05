"use client";

import React, { useEffect, useRef, useState } from "react";
import HeistMap from "@/components/HeistMap";
import Leaderboard from "@/components/Leaderboard";
import ActivityFeed from "@/components/ActivityFeed";
import TurnCounter from "@/components/TurnCounter";

type Hexagon = {
  q: number;
  r: number;
  owner: string | null;
  resources: number;
};

type Player = {
  id: string;
  name: string;
  personality: string;
  territories: number;
  resources: number;
  color: string;
};

type GameState = {
  grid: Hexagon[];
  players: Player[];
  turn: number;
  message: string;
  currentPlayer: string;
  playerCount: number;
  started: boolean;
};

export default function GameLayout() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const generateRandomHex = (length: number) => {
    const characters = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  useEffect(() => {
    // Generate random player ID and name
    const newPlayerId = `player_${generateRandomHex(8)}`;
    setPlayerId(newPlayerId);

    // Connect to WebSocket server
    const ws = new WebSocket("ws://localhost:4000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to game server");
      // Join the game room
      ws.send(
        JSON.stringify({
          type: "join",
          roomId: "default",
          playerId: newPlayerId,
          name: `Player_${generateRandomHex(4)}`,
          personality: "aggressive",
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data); // Debug log

        if (data.type === "update") {
          // Ensure we have the required data
          if (data.grid && Array.isArray(data.grid)) {
            const formattedGrid = data.grid.map((hex: any) => ({
              q: Number(hex.q),
              r: Number(hex.r),
              owner: hex.owner,
              resources: Number(hex.resources) || 0,
            }));

            const formattedPlayers = data.players.map((player: any) => ({
              id: player.id,
              name: player.name,
              personality: player.personality,
              territories: Number(player.territories) || 0,
              resources: Number(player.resources) || 0,
            }));

            setGameState({
              grid: formattedGrid,
              players: formattedPlayers,
              turn: Number(data.turn) || 0,
              message: data.message || "",
              currentPlayer: data.currentPlayer || "",
              playerCount: Number(data.playerCount) || 0,
              started: Boolean(data.started),
            });

            // Add new message to history if it exists
            if (data.message) {
              setMessageHistory((prev) => [...prev, data.message]);
            }
          }
        } else if (data.type === "error") {
          console.error("Server error:", data.message);
          setMessageHistory((prev) => [...prev, `Error: ${data.message}`]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setMessageHistory((prev) => [...prev, "Error parsing server message"]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setMessageHistory((prev) => [...prev, "WebSocket connection error"]);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setMessageHistory((prev) => [...prev, "Connection to server closed"]);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Debug log to check game state
  useEffect(() => {
    console.log("Current game state:", gameState);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <Leaderboard
              players={gameState?.players || []}
              currentPlayerId={playerId}
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
              grid={gameState?.grid || []}
              currentPlayer={gameState?.currentPlayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
