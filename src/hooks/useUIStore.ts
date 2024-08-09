import { create } from "zustand";

export type Network =
  | "mainnet"
  | "katana"
  | "sepolia"
  | "localKatana"
  | undefined;

type State = {
  network: Network;
  setNetwork: (network: Network) => void;
};

export const useUIStore = create<State>((set) => ({
  network: undefined,
  setNetwork: (network) => set({ network }),
}));
