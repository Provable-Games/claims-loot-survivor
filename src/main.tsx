import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StarknetProvider } from "./provider";
import { ApolloProvider } from "@apollo/client";
import { networkConfig } from "./lib/networkConfig";
import { gameClient } from "./lib/clients";
import App from "./App.tsx";
import "./index.css";

// Get the network from environment variable
const network = "mainnet";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StarknetProvider network={network}>
      <ApolloProvider client={gameClient(networkConfig[network].lsGQLURL!)}>
        <App />
      </ApolloProvider>
    </StarknetProvider>
  </StrictMode>
);
