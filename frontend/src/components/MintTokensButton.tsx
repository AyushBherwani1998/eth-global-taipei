"use client";

import { useMultibass } from "@/hooks/useMultibaas";
import { Hex } from "viem";
import { useAccount } from "wagmi";

export default function MintTokensButton() {
  const { mintToken } = useMultibass();
  const { address } = useAccount();
  
  return (
    <button
      className="button"
      onClick={() => mintToken({ address: address as Hex, amount: BigInt(1000000000000000000) })}
    >
     Mint Tokens
    </button>
  );
}
