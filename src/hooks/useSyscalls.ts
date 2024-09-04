import { useAccount, useConnect, useProvider } from "@starknet-react/core";
import { InvokeTransactionReceiptResponse, constants } from "starknet";
import { AccountInterface } from "starknet";
import {
  COLLECTION_WEAPON_MAP,
  COLLECTION_TOKENS_MAP,
  getCollectionAlt,
} from "../lib/constants";
import { padAddress, getKeyByValue, stringToFelt } from "../lib/utils";
import { parseEvents } from "../lib/parseEvents";
import { useUIStore } from "./useUIStore";
import { getTypedData } from "../lib/utils";
import { Network } from "../lib/types";

const useSyscalls = () => {
  const { account } = useAccount();
  const { connector } = useConnect();
  const { provider } = useProvider();
  const {
    setPreparingClaim,
    setClaiming,
    setFreeGamesData,
    setSkipGameFetch,
    setClaimed,
    signature,
    setSignature,
  } = useUIStore();

  const executeSetDelegate = async (delegateAddress: string) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

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

  const verifyWalletSignature = async (
    account: AccountInterface,
    controllerAccount: string
  ) => {
    const network = import.meta.env.VITE_NETWORK as Network;

    const signature = await account.signMessage(
      getTypedData(
        { recipient: controllerAccount },
        network === "mainnet"
          ? constants.StarknetChainId.SN_MAIN
          : constants.StarknetChainId.SN_SEPOLIA
      )
    );

    setSignature(signature);
  };

  const executeClaim = async (
    gameAddress: string,
    freeGames: any[],
    delegateAddress: string
  ) => {
    const calls = freeGames.map((game) => ({
      contractAddress: gameAddress,
      entrypoint: "enter_launch_tournament_with_signature",
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
        delegateAddress,
        account.address,
        signature,
      ],
    }));

    const tx = await account.execute(calls).catch((e) => console.error(e));

    setPreparingClaim(false);
    setClaiming(true);

    const receipt = await provider?.waitForTransaction(
      (tx as any)?.transaction_hash
    );

    const claimedFreeGameEvents = await parseEvents(
      receipt as InvokeTransactionReceiptResponse,
      "ClaimedFreeGame"
    );

    setFreeGamesData((prevFreeGamesData) => [
      ...prevFreeGamesData,
      ...claimedFreeGameEvents.map((event) => ({
        token: event.data.collectionAddress,
        tokenId: event.data.tokenId,
        adventurerId: event.data.adventurerId,
      })),
    ]);
    setClaiming(false);
    setSkipGameFetch(true);
    setClaimed(true);
    setSignature(null);
  };

  const executeReveal = async (gameAddress: string, adventurerId: number) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

    const tx = await account
      .execute([
        {
          contractAddress: gameAddress,
          entrypoint: "attack", // slaying the first beast acts as the prompt to reveal stats
          calldata: [adventurerId.toString(), "1"],
        },
      ])
      .catch((e) => console.error(e));

    await provider?.waitForTransaction((tx as any)?.transaction_hash);
  };

  const executeRevealAll = async (
    gameAddress: string,
    unrevealedGames: any[]
  ) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

    const calls = unrevealedGames.map((game) => ({
      contractAddress: gameAddress,
      entrypoint: "attack", // slaying the first beast acts as the prompt to reveal stats
      calldata: [game.adventurerId.toString(), "1"],
    }));

    const tx = await account.execute(calls).catch((e) => console.error(e));

    await provider?.waitForTransaction((tx as any)?.transaction_hash);
  };

  return {
    executeSetDelegate,
    verifyWalletSignature,
    executeClaim,
    executeReveal,
    executeRevealAll,
  };
};

export default useSyscalls;
