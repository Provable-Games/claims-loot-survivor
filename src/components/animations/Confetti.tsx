import React, { useEffect } from "react";
import confetti from "canvas-confetti";

const Confetti: React.FC = () => {
  useEffect(() => {
    const duration = 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Create a custom shape for pixelated confetti
    const pixelShape = confetti.shapeFromPath({
      path: "M0 0 L1 0 L1 1 L0 1 Z",
      matrix: new DOMMatrix([1, 0, 0, 1, 0, 0]),
    });

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 50,
        spread: 360,
        origin: { y: 0.5 },
        colors: ["#00FF00"], // Bright green color
        shapes: [pixelShape],
        scalar: 1, // Increase size for more visible pixels
        drift: 0, // Remove drift for a more "digital" look
        gravity: 0.3, // Reduce gravity for slower fall
        ticks: 400, // Increase ticks for longer-lasting particles
        startVelocity: randomInRange(15, 30),
        decay: 0.95, // Slower decay for longer-lasting effect
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default Confetti;
