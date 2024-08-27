import { useCallback, useEffect } from "react";
import Claim from "./containers/Claim";
import Claimed from "./containers/Claimed";
import Claiming from "./containers/Claiming";
import PreparingClaim from "./containers/PreparingClaim";
import { useUIStore } from "./hooks/useUIStore";
import { networkConfig } from "./lib/networkConfig";
import { fetchAdventurerMetadata } from "./api/fetchMetadata";
import { Network } from "./lib/types";
import { useQuery } from "@apollo/client";
import { getTokensByOwner } from ".//hooks/graphql/queries";
import { useAccount } from "@starknet-react/core";

const App = () => {
  const {
    claimed,
    claiming,
    setAdventurersMetadata,
    setClaiming,
    setClaimed,
    claimedData,
    setClaimedData,
    preparingClaim,
  } = useUIStore();

  const { address } = useAccount();

  const network: Network = import.meta.env.VITE_NETWORK;

  const unclaimedGamesCount = claimedData.filter(
    (token: any) => !token.freeGameUsed
  ).length;

  useEffect(() => {
    if (claimedData.length > 0 && unclaimedGamesCount === 0) {
      const fetchImages = async () => {
        const adventurersMetadata = await Promise.all(
          claimedData.map((claimed) =>
            fetchAdventurerMetadata(
              networkConfig[network!].gameAddress,
              claimed.adventurerId,
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
  }, [claimedData]);

  const tokenByOwnerVariables = {
    ownerAddress: address ? address : "0x0",
  };

  const { refetch } = useQuery(getTokensByOwner, {
    variables: tokenByOwnerVariables,
    skip: !address,
    fetchPolicy: "network-only",
  });

  const fetchData = useCallback(async () => {
    const data: any = await refetch({
      ownerAddress: address ? address : "0x0",
    });
    const tokensData = data ? data.data.tokensWithFreeGameStatus : [];
    setClaimedData(tokensData);
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address]);

  return (
    <div className="fixed min-h-screen w-full overflow-hidden text-terminal-green bg-conic-to-br to-terminal-black from-terminal-black bezel-container">
      <img
        src="/crt_green_mask.png"
        alt="crt green mask"
        className="absolute w-full pointer-events-none crt-frame hidden sm:block"
      />
      {claimed ? <Claimed /> : <Claim />}
      {preparingClaim && <PreparingClaim />}
      {claiming && <Claiming />}
    </div>
  );
};

export default App;
