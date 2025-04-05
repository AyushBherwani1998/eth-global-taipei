"use client";

import React from "react";

type ActivityType =
  | "join"
  | "leave"
  | "loot"
  | "alliance"
  | "conquer"
  | "countdown";

type Activity = {
  id: string;
  type: ActivityType;
  players: string[];
  target?: string;
  timestamp: Date;
  countdown?: number;
};

type ActivityFeedProps = {
  activities?: Activity[];
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  // Default activities if none provided
  const defaultActivities: Activity[] = [
    { id: "1", type: "join", players: ["Player D"], timestamp: new Date() },
    {
      id: "2",
      type: "countdown",
      players: [],
      timestamp: new Date(),
      countdown: 4,
    },
    { id: "3", type: "join", players: ["Player E"], timestamp: new Date() },
    {
      id: "4",
      type: "countdown",
      players: [],
      timestamp: new Date(),
      countdown: 3,
    },
    { id: "5", type: "loot", players: ["Player A"], timestamp: new Date() },
    {
      id: "6",
      type: "alliance",
      players: ["Player B", "Player C"],
      timestamp: new Date(),
    },
    {
      id: "7",
      type: "conquer",
      players: ["Player B", "Player C"],
      target: "Player D",
      timestamp: new Date(),
    },
    { id: "8", type: "leave", players: ["Player D"], timestamp: new Date() },
    {
      id: "9",
      type: "conquer",
      players: ["Player A"],
      target: "Player E",
      timestamp: new Date(),
    },
    {
        id: "9",
        type: "conquer",
        players: ["Player A"],
        target: "Player E",
        timestamp: new Date(),
      },
      {
        id: "9",
        type: "conquer",
        players: ["Player A"],
        target: "Player E",
        timestamp: new Date(),
      },
      {
        id: "9",
        type: "conquer",
        players: ["Player A"],
        target: "Player E",
        timestamp: new Date(),
      },
  ];

  const displayActivities = activities || defaultActivities;

  const renderActivity = (activity: Activity) => {
    const { type, players, target } = activity;

    switch (type) {
      case "join":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">{players[0]}</span>
            <span className="text-zinc-500">joined the game</span>
          </div>
        );
      case "countdown":
        return (
          <div className="text-zinc-500">
            Game starts in {activity.countdown}...2...1
          </div>
        );
      case "loot":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">{players[0]}</span>
            <span className="text-zinc-500">looted the chest</span>
          </div>
        );
      case "alliance":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">{players[0]}</span>
            <span className="text-zinc-500">&</span>
            <span className="font-medium">{players[1]}</span>
            <span className="text-zinc-500">formed an alliance</span>
          </div>
        );
      case "conquer":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">{players.join(" & ")}</span>
            <span className="text-zinc-500">conquered</span>
            <span className="font-medium">{target}</span>
          </div>
        );
      case "leave":
        return (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">{players[0]}</span>
            <span className="text-zinc-500">is out of the game</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {displayActivities.map((activity) => (
          <div key={activity.id}>{renderActivity(activity)}</div>
        ))}
        <div className="text-zinc-500">4/5 players in the game</div>
      </div>
    </div>
  );
}
