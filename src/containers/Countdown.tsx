import { useState, useEffect } from "react";

const Countdown = () => {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const messages = [
    "Sharpening pixelated swords...",
    "Brewing potions of impatience...",
    "Waking up sleepy dragons...",
    "Polishing lucky dice...",
    "Dusting off ancient spell books...",
    "Tuning magical instruments...",
    "Feeding hungry treasure chests...",
    "Inflating health potions...",
    "Rehearsing NPC dialogue...",
    "Calibrating difficulty sliders...",
    "Hiding secret passages...",
    "Planting legendary loot...",
    "Summoning RNG spirits...",
    "Buffing hero armor to a shine...",
    "Preparing epic plot twists...",
    "Generating witty one-liners...",
    "Unleashing mischievous minions...",
    "Crafting cryptic riddles...",
    "Warming up boss battle music...",
    "Sharpening critical hit calculations...",
  ];

  // Set your target date here
  const targetDate = Date.UTC(2024, 8, 4, 19, 10, 41);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
        // Handle countdown finished
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setLoadingMessage(messages[randomIndex]);
  }, []);

  return (
    <div className="absolute flex flex-col items-center justify-between inset-0 z-50 w-full h-full gap-20 p-20 bg-black/50 bg-[url('/scenes/opening.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <h1 className="text-6xl uppercase">Claiming Opens</h1>
      <div className="text-8xl mb-8 text-terminal-yellow text-center uppercase">
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
      <h2 className="text-4xl uppercase">{loadingMessage}</h2>
    </div>
  );
};

export default Countdown;
