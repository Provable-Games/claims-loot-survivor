import { useAccount, useConnect } from "@starknet-react/core";
// import CartridgeConnector from "@cartridge/connector";

const useSyscalls = () => {
  const { account } = useAccount();
  const { connector } = useConnect();

  const executeSetDelegate = async (delegateAddress: string) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

    await account
      .execute([
        {
          contractAddress: account.address,
          entrypoint: "set_delegate_account",
          calldata: [delegateAddress],
        },
      ])
      .catch((e) => console.error(e));
  };

  const executeClaim = async (gameAddress: string, numberOfGames: number) => {
    if (!account) {
      return;
    }

    if (connector?.id !== "cartridge") {
      return;
    }

    const calls = Array.from({ length: numberOfGames }, (_, index) => ({
      contractAddress: gameAddress,
      entrypoint: "free_game",
      calldata: [index], // Example of using the index if needed
    }));

    await account.execute(calls).catch((e) => console.error(e));
  };

  return { executeSetDelegate, executeClaim };
};

export default useSyscalls;
