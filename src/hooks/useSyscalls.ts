import { useAccount, useConnect, useProvider } from "@starknet-react/core";
import { InvokeTransactionReceiptResponse } from "starknet";
import {
  COLLECTION_WEAPON_MAP,
  COLLECTION_TOKENS_MAP,
  getCollectionAlt,
} from "../lib/constants";
import { padAddress, getKeyByValue, stringToFelt } from "../lib/utils";
import { parseEvents } from "../lib/parseEvents";
// import { useUIStore } from "./useUIStore";
// import CartridgeConnector from "@cartridge/connector";

const useSyscalls = () => {
  const { account } = useAccount();
  const { connector } = useConnect();
  const { provider } = useProvider();

  const executeSetDelegate = async (delegateAddress: string) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

    console.log(account);

    await account
      .execute([
        {
          contractAddress: account.address,
          entrypoint: "set_delegate_account",
          calldata: [delegateAddress],
        },
      ])
      .catch((e) => console.error(e));
  };

  const executeClaim = async (
    gameAddress: string,
    freeGames: any[],
    controllerAccount: string
  ) => {
    // if (!account) {
    //   return;
    // }

    // if (connector?.id !== "cartridge") {
    //   return;
    // }

    console.log(gameAddress);
    console.log(freeGames);
    console.log(controllerAccount);

    const calls = freeGames.map((game) => ({
      contractAddress: gameAddress,
      entrypoint: "enter_launch_tournament",
      calldata: [
        COLLECTION_WEAPON_MAP[
          getKeyByValue(COLLECTION_TOKENS_MAP, padAddress(game.token))
        ], // weapon mapped to the collection
        stringToFelt(
          `${getCollectionAlt(padAddress(game.token))} #${game.tokenId}`
        ).toString(), // token identifier to be used for the adventurer name
        "0", // always use the default renderer
        "1", // all the free games should not reveal stats immediately
        game.token, // collection address
        game.tokenId.toString(), // token id
        controllerAccount,
      ],
    }));

    const tx = await account.execute(calls).catch((e) => console.error(e));

    const receipt = await provider?.waitForTransaction(
      (tx as any)?.transaction_hash
    );

    const claimedFreeGameEvents = await parseEvents(
      receipt as InvokeTransactionReceiptResponse,
      "ClaimedFreeGame"
    );

    console.log(claimedFreeGameEvents);
  };

  const executeReveal = async (gameAddress: string, adventurerId: number) => {
    // if (!account) {
    //   return;
    // }

    // if (connector?.id !== "cartridge") {
    //   return;
    // }

    await account
      .execute([
        {
          contractAddress: gameAddress,
          entrypoint: "attack", // slaying the first beast acts as the prompt to reveal stats
          calldata: [adventurerId.toString(), "1"],
        },
      ])
      .catch((e) => console.error(e));
  };

  const executeRevealAll = async (
    gameAddress: string,
    unrevealedGames: any[]
  ) => {
    // if (!account) {
    //   return;
    // }

    // if (connector?.id !== "cartridge") {
    //   return;
    // }

    const calls = unrevealedGames.map((game) => ({
      contractAddress: gameAddress,
      entrypoint: "attack", // slaying the first beast acts as the prompt to reveal stats
      calldata: [game.adventurerId.toString(), "1"],
    }));

    const tx = await account.execute(calls).catch((e) => console.error(e));

    console.log(tx);

    // const receipt = await provider?.waitForTransaction(tx?.transaction_hash, {
    //   retryInterval: getWaitRetryInterval(network!),
    // });
  };

  return { executeSetDelegate, executeClaim, executeReveal, executeRevealAll };
};

export default useSyscalls;
