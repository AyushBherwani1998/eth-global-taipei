"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { celoAlfajores as chain } from "viem/chains";
import { ReactNode } from "react";
import { metaMask } from "wagmi/connectors";

export const connectors = [metaMask()];

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [chain.id]: http(),
  },
});

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  );
}