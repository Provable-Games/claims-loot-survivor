import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "../components/Button";
import { ChevronIcon, EyeIcon } from "../components/Icons";
import Confetti from "../components/animations/Confetti";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import AdventurerCard from "../components/AdventurerCard";
import { useUIStore } from "../hooks/useUIStore";
import useSyscalls from "../hooks/useSyscalls";
import { Network } from "../lib/types";
import { networkConfig } from "../lib/networkConfig";
import { useAccount, useDisconnect } from "@starknet-react/core";
import RevealAll from "../components/animations/RevealAll";
import TwitterShareButton from "../components/TwitterShareButton";
import { useQuery } from "@apollo/client";
import { getGamesByGameOwner } from "../hooks/graphql/queries";
import { fetchAdventurerMetadata } from "../api/fetchMetadata";
import TokenLoader from "../components/animations/TokenLoader";

const Claimed = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    adventurersMetadata,
    username,
    isRevealingAll,
    setIsRevealingAll,
    setPreparingReveal,
    setClaimed,
    freeGamesData,
    setFreeGamesData,
    setAdventurersMetadata,
    setAlreadyClaimed,
    revealedAllMetadata,
    setRevealedAllMetadata,
  } = useUIStore();
  // const [adventurersMetadata, setAdventurersMetadata] = useState([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [hideRevealed, setHideRevealed] = useState(false);
  const sortedFreeGamesData = useMemo(() => {
    return [...freeGamesData].sort((a, b) => {
      // Convert adventurerId to numbers for comparison
      const aId = parseInt(a.adventurerId, 10);
      const bId = parseInt(b.adventurerId, 10);
      return aId - bId;
    });
  }, [freeGamesData]);

  const filteredFreeGamesData = useMemo(() => {
    return hideRevealed
      ? sortedFreeGamesData.filter((game) => !game.revealed)
      : sortedFreeGamesData;
  }, [hideRevealed, sortedFreeGamesData]);

  const totalPages = Math.ceil(filteredFreeGamesData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFreeGamesData = filteredFreeGamesData.slice(
    startIndex,
    endIndex
  );

  const finalPage = currentPage === totalPages - 1 || totalPages === 0;

  const network: Network = import.meta.env.VITE_NETWORK;
  const gameAddress = networkConfig[network!].gameAddress;

  const { play: clickPlay } = useUiSounds(soundSelector.click);

  const handleClick = (newPage: number): void => {
    clickPlay();
    setCurrentPage(newPage);
  };

  const { executeRevealAll } = useSyscalls();

  const unrevealedGames = useMemo(
    () => sortedFreeGamesData.filter((token: any) => !token.revealed),
    [sortedFreeGamesData]
  );

  const unrevealedGamesWithMetadata = useMemo(() => {
    return unrevealedGames
      .map((game) => {
        const metadata = adventurersMetadata.find(
          (meta) => meta.name.split("#")[1] === game.adventurerId.toString()
        );
        return { ...game, metadata };
      })
      .filter((game) => game.metadata); // Only include games with metadata
  }, [unrevealedGames, adventurersMetadata]);

  const revealedGamesCount = sortedFreeGamesData.filter(
    (token: any) => token.revealed
  ).length;

  const tokenByOwnerVariables = {
    ownerAddress: address ? address : "0x0",
  };

  const { refetch } = useQuery(getGamesByGameOwner, {
    variables: tokenByOwnerVariables,
    skip: !address,
    fetchPolicy: "network-only",
  });

  const fetchData = useCallback(async () => {
    const data: any = await refetch({
      ownerAddress: address ? address : "0x0",
    });
    const tokensData = data ? data.data.claimedFreeGames : [];
    setFreeGamesData(tokensData);
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address]);

  const fetchPagedImages = useCallback(
    async (games: any[]) => {
      setIsFetchingMetadata(true);

      const newAdventurersMetadata = await Promise.all(
        games.map(async (freeGame) => {
          const existingMeta = adventurersMetadata.find(
            (meta) =>
              meta.name.split("#")[1] === freeGame.adventurerId.toString()
          );
          if (existingMeta) return existingMeta;
          return fetchAdventurerMetadata(
            networkConfig[network!].gameAddress,
            freeGame.adventurerId,
            networkConfig[network!].rpcUrl
          );
        })
      );

      let updatedMetadata = [...adventurersMetadata];
      newAdventurersMetadata.forEach((metadata) => {
        if (!metadata) return; // Skip if metadata fetch failed
        const index = updatedMetadata.findIndex(
          (meta) => meta.name.split("#")[1] === metadata.name.split("#")[1]
        );
        if (index !== -1) {
          updatedMetadata[index] = metadata;
        } else {
          updatedMetadata.push(metadata);
        }
      });
      setAdventurersMetadata(updatedMetadata);

      setIsFetchingMetadata(false);
    },
    [network, adventurersMetadata]
  );

  const currentAdventurers = useMemo(() => {
    return currentFreeGamesData
      .map((game) => {
        const adventurerId = game.adventurerId.toString();
        const meta = adventurersMetadata.find((meta) => {
          const metaId = meta.name.split("#")[1];
          return metaId === adventurerId;
        });
        return meta ? { ...meta, adventurerId: game.adventurerId } : null;
      })
      .filter(Boolean);
  }, [currentFreeGamesData, adventurersMetadata]);

  const handleHideRevealed = () => {
    setHideRevealed((prev) => !prev);
    setCurrentPage(0);
  };

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [hideRevealed, totalPages, currentPage]);

  useEffect(() => {
    const missingMetadata = currentFreeGamesData.filter(
      (game) =>
        !adventurersMetadata.some(
          (meta) => meta.name.split("#")[1] === game.adventurerId.toString()
        )
    );

    if (missingMetadata.length > 0 && !isFetchingMetadata) {
      fetchPagedImages(missingMetadata);
    }
  }, [
    currentFreeGamesData,
    adventurersMetadata,
    fetchPagedImages,
    isFetchingMetadata,
  ]);

  const handleRevealAll = useCallback(async () => {
    clickPlay();
    try {
      setPreparingReveal(true);
      await executeRevealAll(gameAddress, unrevealedGames);
      setPreparingReveal(false);
      setIsRevealingAll(true);
    } catch (e) {
      console.log(e);
    }
  }, [clickPlay, executeRevealAll, gameAddress, unrevealedGames]);

  console.log(revealedAllMetadata);

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 ${
        freeGamesData.length > 0
          ? "bg-[url('/scenes/fountain.png')]"
          : "bg-[url('/scenes/cave.png')]"
      } bg-cover bg-center bg-no-repeat`}
    >
      {freeGamesData.length > 0 && <Confetti />}
      <span className="absolute flex flex-row items-center gap-2 top-20 right-32">
        <p className="text-2xl uppercase">{username}</p>
        <Button
          size={"xs"}
          disabled={address === undefined}
          onClick={() => {
            disconnect();
            clickPlay();
            setClaimed(false);
            setAlreadyClaimed(false);
          }}
          className="h-8"
        >
          Disconnect
        </Button>
      </span>
      {freeGamesData.length > 0 ? (
        <>
          <div className="relative flex flex-col items-center gap-8">
            <h1 className="m-0 uppercase text-4xl sm:text-6xl text-center">
              Claimed Free Games
            </h1>
            <span className="absolute top-[60px] text-terminal-green text-xl">
              ({revealedGamesCount}/{sortedFreeGamesData.length} REVEALED)
            </span>
            <div className="flex flex-row items-center gap-2">
              <Button
                size="lg"
                variant={unrevealedGames.length === 0 ? "outline" : "token"}
                onClick={async () => {
                  handleRevealAll();
                }}
                disabled={isRevealingAll || unrevealedGames.length === 0}
              >
                Reveal All
              </Button>
              <Button
                size="lg"
                variant="contrast"
                className={`relative flex items-end ${
                  hideRevealed
                    ? "bg-terminal-green text-terminal-black hover:bg-terminal-green"
                    : ""
                }`}
                onClick={handleHideRevealed}
              >
                <span className="absolute top-1 text-xs w-6">
                  <EyeIcon />
                </span>
                {hideRevealed ? "Show Revealed" : "Hide Revealed"}
              </Button>
            </div>
          </div>
          {!isRevealingAll ? (
            !isFetchingMetadata ? (
              <div className="flex flex-row gap-2">
                {currentPage > 0 && (
                  <span
                    className="absolute top-1/2 left-10 w-20 rotate-180 cursor-pointer"
                    onClick={() => handleClick(currentPage - 1)}
                  >
                    <ChevronIcon />
                  </span>
                )}
                {currentAdventurers.length > 0 ? (
                  currentAdventurers.map((meta: any, index: any) => (
                    <AdventurerCard
                      meta={meta}
                      adventurerId={currentFreeGamesData[index].adventurerId}
                      key={currentFreeGamesData[index].adventurerId}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center bg-terminal-black border border-terminal-green p-10">
                    <p className="text-4xl uppercase">It's Quiet Here...</p>
                  </div>
                )}
                {!finalPage && (
                  <span
                    className="absolute top-1/2 right-10 w-20 cursor-pointer"
                    onClick={() => handleClick(currentPage + 1)}
                  >
                    <ChevronIcon />
                  </span>
                )}
              </div>
            ) : (
              <TokenLoader />
            )
          ) : (
            <RevealAll
              adventurersMetadata={unrevealedGamesWithMetadata}
              interval={3000}
            />
          )}
          <div className="flex flex-col gap-2">
            <TwitterShareButton
              text={`🚀 Just claimed 10 FREE adventurers! 🎮🔥\n\nLoot Survivor is running an epic tournament with FREE gas & VRF for a whole week! 😱\n\nPlus, if you've got a qualifying NFT, you can score a full FREE game too! Don't miss out.\n\n@LootSurvivor #airdrop #Web3 #Starknet`}
            />
            <Button
              size="lg"
              onClick={() => {
                clickPlay();
                window.open(
                  "https://lootsurvivor.io/",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Play
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen w-full">
          <div className="flex flex-col items-center justify-center gap-10 bg-terminal-black border border-terminal-green p-10">
            <h1 className="m-0 uppercase text-4xl sm:text-6xl text-center">
              No Games Claimed
            </h1>
            <div className="flex flex-col gap-5">
              <span className="flex flex-row justify-between">
                <p className="text-2xl">
                  You haven't claimed any free games yet.
                </p>
                <Button
                  onClick={() => {
                    disconnect();
                    clickPlay();
                    setClaimed(false);
                    setAlreadyClaimed(false);
                  }}
                >
                  Click Here to Claim
                </Button>
              </span>
              <p className="text-2xl">
                No qualifying tokens? No problem. Click below to jump into the
                game.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                clickPlay();
                window.open(
                  "https://lootsurvivor.io/",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Play
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claimed;
