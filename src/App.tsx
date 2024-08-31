import { useEffect } from "react";
import Claim from "./containers/Claim";
import Claimed from "./containers/Claimed";
import Claiming from "./containers/Claiming";
import PreparingClaim from "./containers/Preparing";
import { useUIStore } from "./hooks/useUIStore";
import { networkConfig } from "./lib/networkConfig";
import { fetchAdventurerMetadata } from "./api/fetchMetadata";
import { Network } from "./lib/types";
import { useConnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";

const App = () => {
  const {
    claimed,
    claiming,
    setAdventurersMetadata,
    setClaiming,
    setClaimed,
    claimedData,
    preparingClaim,
    preparingReveal,
    setUsername,
    fetchingMetadata,
    setFetchingMetadata,
    freeGamesData,
    setSkipGameFetch,
  } = useUIStore();

  const { connector } = useConnect();

  const network: Network = import.meta.env.VITE_NETWORK;

  useEffect(() => {
    if (
      freeGamesData.length > 0 &&
      fetchingMetadata &&
      connector?.id.includes("cartridge")
    ) {
      const fetchImages = async () => {
        const adventurersMetadata = await Promise.all(
          freeGamesData.map((claimed) =>
            fetchAdventurerMetadata(
              networkConfig[network!].gameAddress,
              claimed.adventurerId,
              networkConfig[network!].rpcUrl
            )
          )
        );
        setAdventurersMetadata(adventurersMetadata);
        setClaiming(false);
        setFetchingMetadata(false);
        setSkipGameFetch(true);
        setClaimed(true);
      };
      fetchImages();
    }
  }, [claimedData, fetchingMetadata, connector]);

  useEffect(() => {
    if (connector?.id.includes("cartridge")) {
      const init = async () => {
        const username = await (
          connector as unknown as CartridgeConnector
        ).username();
        setUsername(username || "");
      };
      init();
    }
  }, [connector]);

  return (
    <div className="fixed min-h-screen w-full overflow-hidden text-terminal-green bg-conic-to-br to-terminal-black from-terminal-black bezel-container">
      <img
        src="/crt_green_mask.png"
        alt="crt green mask"
        className="absolute w-full pointer-events-none crt-frame hidden sm:block"
      />
      {claimed ? <Claimed /> : <Claim />}
      {preparingClaim && <PreparingClaim type="claim" />}
      {preparingReveal && <PreparingClaim type="reveal" />}
      {claiming && <Claiming />}
    </div>
  );
};

export default App;
