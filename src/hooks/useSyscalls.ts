import { useAccount, useConnect, useProvider } from "@starknet-react/core";
import { InvokeTransactionReceiptResponse, constants } from "starknet";
import { AccountInterface } from "starknet";
import { COLLECTION_WEAPON_MAP, COLLECTION_TOKENS_MAP } from "../lib/constants";
import { padAddress, getKeyByValue, stringToFelt } from "../lib/utils";
import { parseEvents } from "../lib/parseEvents";
import { useUIStore } from "./useUIStore";
import { getTypedData, indexAddress } from "../lib/utils";
import {
  GAMES_PER_TOKEN,
  collectionTotalGames,
  collectionsData,
} from "../lib/constants";

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
    const network = "mainnet";

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
    claimedCounts: any[],
    freeGames: any[],
    delegateAddress: string,
    tbtTournament: string
  ) => {
    const getCollectionFreeGames = (token: string) => {
      if (freeGames === null) {
        return null; // Return null if data hasn't been fetched yet
      }
      return freeGames
        .filter((game) => padAddress(game.token) === token)
        .reduce((sum, token) => sum + token.freeGamesAvailable, 0);
    };

    const calculateGamesToClaimPerCollection = () => {
      return collectionsData.map((collection) => {
        const token = collection.token;
        const gamesClaimed =
          claimedCounts?.find((game: any) => game.token === indexAddress(token))
            ?.count || 0;

        const gamesLeft = collectionTotalGames(tbtTournament) - gamesClaimed;
        const freeGamesAvailable = getCollectionFreeGames(token);
        // Calculate the number of tokens available to claim
        const tokensLeft = Math.ceil(gamesLeft / GAMES_PER_TOKEN[token]);
        const freeTokensAvailable = Math.ceil(
          freeGamesAvailable / GAMES_PER_TOKEN[token]
        );

        // Calculate the number of tokens to claim
        const tokensToClaim = Math.min(tokensLeft, freeTokensAvailable);

        return {
          token,
          alt: collection.alt,
          tokensToClaim,
        };
      });
    };

    const gamesToClaimPerCollection = calculateGamesToClaimPerCollection();

    const tokenIndexMap = new Map<string, number>();

    const calls = gamesToClaimPerCollection.flatMap(
      ({ token, alt, tokensToClaim }) => {
        // Get the free games for this token
        const tokenFreeGames = freeGames.filter(
          (game) => padAddress(game.token) === token
        );

        return Array.from({ length: tokensToClaim }, () => {
          // Get the current index for this token, or start at 0
          const currentIndex = tokenIndexMap.get(token) || 0;

          // Find the next available free game
          const freeGame = tokenFreeGames[currentIndex];

          // Update the index for next time
          tokenIndexMap.set(token, currentIndex + 1);

          return {
            contractAddress: gameAddress,
            entrypoint: "enter_launch_tournament_with_signature",
            calldata: [
              COLLECTION_WEAPON_MAP[
                getKeyByValue(COLLECTION_TOKENS_MAP, token)
              ],
              stringToFelt(`${alt} #${freeGame?.tokenId}`).toString(),
              "0",
              "1",
              indexAddress(token),
              freeGame?.tokenId.toString(),
              delegateAddress,
              account.address,
              signature,
            ],
          };
        });
      }
    );

    // Add this check
    if (calls.length === 0) {
      console.log("No calls to execute. Skipping transaction.");
      setClaiming(false);
      setSignature(null);
      return; // Exit the function early
    }

    const batchSize = 20;
    let lastTxHash: string | undefined;

    for (let i = 0; i < calls.length; i += batchSize) {
      const batch = calls.slice(i, i + batchSize);

      const tx = await account.execute(batch).catch((e) => console.error(e));
      lastTxHash = (tx as any)?.transaction_hash;

      if (i + batchSize < calls.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 1 second delay
      }
    }

    setPreparingClaim(false);
    setClaiming(true);

    const receipt = await provider?.waitForTransaction(lastTxHash);

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

    const batchSize = 20;
    let lastTxHash: string | undefined;

    for (let i = 0; i < unrevealedGames.length; i += batchSize) {
      const batch = unrevealedGames.slice(i, i + batchSize);
      const calls = batch.map((game) => ({
        contractAddress: gameAddress,
        entrypoint: "attack", // slaying the first beast acts as the prompt to reveal stats
        calldata: [game.adventurerId.toString(), "1"],
      }));

      const tx = await account.execute(calls).catch((e) => console.error(e));
      lastTxHash = (tx as any)?.transaction_hash;

      if (i + batchSize < unrevealedGames.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    if (lastTxHash) {
      await provider?.waitForTransaction(lastTxHash);
    }
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
