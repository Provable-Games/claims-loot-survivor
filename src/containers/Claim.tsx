import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "../components/Button";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { getCartridgeConnector, getWalletConnectors } from "../lib/connectors";
import { CartridgeIcon, CompleteIcon } from "../components/Icons";
import { collectionsData, GAMES_PER_TOKEN } from "../lib/constants";
import { displayAddress, padAddress } from "../lib/utils";
import useSyscalls from "../hooks/useSyscalls";
import { useUIStore } from "../hooks/useUIStore";
import { Network } from "../lib/types";
import { networkConfig } from "../lib/networkConfig";
import { useQuery } from "@apollo/client";
import {
  getTokensByNftOwner,
  getGamesByTokens,
} from "../hooks/graphql/queries";

const Claim = () => {
  const [nftWallet, setNftWallet] = useState("");
  const [controllerAccount, setControllerAccount] = useState("");
  const [claimedGames, setClaimedGames] = useState([]);
  const [selectSkip, setSelectSkip] = useState(false);
  const [hashList, setHashList] = useState([]);
  const { play: clickPlay } = useUiSounds(soundSelector.click);
  const {
    setClaiming,
    setClaimed,
    claimed,
    claimedData,
    setClaimedData,
    setPreparingClaim,
    setFetchingMetadata,
    alreadyClaimed,
    setAlreadyClaimed,
    freeGamesData,
    setFreeGamesData,
  } = useUIStore();

  const { connectors, connect, connector } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address } = useAccount();
  const network: Network = import.meta.env.VITE_NETWORK;
  const { executeClaim } = useSyscalls();

  const walletConnectors = getWalletConnectors(connectors);

  const tokenByOwnerVariables = {
    ownerAddress: address ? address : "0x0",
  };

  const { refetch: refetchNftOwner } = useQuery(getTokensByNftOwner, {
    variables: tokenByOwnerVariables,
    skip: !address,
    fetchPolicy: "network-only",
  });

  const gamesByTokensVariables = {
    hashList: hashList,
  };

  const { refetch: refetchGameOwner } = useQuery(getGamesByTokens, {
    variables: gamesByTokensVariables,
    skip: hashList.length === 0,
    fetchPolicy: "network-only",
  });

  const fetchNftData = useCallback(async () => {
    if (connector?.id !== "cartridge") {
      const data: any = await refetchNftOwner({
        ownerAddress: address ? address : "0x0",
      });
      const tokensData = data ? data.data.tokens : [];
      setClaimedData(tokensData);
      setHashList(tokensData.map((token: any) => token.hash));
    }
  }, [address, connector]);

  const fetchGameData = useCallback(async () => {
    if (connector?.id !== "cartridge") {
      const data: any = await refetchGameOwner({
        hashList: hashList,
      });
      const tokensData = data ? data.data.claimedFreeGames : [];
      setFreeGamesData(tokensData);
    }
  }, [address, connector, hashList]);

  useEffect(() => {
    if (address) {
      fetchNftData();
      fetchGameData();
    }
  }, [address, hashList]);

  const mergeGameData = useCallback(() => {
    // Create a map to store the count of free games for each hash
    const freeGameCountMap: { [hash: string]: number } = {};
    freeGamesData.forEach((freeGame: any) => {
      freeGameCountMap[freeGame.hash] =
        (freeGameCountMap[freeGame.hash] || 0) + 1;
    });

    const mergedData = claimedData.map((claimedItem: any) => {
      const freeGamesUsed = freeGameCountMap[claimedItem.hash] || 0;
      const freeGamesAvailable =
        GAMES_PER_TOKEN[padAddress(claimedItem.token)] || 1;

      return {
        ...claimedItem,
        freeGamesUsed,
        freeGamesAvailable: Math.max(0, freeGamesAvailable - freeGamesUsed),
        allFreeGamesUsed: freeGamesUsed >= freeGamesAvailable,
      };
    });

    return mergedData;
  }, [claimedData, freeGamesData]);

  const { freeGamesAvailable, totalFreeGamesAvailable } = useMemo(() => {
    const mergedData = mergeGameData();
    const availableTokens = mergedData.filter(
      (token: any) => token.freeGamesAvailable > 0
    );
    const totalAvailable = mergedData.reduce(
      (sum, token) => sum + token.freeGamesAvailable,
      0
    );
    return {
      freeGamesAvailable: availableTokens,
      totalFreeGamesAvailable: totalAvailable,
    };
  }, [mergeGameData]);

  useEffect(() => {
    if (account && claimedData.length > 0 && freeGamesAvailable.length === 0) {
      setAlreadyClaimed(true);
    }
  }, [account, claimedData]);

  console.log(freeGamesAvailable);

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

  const getCollectionFreeGames = (token: string) => {
    return freeGamesAvailable
      .filter((game) => padAddress(game.token) === token)
      .reduce((sum, token) => sum + token.freeGamesAvailable, 0);
  };

  const renderCollection = (
    token: string,
    image: string,
    alt: string,
    index: number
  ) => {
    const freeGames = getCollectionFreeGames(token);
    return (
      <div
        className="flex flex-col gap-2 items-center justify-center relative"
        key={index}
      >
        {address && (
          <>
            <span className="absolute w-full h-full bg-terminal-black opacity-70 z-10" />
            {freeGames > 0 && (
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
        {address && freeGames > 0 && (
          <span className="w-full absolute top-24 flex flex-row bg-terminal-green text-terminal-black rounded-lg justify-center uppercase">
            {`${freeGames}
          Game${freeGames > 1 ? "s" : ""}
          `}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-terminal-black sm:pt-8 sm:p-8 lg:p-10 2xl:p-20">
      <div className="w-1/2 h-full flex flex-col items-center gap-5 py-10 sm:gap-20 sm:p-0">
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
                    setAlreadyClaimed(false);
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
                collection.token,
                collection.image,
                collection.alt,
                index
              )
            )}
          </div>
          <div className="w-full h-[200px] sm:h-[300px] flex flex-col border border-terminal-green items-center justify-center gap-5 p-5 mt-20">
            {!address || alreadyClaimed ? (
              <>
                <p className="text-2xl uppercase">Check Eligibility</p>
                {!alreadyClaimed ? (
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
                ) : (
                  <p>ALREADY CLAIMED</p>
                )}
                <p className="hidden sm:block text-2xl uppercase">
                  Already Claimed?
                </p>
                <div className="hidden sm:flex flex-row gap-2">
                  <Button
                    size={"lg"}
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
                {totalFreeGamesAvailable > 0 ? (
                  <p className="text-4xl uppercase">
                    Congratulations Adventurer
                  </p>
                ) : (
                  <p className="text-4xl">Hello, Brave Adventurer</p>
                )}
                {totalFreeGamesAvailable > 0 ? (
                  <p className="text-2xl text-center uppercase">
                    {`${totalFreeGamesAvailable} Free        Game${
                      totalFreeGamesAvailable > 1 ? "s" : ""
                    } Claimable`}
                  </p>
                ) : (
                  <p className="text-2xl">
                    Unfortunately, it looks like you don’t have the qualifying
                    NFTs for a free game. Don't be disheartened, we will be
                    playable for all soon.
                  </p>
                )}
                {totalFreeGamesAvailable > 0 ? (
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
                ) : (
                  <span className="flex items-center justify-center">
                    <Button className="w-1/4">Play</Button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
