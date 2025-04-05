"use client";

import React, { useEffect, useRef } from "react";

type ActivityFeedProps = {
  messages: string[];
};

export default function ActivityFeed({ messages }: ActivityFeedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-zinc-900 rounded-lg p-4 flex flex-col h-[400px]">
      <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className="p-2 bg-zinc-800 rounded text-sm text-zinc-300"
          >
            {message}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-zinc-500 text-center py-4">
            No activity yet
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
