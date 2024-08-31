import { useState, useEffect } from "react";
import RevealCard from "./RevealCard";
import { useUIStore } from "../../hooks/useUIStore";
import { Button } from "../Button";

interface RevealAllProps {
  adventurersMetadata: any[];
  interval?: number;
}

const RevealAll = ({
  adventurersMetadata,
  interval = 3000,
}: RevealAllProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setIsRevealingAll } = useUIStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const advanceIndex = () => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= adventurersMetadata.length) {
          // We've reached the end, clear the interval
          clearInterval(timer);
          setIsRevealingAll(false); // Update UI state
          return prevIndex; // Keep the last index
        }
        return nextIndex;
      });
    };

    timer = setInterval(advanceIndex, interval);

    return () => {
      clearInterval(timer);
    };
  }, [interval, adventurersMetadata.length, setIsRevealingAll]);

  return (
    <div className="absolute inset-0 w-full min-h-screen z-20">
      <Button
        className="absolute top-1/2 right-40 transform -translate-y-1/2"
        onClick={() => setIsRevealingAll(false)}
        size="xl"
      >
        Skip
      </Button>
      {adventurersMetadata.map((adventurer, index) => (
        <div
          key={adventurer.name}
          className={`
            absolute left-1/2 top-1/2
            transform -translate-x-1/2 -translate-y-1/2
            transition-all duration-500 ease-in-out
            ${
              index === currentIndex
                ? "z-10 animate-cardToFront"
                : "z-0 animate-cardToBack"
            }`}
        >
          <RevealCard
            adventurerMetadata={adventurer}
            isActive={index === currentIndex}
            interval={2000}
          />
        </div>
      ))}
    </div>
  );
};

export default RevealAll;
