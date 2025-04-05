"use client";

import React, { useEffect } from "react";

type Hexagon = {
  q: number;
  r: number;
  owner: string | null;
  resources: number;
};

type HeistMapProps = {
  grid: Hexagon[];
  currentPlayer: string | undefined;
};

export default function HeistMap({ grid, currentPlayer }: HeistMapProps) {
  const hexSize = 50;
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = 2 * hexSize;

  // Debug log to check incoming data
  useEffect(() => {
    console.log("HeistMap received update:", { grid, currentPlayer });
  }, [grid, currentPlayer]);

  const getHexPosition = (q: number, r: number) => {
    const x = q * hexWidth * 0.75;
    const y = r * hexHeight * 0.5 + q * hexHeight * 0.25;
    return { x, y };
  };

  const getPlayerColor = (playerName: string | null) => {
    if (!playerName) return "#1f2937"; // Dark gray for unowned
    
    // Generate a consistent random color for each player
    const hash = playerName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Convert hash to a color with higher saturation and brightness
    const color = `hsl(${hash % 360}, 80%, 60%)`;
    return color;
  };

  const renderHexagon = (hex: Hexagon) => {
    const { x, y } = getHexPosition(hex.q, hex.r);
    const points = [
      [0, -hexSize],
      [hexWidth / 2, -hexSize / 2],
      [hexWidth / 2, hexSize / 2],
      [0, hexSize],
      [-hexWidth / 2, hexSize / 2],
      [-hexWidth / 2, -hexSize / 2],
    ].map(([px, py]) => `${x + px},${y + py}`).join(" ");

    const isCurrentPlayer = currentPlayer === hex.owner;
    const isAdjacent = grid.some(h => 
      h.owner === currentPlayer && 
      Math.abs(h.q - hex.q) <= 1 && 
      Math.abs(h.r - hex.r) <= 1
    );

    return (
      <g 
        key={`${hex.q},${hex.r}`}
        className="transition-all duration-300 hover:scale-110"
      >
        <polygon
          points={points}
          fill={getPlayerColor(hex.owner)}
          stroke="white"
          strokeWidth="2"
          opacity={isCurrentPlayer || isAdjacent ? 1 : 0.9}
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-[600px] border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
      <svg
        width="100%"
        height="100%"
        viewBox="-200 -200 400 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {grid.map(renderHexagon)}
      </svg>
    </div>
  );
}
