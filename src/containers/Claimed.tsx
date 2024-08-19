import { useState } from "react";
import { Button } from "../components/Button";
import { ChevronIcon } from "../components/Icons";
import Confetti from "../components/animations/Confetti";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import AdventurerCard from "../components/AdventurerCard";
import { useUIStore } from "../hooks/useUIStore";

const Claimed = () => {
  const { adventurersMetadata } = useUIStore();
  const adventurers = [99, 100, 101, 102, 103, 106];
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(adventurers.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAdventurers = adventurersMetadata.slice(startIndex, endIndex);
  const finalPage = currentPage === totalPages - 1;

  const { play: clickPlay } = useUiSounds(soundSelector.click);

  const handleClick = (newPage: number): void => {
    clickPlay();
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 2xl:p-20 bg-[url('/scenes/fountain.png')] bg-cover bg-center bg-no-repeat">
      <Confetti />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 uppercase text-4xl sm:text-6xl text-center">
          Claimed Free Games
        </h1>
        <h2 className="text-2xl sm:text-4xl text-center">20 Claimed</h2>
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
          <AdventurerCard meta={meta} key={index} />
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
