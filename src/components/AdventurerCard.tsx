import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import useSyscalls from "../hooks/useSyscalls";
import { networkConfig } from "../lib/networkConfig";
import { Network } from "../lib/types";
import { fetchAdventurerMetadata } from "../api/fetchMetadata";
import { statsRevealed, colorMap } from "../lib/utils";
import { useUIStore } from "../hooks/useUIStore";

export interface AdventurerCardProps {
  meta: any;
  adventurerId: number;
}

const AdventurerCard = ({ meta, adventurerId }: AdventurerCardProps) => {
  const [isRevealing, setIsRevealing] = useState(false);

  const { setAdventurersMetadata, freeGamesData, setFreeGamesData } =
    useUIStore();

  const [revealedStats, setRevealedStats] = useState({
    str: "?",
    dex: "?",
    int: "?",
    vit: "?",
    wis: "?",
    cha: "?",
  });
  const { executeReveal } = useSyscalls();
  const network: Network = import.meta.env.VITE_NETWORK;
  const gameAddress = networkConfig[network!].gameAddress;

  const updateFreeGamesData = useCallback(() => {
    setFreeGamesData((prevFreeGamesData) =>
      prevFreeGamesData.map((game) =>
        game.adventurerId === adventurerId ? { ...game, revealed: true } : game
      )
    );
  }, [adventurerId, freeGamesData]);

  const revealStats = async () => {
    setIsRevealing(true);
    const stats = ["str", "dex", "int", "vit", "wis", "cha"];

    // Animate random numbers
    const animationInterval = setInterval(() => {
      const randomStats = Object.fromEntries(
        stats.map((stat) => [stat, Math.floor(Math.random() * 10).toString()])
      );
      setRevealedStats(randomStats as typeof revealedStats);
    }, 100);

    await executeReveal(gameAddress, adventurerId);

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
          wis: metadata.attributes.find((attr: any) => attr.trait === "Wisdom")
            .value,
          cha: metadata.attributes.find(
            (attr: any) => attr.trait === "Charisma"
          ).value,
        });
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
        updateFreeGamesData();
        setIsRevealing(false);
      } else {
        // Stats are not revealed yet, try again in 4 seconds
        setTimeout(fetchMetadataRecursive, 4000);
      }
    };

    // Start the recursive fetching
    fetchMetadataRecursive();
  };

  useEffect(() => {
    if (statsRevealed(meta)) {
      setRevealedStats({
        str: meta.attributes.find((attr: any) => attr.trait === "Strength")
          .value,
        dex: meta.attributes.find((attr: any) => attr.trait === "Dexterity")
          .value,
        int: meta.attributes.find((attr: any) => attr.trait === "Intelligence")
          .value,
        vit: meta.attributes.find((attr: any) => attr.trait === "Vitality")
          .value,
        wis: meta.attributes.find((attr: any) => attr.trait === "Wisdom").value,
        cha: meta.attributes.find((attr: any) => attr.trait === "Charisma")
          .value,
      });
    }
  }, []);

  return (
    <div
      className={`relative flex flex-col bg-black border border-terminal-green border-5 sm:w-[200px] 2xl:w-[275px] 3xl:w-[350px]`}
    >
      {(Object.values(revealedStats).every((stat) => stat === "?") ||
        isRevealing) && (
        <>
          <span
            className={`absolute bg-terminal-black opacity-50 inset-0 w-full h-full`}
          />
          {isRevealing ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse text-2xl uppercase">
              Revealing
            </div>
          ) : (
            <Button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-terminal-green bg-terminal-black animate-pulse"
              onClick={() => revealStats()}
              variant={"outline"}
            >
              Click to Reveal
            </Button>
          )}
        </>
      )}
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
            } w-full flex flex-col text-center`}
          >
            <p>{stat.toUpperCase()}</p>
            <p>{revealedStats[stat as keyof typeof revealedStats]}</p>
          </span>
        ))}
      </div>
      <img
        key={meta.name}
        src={meta.image}
        alt={meta.name}
        className="w-full"
      />
    </div>
  );
};

export default AdventurerCard;
