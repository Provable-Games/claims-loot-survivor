import { useEffect } from "react";
import Head from "./head";
import Claim from "./containers/Claim";
import Claimed from "./containers/Claimed";
import Claiming from "./containers/Claiming";
import { useUIStore } from "./hooks/useUIStore";
import { networkConfig } from "./lib/networkConfig";
import { fetchAdventurerMetadata } from "./api/fetchMetadata";
import { Network } from "./lib/types";

const App = () => {
  const { claimed, claiming, setAdventurersMetadata, setClaiming, setClaimed } =
    useUIStore();

  const adventurers = [99, 100, 101, 102, 103, 106];
  const network: Network = import.meta.env.VITE_NETWORK;

  useEffect(() => {
    if (claiming) {
      const fetchImages = async () => {
        const adventurersMetadata = await Promise.all(
          adventurers.map((adventurer) =>
            fetchAdventurerMetadata(
              networkConfig[network!].gameAddress,
              adventurer,
              networkConfig[network!].rpcUrl
            )
          )
        );
        setAdventurersMetadata(adventurersMetadata);
        setClaiming(false);
        setClaimed(true);
      };
      fetchImages();
    }
  }, [claiming]);

  return (
    <html lang="en">
      <Head />
      <body
        suppressHydrationWarning={false}
        className="fixed min-h-screen w-full overflow-hidden text-terminal-green bg-conic-to-br to-terminal-black from-terminal-black bezel-container"
      >
        <img
          src="/crt_green_mask.png"
          alt="crt green mask"
          className="absolute w-full pointer-events-none crt-frame hidden sm:block"
        />
        {claimed ? <Claimed /> : <Claim />}
        {claiming && <Claiming />}
      </body>
    </html>
  );
};

export default App;
