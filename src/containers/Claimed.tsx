import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "../components/Button";
import { CartridgeIcon, ChevronIcon, EyeIcon } from "../components/Icons";
import Confetti from "../components/animations/Confetti";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import AdventurerCard from "../components/AdventurerCard";
import { useUIStore } from "../hooks/useUIStore";
import useSyscalls from "../hooks/useSyscalls";
import { networkConfig } from "../lib/networkConfig";
import { useAccount, useDisconnect } from "@starknet-react/core";
import RevealAll from "../components/animations/RevealAll";
import TwitterShareButton from "../components/TwitterShareButton";
import { useQuery } from "@apollo/client";
import { getGamesByGameOwner } from "../hooks/graphql/queries";
import { fetchAdventurerMetadata } from "../api/fetchMetadata";
import TokenLoader from "../components/animations/TokenLoader";
import { statsRevealed } from "../lib/utils";

const Claimed = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    adventurersMetadata,
    username,
    isRevealingAll,
    setIsRevealingAll,
    setPreparingReveal,
    freeGamesData,
    setFreeGamesData,
    setAdventurersMetadata,
    skipGameFetch,
    resetAllState,
  } = useUIStore();
  const [unrevealedGamesWithMetadata, setUnrevealedGamesWithMetadata] =
    useState([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [hideRevealed, setHideRevealed] = useState(false);
  const sortedFreeGamesData = useMemo(() => {
    return [...freeGamesData].sort((a, b) => {
      // Convert adventurerId to numbers for comparison
      const aId = parseInt(a.adventurerId, 10);
      const bId = parseInt(b.adventurerId, 10);
      return bId - aId;
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

  const network = "mainnet";
  const gameAddress = networkConfig[network!].gameAddress;
  const appUrl = networkConfig[network!].appUrl;

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

  const fetchAllMetadata = useCallback(async () => {
    setIsFetchingMetadata(true);
    try {
      // First, check if the stats for the first unrevealed game have been revealed
      const checkStatsRevealed = async () => {
        if (unrevealedGames.length === 0) return;

        const firstGame = unrevealedGames[0];
        const metadata = await fetchAdventurerMetadata(
          networkConfig[network!].gameAddress,
          firstGame.adventurerId,
          networkConfig[network!].rpcUrl
        );

        if (!statsRevealed(metadata)) {
          // If stats are not revealed, wait and check again
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 3 seconds
          await checkStatsRevealed();
        }
      };

      await checkStatsRevealed();

      const chunkSize = 5;
      const delayBetweenChunks = 1000; // 1 second delay, adjust as needed

      for (let i = 0; i < unrevealedGames.length; i += chunkSize) {
        const gameChunk = unrevealedGames.slice(i, i + chunkSize);
        const chunkMetadata = await Promise.all(
          gameChunk.map((game) =>
            fetchAdventurerMetadata(
              networkConfig[network!].gameAddress,
              game.adventurerId,
              networkConfig[network!].rpcUrl
            )
          )
        );

        // Update metadata after each chunk
        chunkMetadata.forEach((metadata) => {
          if (!metadata) return; // Skip if metadata fetch failed
          setAdventurersMetadata((prevMetadata) => {
            const updatedMetadata = [...prevMetadata];
            const index = updatedMetadata.findIndex(
              (meta) => meta.name.split("#")[1] === metadata.name.split("#")[1]
            );
            if (index !== -1) {
              updatedMetadata[index] = metadata;
            } else {
              updatedMetadata.push(metadata);
            }
            return updatedMetadata;
          });
        });

        setUnrevealedGamesWithMetadata((prev) => [
          ...prev,
          ...chunkMetadata.filter(Boolean),
        ]);

        // Delay between chunks, but not after the last chunk
        if (i + chunkSize < unrevealedGames.length) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenChunks)
          );
        }
      }
      setFreeGamesData((prevFreeGamesData) =>
        prevFreeGamesData.map((game) => ({
          ...game,
          revealed: true,
        }))
      );
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setIsFetchingMetadata(false);
      setIsRevealingAll(false);
    }
  }, [
    unrevealedGames,
    network,
    setAdventurersMetadata,
    setFreeGamesData,
    setIsRevealingAll,
  ]);

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
    if (address && !skipGameFetch) {
      fetchData();
    }
  }, [address, skipGameFetch]);

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

      newAdventurersMetadata.forEach((metadata) => {
        if (!metadata) return; // Skip if metadata fetch failed
        setAdventurersMetadata((prevMetadata) => {
          const index = prevMetadata.findIndex(
            (meta) => meta.name.split("#")[1] === metadata.name.split("#")[1]
          );
          if (index !== -1) {
            return prevMetadata.map((meta, i) =>
              i === index ? metadata : meta
            );
          } else {
            return [...prevMetadata, metadata];
          }
        });
      });

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
      await fetchAllMetadata();
      setPreparingReveal(false);
      setIsRevealingAll(true);
    } catch (e) {
      console.log(e);
      setIsRevealingAll(false);
    }
  }, [clickPlay, executeRevealAll, gameAddress, unrevealedGames]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 ${
        freeGamesData.length > 0
          ? "bg-[url('/scenes/fountain.png')]"
          : "bg-[url('/scenes/cave.png')]"
      } bg-cover bg-center bg-no-repeat`}
    >
      {freeGamesData.length > 0 && <Confetti />}
      {isRevealingAll && (
        <span className="absolute top-0 left-0 w-full h-full bg-black/75 z-10" />
      )}
      <span className="absolute flex flex-row items-center gap-10 top-20 right-32">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            clickPlay();
            window.open(
              `${networkConfig[network!].blockExplorerUrl}contract/${address}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          <p className="text-2xl uppercase">{username}</p>
          <div className="absolute top-[-20px] right-[-20px] w-8 h-8 fill-current">
            <CartridgeIcon />
          </div>
        </div>
        <Button
          size={"xs"}
          disabled={address === undefined}
          onClick={() => {
            disconnect();
            clickPlay();
            resetAllState();
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
              text={`🚀 Just claimed ${freeGamesData.length} FREE adventurers! 🎮\n\nLoot Survivor is running an epic tournament with FREE gas & VRF for a whole week! 😱\n\nIf you've got a qualifying NFT, you can score a full FREE game too! Don't miss out.\n\n${appUrl}\n\n@LootSurvivor #airdrop #Web3 #Starknet`}
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
                    resetAllState();
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
