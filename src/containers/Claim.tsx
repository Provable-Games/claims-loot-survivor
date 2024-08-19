import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { getWalletConnectors } from "../lib/connectors";
import { CartridgeIcon, CompleteIcon } from "../components/Icons";
import { COLLECTIONS_MAP } from "../lib/constants";
import { displayAddress } from "../lib/utils";
import useSyscalls from "../hooks/useSyscalls";
import { useUIStore } from "../hooks/useUIStore";
// import { networkConfig } from "../lib/networkConfig";
// import { Network } from "../lib/types";

const Claim = () => {
  const [delegateAccount, setDelegateAccount] = useState("");
  const { play: clickPlay } = useUiSounds(soundSelector.click);
  const { setClaiming } = useUIStore();

  const { connectors, connect, connector } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address } = useAccount();
  // const network: Network = import.meta.env.VITE_NETWORK;
  const { executeSetDelegate } = useSyscalls();

  const walletConnectors = getWalletConnectors(connectors);

  const unclaimedCollectionsByOwnerData = [
    {
      token: "0x1",
      tokenId: 1,
      claimed: false,
    },
    {
      token: "0x1",
      tokenId: 2,
      claimed: false,
    },
    {
      token: "0x2",
      tokenId: 1,
      claimed: false,
    },
    {
      token: "0x5",
      tokenId: 2,
      claimed: false,
    },
  ];

  const getCollectionFreeGames = (token: string) => {
    return unclaimedCollectionsByOwnerData.filter(
      (item) => item.token === token
    );
  };

  const renderCollection = (token: string, image: string, alt: string) => {
    const freeGames = getCollectionFreeGames(token);
    return (
      <div
        className="flex flex-col gap-2 items-center justify-center relative"
        key={token}
      >
        {address && (
          <>
            <span className="absolute w-full h-full bg-terminal-black opacity-70 z-10" />
            {freeGames.length > 0 && (
              <span className="absolute w-1/2 z-20">
                <CompleteIcon />
              </span>
            )}
          </>
        )}
        <span className="relative h-20 w-20 border border-terminal-green">
          <img src={image} alt={alt} className="w-full h-full" />
        </span>
        {address && freeGames.length > 0 && (
          <span className="w-full absolute top-24 flex flex-row bg-terminal-green text-terminal-black rounded-lg justify-center uppercase">
            {`${freeGames.length}
          Game${freeGames.length > 1 ? "s" : ""}
          `}
          </span>
        )}
      </div>
    );
  };

  const handleCartridgeOnboarding = () => {
    clickPlay();
    setDelegateAccount(address!);
    const cartridgeConnector = connectors.find(
      (connector) => connector.id === "cartridge"
    );
    if (cartridgeConnector) {
      connect({ connector: cartridgeConnector });
    }
  };

  useEffect(() => {
    if (connector?.id === "cartridge") {
      try {
        executeSetDelegate(delegateAccount);
        // executeClaim(networkConfig[network!].gameAddress, 1);
        setClaiming(true);
      } catch (error) {
        console.log(error);
      }
    }
  }, [delegateAccount, connector, account]);

  const collectionsData = [
    {
      token: COLLECTIONS_MAP["Duck"],
      alt: "Duck",
      image: "/Duck.png",
    },
    {
      token: COLLECTIONS_MAP["Blobert"],
      alt: "Blobert",
      image: "/Blobert.png",
    },
    {
      token: COLLECTIONS_MAP["Everai"],
      alt: "Everai",
      image: "/Everai.png",
    },
    {
      token: COLLECTIONS_MAP["Pixel Banners"],
      alt: "Pixel Banners",
      image: "/Pixel-Banners.png",
    },
    {
      token: COLLECTIONS_MAP["StarkID"],
      alt: "StarkID",
      image: "/StarkID.png",
    },
    {
      token: COLLECTIONS_MAP["Realms"],
      alt: "Realms",
      image: "/Realms.png",
    },
    {
      token: COLLECTIONS_MAP["Open Division"],
      alt: "Open Division",
      image: "/Open-Division.png",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 2xl:p-20">
      <div className="w-full h-full flex flex-col items-center gap-5 py-10 sm:gap-20 sm:p-0">
        <h1 className="m-0 uppercase text-4xl sm:text-6xl text-center">
          Mainnet Tournament Claim
        </h1>
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between">
            <p className="text-2xl uppercase">Collections</p>
            {address && (
              <div className="flex flex-row items-center gap-2">
                <p className="text-2xl uppercase">
                  {displayAddress(address ?? "")}
                </p>
                <Button
                  size={"xxs"}
                  disabled={address === undefined}
                  onClick={() => {
                    disconnect();
                    clickPlay();
                  }}
                  className="h-8"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 gap-y-14 sm:flex sm:flex-row sm:items-center sm:gap-5 h-[200px] sm:h-[100px]">
            {collectionsData.map((collection) =>
              renderCollection(
                collection.token,
                collection.image,
                collection.alt
              )
            )}
          </div>
          <div className="w-full h-[200px] sm:h-[300px] flex flex-col border border-terminal-green items-center justify-center gap-10 p-5 mt-20">
            {!address ? (
              <>
                <p className="text-2xl uppercase">Check Eligibility</p>
                <div className="hidden sm:flex flex-row gap-2">
                  {walletConnectors.map((connector, index) => (
                    <Button
                      size={"lg"}
                      disabled={address !== undefined}
                      onClick={() => {
                        disconnect();
                        connect({ connector });
                      }}
                      key={index}
                    >
                      {`Login With ${connector.id}`}
                    </Button>
                  ))}
                </div>
                <div className="sm:hidden flex text-2xl">
                  Claim Games on Desktop
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="text-2xl text-center uppercase">
                  {unclaimedCollectionsByOwnerData.length} Free Games Claimable
                </p>
                <Button
                  size={"lg"}
                  disabled={address === undefined}
                  onClick={() => handleCartridgeOnboarding()}
                >
                  <span className="flex flex-row gap-2">
                    Claim Using
                    <span className="flex flex-row text-terminal-black">
                      <CartridgeIcon /> Cartridge
                    </span>
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
