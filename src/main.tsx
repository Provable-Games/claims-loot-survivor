import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StarknetProvider } from "./provider";
import { Network } from "./lib/types";
import App from "./App.tsx";
import "./index.css";

console.log(import.meta.env.VITE_NETWORK);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StarknetProvider network={import.meta.env.VITE_NETWORK! as Network}>
      <App />
    </StarknetProvider>
  </StrictMode>
);
