import { useCallback, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { getCartridgeConnector, getWalletConnectors } from "../lib/connectors";
import { CartridgeIcon, CompleteIcon } from "../components/Icons";
import { collectionsData } from "../lib/constants";
import { displayAddress, padAddress } from "../lib/utils";
import useSyscalls from "../hooks/useSyscalls";
import { useUIStore } from "../hooks/useUIStore";
import { Network } from "../lib/types";
import { networkConfig } from "../lib/networkConfig";
import { useQuery } from "@apollo/client";
import { getGamesByNftOwner } from "../hooks/graphql/queries";

const Claim = () => {
  const [nftWallet, setNftWallet] = useState("");
  const [controllerAccount, setControllerAccount] = useState("");
  const [claimedGames, setClaimedGames] = useState([]);
  const [selectSkip, setSelectSkip] = useState(false);
  const { play: clickPlay } = useUiSounds(soundSelector.click);
  const {
    setClaiming,
    setClaimed,
    claimed,
    claimedData,
    setClaimedData,
    setPreparingClaim,
    setFetchingMetadata,
  } = useUIStore();

  const { connectors, connect, connector } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address } = useAccount();
  const network: Network = import.meta.env.VITE_NETWORK;
  const { executeClaim } = useSyscalls();

  const walletConnectors = getWalletConnectors(connectors);

  const freeGamesAvailable = claimedData.filter(
    (token: any) => !token.freeGameUsed
  );

  const tokenByOwnerVariables = {
    ownerAddress: address ? address : "0x0",
  };

  const { refetch } = useQuery(getGamesByNftOwner, {
    variables: tokenByOwnerVariables,
    skip: !address,
    fetchPolicy: "network-only",
  });

  const fetchData = useCallback(async () => {
    if (connector?.id !== "cartridge") {
      const data: any = await refetch({
        ownerAddress: address ? address : "0x0",
      });
      const tokensData = data ? data.data.tokensWithFreeGameStatus : [];
      setClaimedData(tokensData);
    }
  }, [address, connector]);

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address]);

  useEffect(() => {
    if (account && claimedData.length > 0 && freeGamesAvailable.length === 0) {
      console.log("CLAIMED NOW");
      setClaimed(true);
    }
  }, [freeGamesAvailable]);

  const handleCartridgeOnboarding = async () => {
    clickPlay();
    setPreparingClaim(true);
    setNftWallet(connector?.id!);
    setClaimedGames(freeGamesAvailable);
    const cartridgeConnector = connectors.find(
      (connector) => connector.id === "cartridge"
    );
    if (cartridgeConnector) {
      connect({ connector: cartridgeConnector });
    }
  };

  console.log(account);

  const executeClaimProcess = async () => {
    try {
      // setDelegateAccount(address!);
      // await executeSetDelegate(delegateAccount);
      await executeClaim(
        networkConfig[network!].gameAddress,
        claimedGames,
        controllerAccount
      );
      const cartridgeConnector = connectors.find(
        (connector) => connector.id === "cartridge"
      );
      if (cartridgeConnector) {
        connect({ connector: cartridgeConnector });
      }
      setFetchingMetadata(true);
    } catch (error) {
      setClaiming(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (controllerAccount && !claimed) {
      const nftConnector = connectors.find(
        (connector) => connector.id === nftWallet
      );
      if (nftConnector) {
        connect({ connector: nftConnector });
      }
    }
  }, [controllerAccount]);

  useEffect(() => {
    if (connector?.id === "cartridge" && account) {
      if (selectSkip) {
        setClaimed(true);
      } else {
        const timer = setTimeout(() => {
          setControllerAccount(address!);
        }, 2000); // Wait for 2 seconds (adjust as needed)

        return () => clearTimeout(timer); // Clean up the timer
      }
    }
  }, [connector, account]);

  console.log(controllerAccount);

  useEffect(() => {
    if (connector?.id !== "cartridge" && account) {
      if (controllerAccount && !claimed) {
        const timer = setTimeout(() => {
          executeClaimProcess();
        }, 2000); // Wait for 2 seconds (adjust as needed)

        return () => clearTimeout(timer); // Clean up the timer
      }
    }
  }, [connector, account]);

  const getCollectionFreeGames = (tokens: string[]) => {
    return freeGamesAvailable.filter((item: any) =>
      tokens.includes(padAddress(item.token))
    );
  };

  const renderCollection = (
    tokens: string[],
    image: string,
    alt: string,
    index: number
  ) => {
    const freeGames = getCollectionFreeGames(tokens);
    return (
      <div
        className="flex flex-col gap-2 items-center justify-center relative"
        key={index}
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
          <img
            src={"/collections/" + image}
            alt={alt}
            className="w-full h-full"
          />
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

  console.log(claimedData);

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
            {collectionsData.map((collection, index) =>
              renderCollection(
                collection.tokens,
                collection.image,
                collection.alt,
                index
              )
            )}
          </div>
          <div className="w-full h-[200px] sm:h-[300px] flex flex-col border border-terminal-green items-center justify-center gap-5 p-5 mt-20">
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
                <p className="hidden sm:block text-2xl uppercase">
                  Already Claimed?
                </p>
                <div className="hidden sm:flex flex-row gap-2">
                  <Button
                    size={"lg"}
                    disabled={address !== undefined}
                    onClick={() => {
                      disconnect();
                      connect({
                        connector: getCartridgeConnector(connectors),
                      });
                      setSelectSkip(true);
                    }}
                  >
                    Login With
                    <span className="flex flex-row text-terminal-black pl-2">
                      <CartridgeIcon /> Cartridge
                    </span>
                  </Button>
                </div>
                <div className="sm:hidden flex text-2xl">
                  Claim Games on Desktop
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-5">
                <p className="text-2xl text-center uppercase">
                  {freeGamesAvailable.length} Free Games Claimable
                </p>
                <Button
                  size={"lg"}
                  disabled={
                    address === undefined || freeGamesAvailable.length === 0
                  }
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
