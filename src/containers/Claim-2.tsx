"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useState, useMemo } from "react";
import { constants } from "starknet";
import CartridgeConnector from "@cartridge/connector";
import { Button, Input } from "@cartridge/ui-next";

const Claim2 = () => {
  const [chainId] = useState<constants.StarknetChainId>(
    constants.StarknetChainId.SN_SEPOLIA
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { account } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateAddressInput, setDelegateAddressInput] = useState("");
  const [isDelegateSupported, setIsDelegateSupported] = useState(false);

  const cartridgeConnector = useMemo(
    () => connectors.find((connector) => connector.id === "cartridge"),
    [connectors]
  ) as unknown as CartridgeConnector;

  const load = useCallback(async () => {
    if (!account) {
      return;
    }

    try {
      const delegate = await cartridgeConnector.delegateAccount();
      setDelegateAddress(delegate?.toString() || "");
      setIsDelegateSupported(true);
    } catch (e: any) {
      console.log(e);
      // controller doesnt support delegateAccount, ignore
    }
  }, [account, cartridgeConnector]);

  const execute = async () => {
    if (!account) {
      return;
    }
    setSubmitted(true);

    // account
    //   .execute([
    //     {
    //       contractAddress: account.address,
    //       entrypoint: "set_delegate_account",
    //       calldata: [delegateAddressInput],
    //     },
    //   ])
    //   .catch((e) => console.error(e))
    //   .finally(() => setSubmitted(false));
    (account as any).modal.open();
    // console.log(
    await (account as any).keychain.setDelegate("0x0");
    // );
    // await (account as any).keychain.openMenu();
  };

  useEffect(() => {
    load();
  }, [account, chainId, load]);

  // if (!account) {
  //   return null;
  // }

  console.log(account);

  // useEffect(() => {
  //   const cartridgeConnector = connectors.find(
  //     (connector) => connector.id === "cartridge"
  //   );
  //   connect({ connector: cartridgeConnector });
  // }, [connectors, connect]);

  return (
    <div className="flex flex-col gap-2 h-screen w-[1000px]">
      <h2>Delegate account</h2>
      <Button onClick={() => connect({ connector: cartridgeConnector })}>
        Connect
      </Button>
      <Button onClick={() => disconnect()}>Disconnect</Button>
      {isDelegateSupported ? (
        <>
          <p>
            Address: {delegateAddress}
            <Button onClick={() => load()}>Load</Button>
          </p>

          <div className="flex gap-2">
            <Input
              className="max-w-40"
              type="text"
              min-width="420px"
              value={delegateAddressInput}
              onChange={(e: any) => setDelegateAddressInput(e.target.value)}
            />
            <Button onClick={() => execute()} disabled={submitted}>
              Set Delegate
            </Button>
          </div>
        </>
      ) : (
        <p>Not supported!</p>
      )}
    </div>
  );
};

export default Claim2;
