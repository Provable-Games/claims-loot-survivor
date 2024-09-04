import { useEffect, useState } from "react";
import Claim from "./containers/Claim";
import Claimed from "./containers/Claimed";
import Claiming from "./containers/Claiming";
import PreparingClaim from "./containers/Preparing";
import { useUIStore } from "./hooks/useUIStore";
import { useConnect } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import Countdown from "./containers/Countdown";

const App = () => {
  const { claimed, claiming, preparingClaim, preparingReveal, setUsername } =
    useUIStore();

  const [countdown, setCountdown] = useState(false);

  const { connector } = useConnect();

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

  useEffect(() => {
    const now = new Date().getTime();
    const targetDate = Date.UTC(2024, 8, 4, 19, 10, 41);
    const difference = targetDate - now;
    if (difference > 0) {
      setCountdown(true);
    }
  }, []);

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
      {countdown && <Countdown />}
    </div>
  );
};

export default App;
