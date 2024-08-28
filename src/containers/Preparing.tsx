import { useState, useEffect } from "react";
import ClaimingLoader from "../components/animations/ClaimingLoader";

const Preparing = ({ type }: { type: "claim" | "reveal" }) => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const messages = [
    "Summoning your adventurer from the void",
    "Forging legendary gear",
    "Rolling for initiative",
    "Generating random dungeons",
    "Sharpening pixelated swords",
    "Consulting the RNG gods",
    "Unleashing chaos",
    "Preparing for epic ragequits",
    "WARNING: Loot Survivor has no chill",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setLoadingMessage(messages[randomIndex]);
  }, []);

  return (
    <div className="absolute flex flex-col items-center inset-0 bg-black z-50 w-full h-full gap-20 p-20 bg-black/25 bg-[url('/scenes/opening.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      {type === "claim" ? (
        <h1 className="text-6xl uppercase">Preparing Claim</h1>
      ) : (
        <h1 className="text-6xl uppercase">Revealing All</h1>
      )}
      <div className="flex flex-col">
        <h2 className="text-2xl loading-ellipsis uppercase">
          {loadingMessage}
        </h2>
        <ClaimingLoader loadingSeconds={15} />
      </div>
    </div>
  );
};

export default Preparing;
