"use client";

import React from "react";
import Header from "@/components/Header";
import StrategyForm from "@/components/StrategyForm";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

export default function StrategyLayout() {
  const router = useRouter();
  let EnsSubDomain = "ayush.dunewars.eth";
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Header />

        {/* Profile Card */}
        <div className="flex justify-center mb-8">
          <ProfileCard
            username={EnsSubDomain}
            avatarUrl={`https://api.cloudnouns.com/v1/pfp?background=n&theme=nounsinblack&text=${encodeURIComponent(
              EnsSubDomain
            )}&accessory=none`}
          />
        </div>

        {/* Strategy Configuration Form */}
        <div className="max-w-lg mx-auto">
          <StrategyForm />
        </div>

        {/* Join Game Button */}
        <div className="max-w-lg mx-auto mt-8">
          <Button
            variant="default"
            className="w-full py-6 text-base font-medium border-zinc-700"
            onClick={() => {
              router.push("/game");
            }}
          >
            Join Room - Stake 1 USDC
          </Button>
        </div>
      </div>
    </div>
  );
}
