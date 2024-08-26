import { useState } from "react";
import { Button } from "../components/Button";
import { ChevronIcon, EyeIcon } from "../components/Icons";
import Confetti from "../components/animations/Confetti";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import AdventurerCard from "../components/AdventurerCard";
import { useUIStore } from "../hooks/useUIStore";
import useSyscalls from "../hooks/useSyscalls";
import { Network } from "../lib/types";
import { networkConfig } from "../lib/networkConfig";
// import { useAccount } from "@starknet-react/core";
import { statsRevealed } from "../lib/utils";

const Claimed = () => {
  // const { address } = useAccount();
  const { adventurersMetadata, claimedData } = useUIStore();
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [hideRevealed, setHideRevealed] = useState(false);
  const filteredAdventurers = hideRevealed
    ? adventurersMetadata.filter((meta) => !statsRevealed(meta))
    : adventurersMetadata;
  const filteredClaimedData = hideRevealed
    ? claimedData.filter(
        (_, index) => !statsRevealed(adventurersMetadata[index])
      )
    : claimedData;
  const totalPages = Math.ceil(filteredAdventurers.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAdventurers = filteredAdventurers.slice(startIndex, endIndex);
  const currentClaimedData = filteredClaimedData.slice(startIndex, endIndex);
  const finalPage = currentPage === totalPages - 1;

  const network: Network = import.meta.env.VITE_NETWORK;
  const gameAddress = networkConfig[network!].gameAddress;

  const { play: clickPlay } = useUiSounds(soundSelector.click);

  const handleClick = (newPage: number): void => {
    clickPlay();
    setCurrentPage(newPage);
  };

  const { executeRevealAll } = useSyscalls();

  const unrevealedGames = claimedData.filter(
    (token: any) => !token.freeGameRevealed
  );

  const revealedGamesCount = claimedData.filter(
    (token: any) => token.freeGameRevealed
  ).length;

  // const adventurers = claimedTokensData.tokensWithFreeGameStatus;
  console.log(adventurersMetadata);
  console.log(claimedData);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 bg-[url('/scenes/fountain.png')] bg-cover bg-center bg-no-repeat">
      <Confetti />
      <div className="relative flex flex-col items-center gap-8">
        <h1 className="m-0 uppercase text-4xl sm:text-6xl text-center">
          Claimed Free Games
        </h1>
        <span className="absolute top-[60px] text-terminal-green text-xl">
          ({revealedGamesCount}/{claimedData.length} REVEALED)
        </span>
        <div className="flex flex-row items-center gap-2">
          <Button
            size="lg"
            variant="token"
            onClick={() => executeRevealAll(gameAddress, unrevealedGames)}
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
            onClick={() => setHideRevealed(!hideRevealed)}
          >
            <span className="absolute top-1 text-xs w-6">
              <EyeIcon />
            </span>
            {hideRevealed ? "Show Revealed" : "Hide Revealed"}
          </Button>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        {currentPage > 0 && (
          <span
            className="absolute top-1/2 left-10 w-20 rotate-180 cursor-pointer"
            onClick={() => handleClick(currentPage - 1)}
          >
            <ChevronIcon />
          </span>
        )}
        {currentAdventurers.map((meta: any, index: any) => (
          <AdventurerCard
            meta={meta}
            adventurerId={currentClaimedData[index].adventurerId}
            key={currentClaimedData[index].adventurerId}
          />
        ))}
        {!finalPage && (
          <span
            className="absolute top-1/2 right-10 w-20 cursor-pointer"
            onClick={() => handleClick(currentPage + 1)}
          >
            <ChevronIcon />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          variant="outline"
          className="bg-terminal-black border border-terminal-green"
        >
          Share to Twitter
        </Button>
        <Button size="lg">Play</Button>
      </div>
    </div>
  );
};

export default Claimed;
