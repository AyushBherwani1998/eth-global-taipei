import { createCaveatBuilder, createDelegation, createRootDelegation, DelegationStruct, Implementation, MetaMaskSmartAccount } from "@metamask-private/delegator-core-viem";

export const useDelegationUtils = () => {

  async function delegate({
    delegator,
    maxTradeFee,
  }: {
    delegator: MetaMaskSmartAccount<Implementation>;
    maxTradeFee: bigint;
  }): Promise<DelegationStruct> {
    const transferAmount = maxTradeFee * 10n**6n;
    const caveatBuilder = createCaveatBuilder(delegator.environment);
    const caveats = caveatBuilder.addCaveat("erc20TransferAmount",
        "0xCa9C01d814433a4052d771f359d68fde97F87d1f",
        transferAmount,
      ).addCaveat("limitedCalls",
        1
      ).build();

    const delegation = createRootDelegation(
      delegator.address,
     "0xCa9C01d814433a4052d771f359d68fde97F87d1f",
      caveats,
    );

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
