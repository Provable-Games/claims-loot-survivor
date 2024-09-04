import { Connector } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { shortString } from "starknet";

export const getWalletConnectors = (connectors: Connector[]) =>
  connectors.filter((connector) => connector.id !== "cartridge");

export const getCartridgeConnector = (connectors: Connector[]) =>
  connectors.find((connector) => connector.id === "cartridge");

export const cartridgeConnector = (
  gameAddress: string,
  lordsAddress: string,
  ethAddress: string,
  rpcUrl: string
) =>
  new CartridgeConnector(
    [
      {
        target: gameAddress,
        method: "new_game",
      },
      {
        target: gameAddress,
        method: "enter_launch_tournament",
      },
      {
        target: gameAddress,
        method: "enter_launch_tournament_with_signature",
      },
      {
        target: gameAddress,
        method: "explore",
      },
      {
        target: gameAddress,
        method: "attack",
      },
      {
        target: gameAddress,
        method: "flee",
      },
      {
        target: gameAddress,
        method: "equip",
      },
      {
        target: gameAddress,
        method: "drop",
      },
      {
        target: gameAddress,
        method: "upgrade",
      },
      {
        target: lordsAddress,
        method: "approve",
      },
      {
        target: lordsAddress,
        method: "mint_lords",
      },
      {
        target: ethAddress,
        method: "approve",
      },
    ],
    {
      paymaster: {
        caller: shortString.encodeShortString("ANY_CALLER"),
      },
      rpc: rpcUrl,
      theme: "loot-survivor",
    }
  ) as never as Connector;
