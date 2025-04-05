import { createCaveatBuilder, createDelegation, Delegation, MetaMaskSmartAccount } from "@metamask-private/delegator-core-viem";

export const useDelegationUtils = () => {

  async function delegate({
    delegator,
    maxTradeFee,
  }: {
    delegator: MetaMaskSmartAccount;
    maxTradeFee: bigint;
  }): Promise<Delegation> {
    const transferAmount = maxTradeFee * 10n**6n;
    const caveatBuilder = createCaveatBuilder(delegator.environment);
    const caveats = caveatBuilder.addCaveat("erc20TransferAmount",
        "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
        transferAmount,
      ).addCaveat("limitedCalls",
        1
      ).build();

    const delegation = createDelegation({
      from: delegator.address,
      to: "0xCa9C01d814433a4052d771f359d68fde97F87d1f",
      caveats: caveats,
    });

    const signature = await delegator.signDelegation({delegation});
    return {
        ...delegation,
        signature,
    }
  }

  return {
    delegate,
  }
};
