import { useCallback, useEffect, useState } from "react";
import { colorMap, statsRevealed } from "../../lib/utils";
import { fetchAdventurerMetadata } from "../../api/fetchMetadata";
import { networkConfig } from "../../lib/networkConfig";
import { Network } from "../../lib/types";
import { useUIStore } from "../../hooks/useUIStore";

interface RevealCardProps {
  adventurerMetadata: any;
  adventurerId: number;
  isActive: boolean;
  interval?: number;
}

const RevealCard = ({
  adventurerMetadata,
  adventurerId,
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
  const [revealedMetadata, setRevealedMetadata] = useState(null);
  const network: Network = import.meta.env.VITE_NETWORK;
  const gameAddress = networkConfig[network!].gameAddress;

  const cardMetadata = revealedMetadata ? revealedMetadata : adventurerMetadata;

  const updateFreeGamesData = useCallback(() => {
    setFreeGamesData(
      freeGamesData.map((game) =>
        game.adventurerId === adventurerId ? { ...game, revealed: true } : game
      )
    );
  }, [adventurerId]);

  const {
    adventurersMetadata,
    setAdventurersMetadata,
    freeGamesData,
    setFreeGamesData,
  } = useUIStore();

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

      const fetchMetadataRecursive = async () => {
        const metadata = await fetchAdventurerMetadata(
          gameAddress,
          adventurerId,
          networkConfig[network!].rpcUrl
        );

        if (statsRevealed(metadata)) {
          // Stats are revealed, update the UI
          clearInterval(animationInterval);
          setRevealedStats({
            str: metadata.attributes.find(
              (attr: any) => attr.trait === "Strength"
            ).value,
            dex: metadata.attributes.find(
              (attr: any) => attr.trait === "Dexterity"
            ).value,
            int: metadata.attributes.find(
              (attr: any) => attr.trait === "Intelligence"
            ).value,
            vit: metadata.attributes.find(
              (attr: any) => attr.trait === "Vitality"
            ).value,
            wis: metadata.attributes.find(
              (attr: any) => attr.trait === "Wisdom"
            ).value,
            cha: metadata.attributes.find(
              (attr: any) => attr.trait === "Charisma"
            ).value,
          });
          const index = adventurersMetadata.findIndex(
            (meta) => meta.name.split("#")[1] === metadata.name.split("#")[1]
          );
          setAdventurersMetadata(
            adventurersMetadata.map((meta, i) =>
              i === index ? metadata : meta
            )
          );
          setRevealedMetadata(metadata);
          updateFreeGamesData();
          setIsRevealing(false);
        } else {
          // Stats are not revealed yet, try again in 4 seconds
          setTimeout(fetchMetadataRecursive, 4000);
        }
      };

      fetchMetadataRecursive();
    }
  }, [isActive, adventurerId, interval]);

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
          key={cardMetadata?.name}
          src={cardMetadata?.image}
          alt={cardMetadata?.name}
        />
      </div>
    </div>
  );
};

export default RevealCard;
