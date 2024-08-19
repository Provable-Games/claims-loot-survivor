import SpriteAnimation from "./SpriteAnimation";

export default function TokenLoader() {
  return (
    <div className="flex items-center justify-center w-full sm:w-1/2 h-3/4 sm:h-full">
      <SpriteAnimation
        frameWidth={400}
        frameHeight={400}
        columns={8}
        rows={1}
        frameRate={5}
        className="coin-sprite"
      />
    </div>
  );
}
