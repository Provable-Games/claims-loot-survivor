import { useState } from "react";
import { Button } from "./Button";

export interface AdventurerCardProps {
  meta: any;
}

const AdventurerCard = ({ meta }: AdventurerCardProps) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedStats, setRevealedStats] = useState({
    str: "?",
    dex: "?",
    int: "?",
    vit: "?",
    wis: "?",
    cha: "?",
  });

  const statValues: Record<string, string> = {
    str: meta.attributes.find((attr: any) => attr.trait === "Strength").value,
    dex: meta.attributes.find((attr: any) => attr.trait === "Dexterity").value,
    int: meta.attributes.find((attr: any) => attr.trait === "Intelligence")
      .value,
    vit: meta.attributes.find((attr: any) => attr.trait === "Vitality").value,
    wis: meta.attributes.find((attr: any) => attr.trait === "Wisdom").value,
    cha: meta.attributes.find((attr: any) => attr.trait === "Charisma").value,
  };

  const revealStats = () => {
    setIsRevealing(true);
    const stats = ["str", "dex", "int", "vit", "wis", "cha"];

    // Animate random numbers
    const animationInterval = setInterval(() => {
      const randomStats = Object.fromEntries(
        stats.map((stat) => [stat, Math.floor(Math.random() * 10).toString()])
      );
      setRevealedStats(randomStats as typeof revealedStats);
    }, 100);

    // Set final values after 1 second
    setTimeout(() => {
      clearInterval(animationInterval);
      setRevealedStats(statValues as typeof revealedStats);
      setIsRevealing(false);
    }, 4000);
  };

  const colorMap = (stat: number) => {
    if (isRevealing) return "";
    if (stat <= 0) return "bg-red-900";
    if (stat <= 2) return "bg-terminal-yellow-50";
    if (stat <= 4) return "bg-terminal-green-50";
    if (stat <= 9) return "bg-terminal-green text-terminal-black";
    return "bg-terminal-green text-terminal-black";
  };

  return (
    <div
      className={`relative flex flex-col bg-black border border-terminal-green border-5`}
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
                    parseInt(revealedStats[stat as keyof typeof revealedStats])
                  )
            } w-12 flex flex-col text-center`}
          >
            <p>{stat.toUpperCase()}</p>
            <p>{revealedStats[stat as keyof typeof revealedStats]}</p>
          </span>
        ))}
      </div>
      <img key={meta.name} src={meta.image} alt={meta.name} className="w-72" />
    </div>
  );
};

export default AdventurerCard;
