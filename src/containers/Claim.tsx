import { useCallback, useEffect, useState, useMemo } from "react";
import { Button } from "../components/Button";
import { useUiSounds, soundSelector } from "../hooks/useUISound";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { getCartridgeConnector, getWalletConnectors } from "../lib/connectors";
import { CartridgeIcon, CompleteIcon, OutIcon } from "../components/Icons";
import {
  collectionsData,
  GAMES_PER_TOKEN,
  collectionTotalGames,
  maxFreeGames,
  excludedTokens,
} from "../lib/constants";
import { displayAddress, indexAddress, padAddress } from "../lib/utils";
import useSyscalls from "../hooks/useSyscalls";
import { useUIStore } from "../hooks/useUIStore";
import { networkConfig } from "../lib/networkConfig";
import { useQuery } from "@apollo/client";
import {
  getTokensByNftOwner,
  getGamesByTokens,
  getClaimedFreeGamesCounts,
} from "../hooks/graphql/queries";
import { AccountInterface } from "starknet";

const Claim = () => {
  const [nftWallet, setNftWallet] = useState("");
  const [controllerAccount, setControllerAccount] = useState("");
  const [delegateAccount, setDelegateAccount] = useState("");
  const [claimedGames, setClaimedGames] = useState([]);
  const [selectSkip, setSelectSkip] = useState(false);
  const [hashList, setHashList] = useState([]);
  const [nftDataFetched, setNftDataFetched] = useState(false);
  const [gameDataFetched, setGameDataFetched] = useState(false);
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
    resetAllState,
    signature,
  } = useUIStore();

  const tbtTournament = import.meta.env.VITE_TBT_TOURNAMENT;
  const releaseTournament = import.meta.env.VITE_RELEASE_TOURNAMENT;

  const { connectors, connect, connector } = useConnect();
  const { disconnect } = useDisconnect();
  const { account, address } = useAccount();
  const network = "mainnet";
  const { executeClaim, verifyWalletSignature } = useSyscalls();

  const walletConnectors = getWalletConnectors(connectors);

  const tokenByOwnerVariables = useMemo(
    () => ({
      ownerAddress: address ? indexAddress(address.toLowerCase()) : "0x0",
    }),
    [address]
  );

  const { refetch: refetchNftOwner } = useQuery(getTokensByNftOwner, {
    variables: tokenByOwnerVariables,
    skip: !address,
    fetchPolicy: "network-only",
  });

  const gamesByTokensVariables = useMemo(
    () => ({
      hashList: hashList,
    }),
    [hashList]
  );

  const { refetch: refetchGameOwner } = useQuery(getGamesByTokens, {
    variables: gamesByTokensVariables,
    skip: hashList.length === 0,
    fetchPolicy: "network-only",
  });

  const tokens = useMemo(
    () => collectionsData.map((collection) => indexAddress(collection.token)),
    []
  );

  const { data: claimedFreeGamesCountsData } = useQuery(
    getClaimedFreeGamesCounts,
    {
      variables: { tokens },
      skip: tokens.length === 0,
      fetchPolicy: "network-only",
    }
  );

  const totalFreeGames = useMemo(() => {
    return claimedFreeGamesCountsData?.countClaimedFreeGames?.reduce(
      (sum, token) => sum + token.count,
      0
    );
  }, [claimedFreeGamesCountsData]);

  const mintedOut = totalFreeGames >= maxFreeGames(tbtTournament);

  const fetchNftData = useCallback(async () => {
    if (connector?.id !== "cartridge") {
      const data: any = await refetchNftOwner({
        ownerAddress: address ? indexAddress(address.toLowerCase()) : "0x0",
      });
      const tokensData = data ? data.data.tokens : [];
      setClaimedData(tokensData);
      setHashList(tokensData.map((token: any) => token.hash));
      setNftDataFetched(true);
    }
  }, [address, connector]);

  const fetchGameData = useCallback(async () => {
    if (connector?.id !== "cartridge") {
      const data: any = await refetchGameOwner({
        hashList: hashList,
      });
      const tokensData = data ? data.data.claimedFreeGames : [];
      setFreeGamesData(tokensData);
      setGameDataFetched(true);
    }
  }, [address, connector, hashList]);

  // Effect for fetching NFT data when address changes
  useEffect(() => {
    if (address) {
      fetchNftData();
    }
  }, [address]);

  // Separate effect for fetching game data when hashList changes
  useEffect(() => {
    if (nftDataFetched) {
      fetchGameData();
    }
  }, [hashList, nftDataFetched]);

  const mergeGameData = useCallback(() => {
    if (!nftDataFetched || !gameDataFetched) {
      return null;
    }
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
  }, [nftDataFetched && gameDataFetched]);

  const { freeGamesAvailable, totalFreeGamesAvailable } = useMemo(() => {
    const mergedData = mergeGameData();
    if (mergedData === null) {
      return { freeGamesAvailable: null, totalFreeGamesAvailable: null };
    }

    const calculateTokensToClaim = (token: any) => {
      const gamesClaimed =
        claimedFreeGamesCountsData?.countClaimedFreeGames?.find(
          (game: any) => game.token === indexAddress(token.token)
        )?.count || 0;

      const gamesLeft = collectionTotalGames(tbtTournament) - gamesClaimed;
      const tokensLeft = Math.ceil(gamesLeft / GAMES_PER_TOKEN[token.token]);
      const freeTokensAvailable = Math.ceil(
        token.freeGamesAvailable / GAMES_PER_TOKEN[token.token]
      );

      return Math.min(tokensLeft, freeTokensAvailable);
    };

    const availableTokens = mergedData
      .filter((token: any) => !excludedTokens.includes(token.token))
      .map((token: any) => ({
        ...token,
        tokensToClaim: calculateTokensToClaim(token),
      }))
      .filter((token: any) => token.tokensToClaim > 0);

    const totalAvailable = availableTokens.reduce(
      (sum, token) => sum + token.tokensToClaim * GAMES_PER_TOKEN[token.token],
      0
    );

    return {
      freeGamesAvailable: availableTokens,
      totalFreeGamesAvailable: totalAvailable,
    };
  }, [
    mergeGameData,
    claimedFreeGamesCountsData?.countClaimedFreeGames,
    tbtTournament,
  ]);

  useEffect(() => {
    if (account && claimedData.length > 0 && freeGamesAvailable !== null) {
      if (freeGamesAvailable.length === 0) {
        setAlreadyClaimed(true);
      } else {
        setAlreadyClaimed(false);
      }
    }
  }, [account, claimedData, freeGamesAvailable]);

  const handleCartridgeOnboarding = async () => {
    clickPlay();
    setPreparingClaim(true);
    setNftWallet(connector?.id!);
    setDelegateAccount(address!);
    setClaimedGames(freeGamesAvailable);
    const cartridgeConnector = connectors.find(
      (connector) => connector.id === "cartridge"
    );
    if (cartridgeConnector) {
      connect({ connector: cartridgeConnector });
    }
  };

  const executeSignatureProcess = async () => {
    await verifyWalletSignature(
      account as unknown as AccountInterface,
      controllerAccount
    );
    const cartridgeConnector = connectors.find(
      (connector) => connector.id === "cartridge"
    );
    if (cartridgeConnector) {
      connect({ connector: cartridgeConnector });
    }
  };

  const executeClaimProcess = async () => {
    try {
      await executeClaim(
        networkConfig[network!].gameAddress,
        claimedFreeGamesCountsData?.countClaimedFreeGames,
        claimedGames,
        delegateAccount,
        tbtTournament
      );
      setDelegateAccount("");
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
          if (signature) {
            executeClaimProcess();
          } else {
            setControllerAccount(address!);
          }
        }, 2000); // Wait for 2 seconds (adjust as needed)

        return () => clearTimeout(timer); // Clean up the timer
      }
    }
  }, [connector, account, signature]);

  useEffect(() => {
    if (connector?.id !== "cartridge" && account) {
      if (controllerAccount && !claimed) {
        const timer = setTimeout(() => {
          executeSignatureProcess();
        }, 2000); // Wait for 2 seconds (adjust as needed)

        return () => clearTimeout(timer); // Clean up the timer
      }
    }
  }, [connector, account]);

  const getCollectionFreeGames = (token: string) => {
    if (freeGamesAvailable === null) {
      return null; // Return null if data hasn't been fetched yet
    }
    return freeGamesAvailable
      .filter((game) => padAddress(game.token) === token)
      .reduce((sum, token) => sum + token.freeGamesAvailable, 0);
  };

  const renderCollection = (
    token: string,
    image: string,
    alt: string,
    index: number,
    tbtTournament: string,
    releaseTournament: string
  ) => {
    const freeGames = getCollectionFreeGames(token);
    const gamesClaimed = claimedFreeGamesCountsData
      ? claimedFreeGamesCountsData?.countClaimedFreeGames?.find(
          (game: any) => game.token === indexAddress(token)
        ).count
      : 0;
    const closed = tbtTournament === "0" && releaseTournament === "0";
    const gamesLeft = collectionTotalGames(tbtTournament) - gamesClaimed;
    const isMintedOut = gamesLeft <= 0;
    const gamesToClaim = Math.min(gamesLeft, freeGames);
    const excluded = excludedTokens.includes(token);
    return (
      <div
        className="flex flex-col gap-2 items-center justify-center relative"
        key={index}
      >
        {(isMintedOut || closed || excluded) && (
          <>
            <span className="absolute w-full h-full bg-terminal-black opacity-50 z-10" />
            <span className="absolute w-full h-full z-20">
              <span className="text-red-800 w-1/2 h-1/2">
                <OutIcon />
              </span>
            </span>
          </>
        )}
        {claimedFreeGamesCountsData && !closed && !excluded ? (
          <span
            className={`w-full absolute top-[-30px] flex flex-row border ${
              gamesLeft > (tbtTournament === "1" ? 150 : 800)
                ? "border-terminal-green text-terminal-green"
                : gamesLeft > (tbtTournament === "1" ? 30 : 160)
                ? "border-terminal-yellow text-terminal-yellow"
                : "border-red-600 text-red-600"
            } rounded-lg justify-center uppercase`}
          >
            {isMintedOut ? "Minted Out" : `${gamesLeft} Left`}
          </span>
        ) : (
          <></>
        )}
        {address && !isMintedOut && freeGames > 0 && (
          <>
            <span className="absolute w-full h-full bg-terminal-black opacity-70 z-10" />
            <span className="absolute w-1/2 z-20">
              <CompleteIcon />
            </span>
          </>
        )}
        <span className="relative h-20 w-20 border border-terminal-green">
          <img
            src={"/collections/" + image}
            alt={alt}
            className="w-full h-full"
          />
        </span>
        {address && freeGames > 0 && !closed && !mintedOut && (
          <span className="w-full absolute top-24 flex flex-row bg-terminal-green text-terminal-black rounded-lg justify-center uppercase">
            {`${gamesToClaim}
          Game${gamesToClaim > 1 ? "s" : ""}
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
        <div className="flex flex-col gap-10">
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
                    resetAllState();
                    setNftDataFetched(false);
                    setGameDataFetched(false);
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
                index,
                tbtTournament,
                releaseTournament
              )
            )}
          </div>
          <div className="w-full h-[200px] sm:h-[300px] flex flex-col border border-terminal-green items-center justify-center gap-5 p-5 mt-5">
            {!address ||
            alreadyClaimed ||
            !claimedData ||
            !nftDataFetched ||
            !gameDataFetched ? (
              <>
                {mintedOut ? (
                  <div className="flex flex-col items-center justify-center gap-5">
                    <p className="text-4xl uppercase text-red-600">
                      Minted Out
                    </p>
                    <Button
                      size={"lg"}
                      onClick={() => {
                        clickPlay();
                        window.open(
                          "https://lootsurvivor.io/",
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      Join The Fun
                    </Button>
                  </div>
                ) : (
                  <>
                    {address && (!nftDataFetched || !gameDataFetched) ? (
                      <p className="uppercase loading-ellipsis">Loading</p>
                    ) : (
                      <>
                        {tbtTournament === "0" && releaseTournament === "0" ? (
                          <p className="text-4xl uppercase">
                            Tournament closed
                          </p>
                        ) : !alreadyClaimed ? (
                          <>
                            <p className="uppercase text-2xl">
                              Check Eligibility
                            </p>
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
                          </>
                        ) : (
                          <p className="uppercase text-4xl mb-5">
                            You have no tokens to claim
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
                {!alreadyClaimed && (
                  <p className="hidden sm:block text-2xl uppercase">
                    Already Claimed?
                  </p>
                )}
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
                    <Button
                      className="w-1/4"
                      onClick={() => {
                        clickPlay();
                        window.open(
                          "https://lootsurvivor.io/",
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      Play
                    </Button>
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
