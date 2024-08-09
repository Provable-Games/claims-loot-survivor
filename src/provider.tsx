"use client";
import React from "react";
import {
  StarknetConfig,
  starkscan,
  jsonRpcProvider,
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { Chain } from "@starknet-react/chains";
import { networkConfig } from "./lib/networkConfig";
import { Network } from "./hooks/useUIStore";
import { useInjectedConnectors } from "@starknet-react/core";
import { cartridgeConnector } from "./lib/connectors";

export function StarknetProvider({
  children,
  network,
}: {
  children: React.ReactNode;
  network: Network;
}) {
  function rpc(_chain: Chain) {
    return {
      nodeUrl: networkConfig[network!].rpcUrl!,
    };
  }

  const { connectors } = useInjectedConnectors({
    // Randomize the order of the connectors.
    order: "random",
  });

  const chains = network === "mainnet" ? [mainnet] : [sepolia];

  return (
    <StarknetConfig
      autoConnect
      chains={chains}
      connectors={[
        ...connectors,
        cartridgeConnector(
          networkConfig[network!].gameAddress,
          networkConfig[network!].lordsAddress,
          networkConfig[network!].ethAddress
        ),
      ]}
      explorer={starkscan}
      provider={jsonRpcProvider({ rpc })}
    >
      {children}
    </StarknetConfig>
  );
}
