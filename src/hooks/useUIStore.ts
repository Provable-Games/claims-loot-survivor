import { create } from "zustand";
import { AdventurerMetadata, Network } from "../lib/types";

type State = {
  network: Network;
  setNetwork: (network: Network) => void;
  claimed: boolean;
  setClaimed: (claimed: boolean) => void;
  claiming: boolean;
  setClaiming: (claiming: boolean) => void;
  adventurersMetadata: AdventurerMetadata[];
  setAdventurersMetadata: (metadata: AdventurerMetadata[]) => void;
  claimedData: any[];
  setClaimedData: (claimedData: any[]) => void;
};

export const useUIStore = create<State>((set) => ({
  network: undefined,
  setNetwork: (network) => set({ network }),
  claimed: false,
  setClaimed: (claimed) => set({ claimed }),
  claiming: false,
  setClaiming: (claiming) => set({ claiming }),
  adventurersMetadata: [],
  setAdventurersMetadata: (metadata) => set({ adventurersMetadata: metadata }),
  claimedData: [],
  setClaimedData: (claimedData) => set({ claimedData }),
}));
