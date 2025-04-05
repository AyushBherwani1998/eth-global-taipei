"use client";

import React from "react";
import Header from "@/components/Header";
import StrategyForm from "@/components/StrategyForm";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import useDelegatorSmartAccount from "@/hooks/useDelegatorSmartAccout";
import { useDelegationUtils } from "@/hooks/useDelegationUtils";
import { useAccountAbstractionUtils } from "@/hooks/useAccountAbstractionUtils";
import { encodeFunctionData, erc20Abi, prepareEncodeFunctionData } from "viem";

export default function StrategyLayout() {
  const router = useRouter();
  const { smartAccount } = useDelegatorSmartAccount();
  const { bundlerClient } = useAccountAbstractionUtils();
  const { paymasterClient } = useAccountAbstractionUtils();
  const { pimlicoClient } = useAccountAbstractionUtils();
  const { delegate } = useDelegationUtils();

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
            onClick={async () => {
              if (smartAccount) {
                const signedDelegation = await delegate({
                  delegator: smartAccount,
                  maxTradeFee: 2n * 10n ** 6n,
                });
                console.log("signedDelegation", signedDelegation);
                const transfer = prepareEncodeFunctionData({
                  abi: erc20Abi,
                  functionName: "transfer",
                });

                const data = encodeFunctionData({
                  ...transfer,
                  args: [
                    "0xCa9C01d814433a4052d771f359d68fde97F87d1f",
                    1n * 10n ** 6n,
                  ],
                });

                const { fast: fee } = await pimlicoClient!.getUserOperationGasPrice();

                const userOp = await bundlerClient?.sendUserOperation({
                  account: smartAccount,
                  calls: [
                    {
                      to: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
                      data,
                      value: 0n,
                    },
                  ],
                  ...fee,
                  paymaster: paymasterClient,
                });
                console.log("userOp", userOp);
                router.push("/game");
              }
            }}
          >
            Join Room - Stake 1 USDC
          </Button>
        </div>
      </div>
    </div>
  );
}
