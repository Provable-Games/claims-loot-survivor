import { useEffect, useState } from "react";
import { colorMap } from "../../lib/utils";

interface RevealCardProps {
  adventurerMetadata: any;
  isActive: boolean;
  interval?: number;
}

const RevealCard = ({
  adventurerMetadata,
  isActive,
  interval = 2000,
}: RevealCardProps) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedStats, setRevealedStats] = useState({
    str: "?",
    dex: "?",
    int: "?",
    vit: "?",
    wis: "?",
    cha: "?",
  });

  useEffect(() => {
    if (isActive) {
      setIsRevealing(true);
      setRevealedStats({
        str: "?",
        dex: "?",
        int: "?",
        vit: "?",
        wis: "?",
        cha: "?",
      });

      const stats = ["str", "dex", "int", "vit", "wis", "cha"];

      // Animate random numbers
      const animationInterval = setInterval(() => {
        const randomStats = Object.fromEntries(
          stats.map((stat) => [stat, Math.floor(Math.random() * 10).toString()])
        );
        setRevealedStats(randomStats as typeof revealedStats);
      }, 100);

      // Set final stats and clear interval after 2 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(animationInterval);

        setRevealedStats({
          str: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Strength"
          ).value,
          dex: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Dexterity"
          ).value,
          int: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Intelligence"
          ).value,
          vit: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Vitality"
          ).value,
          wis: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Wisdom"
          ).value,
          cha: adventurerMetadata.attributes.find(
            (attr: any) => attr.trait === "Charisma"
          ).value,
        });

        setIsRevealing(false);
      }, interval);

      // Cleanup function
      return () => {
        clearInterval(animationInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [isActive, adventurerMetadata, interval]);

  return (
    <div className="relative flex flex-col bg-black border border-terminal-green border-5 h-full w-full">
      <div
        className={`flex flex-row ${isRevealing ? "animate-pulseFast" : ""}`}
      >
        {["str", "dex", "int", "vit", "wis", "cha"].map((stat) => (
          <span
            key={stat}
            className={`${
              revealedStats[stat as keyof typeof revealedStats] === "?"
                ? "bg-terminal-black"
                : colorMap(
                    parseInt(revealedStats[stat as keyof typeof revealedStats]),
                    isRevealing
                  )
            } w-12 flex flex-col text-center`}
          >
            <p>{stat.toUpperCase()}</p>
            <p>{revealedStats[stat as keyof typeof revealedStats]}</p>
          </span>
        ))}
      </div>
      <div className="relative w-72 h-96">
        <img
          key={adventurerMetadata.name}
          src={adventurerMetadata.image}
          alt={adventurerMetadata.name}
        />
      </div>
    </div>
  );
};

export default RevealCard;
