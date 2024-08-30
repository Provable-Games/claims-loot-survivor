import { create } from "zustand";
import { AdventurerMetadata, Network } from "../lib/types";

type State = {
  network: Network;
  setNetwork: (network: Network) => void;
  claimed: boolean;
  setClaimed: (claimed: boolean) => void;
  claiming: boolean;
  setClaiming: (claiming: boolean) => void;
  fetchingMetadata: boolean;
  setFetchingMetadata: (fetchingMetadata: boolean) => void;
  preparingClaim: boolean;
  setPreparingClaim: (preparingClaim: boolean) => void;
  preparingReveal: boolean;
  setPreparingReveal: (preparingReveal: boolean) => void;
  adventurersMetadata: AdventurerMetadata[];
  setAdventurersMetadata: (metadata: AdventurerMetadata[]) => void;
  revealedAllMetadata: AdventurerMetadata[];
  setRevealedAllMetadata: (revealedAllMetadata: AdventurerMetadata[]) => void;
  claimedData: any[];
  setClaimedData: (claimedData: any[]) => void;
  freeGamesData: any[];
  setFreeGamesData: (freeGamesData: any[]) => void;
  username: string;
  setUsername: (username: string) => void;
  isRevealingAll: boolean;
  setIsRevealingAll: (isRevealingAll: boolean) => void;
  alreadyClaimed: boolean;
  setAlreadyClaimed: (alreadyClaimed: boolean) => void;
};

export const useUIStore = create<State>((set) => ({
  network: undefined,
  setNetwork: (network) => set({ network }),
  claimed: false,
  setClaimed: (claimed) => set({ claimed }),
  claiming: false,
  setClaiming: (claiming) => set({ claiming }),
  fetchingMetadata: false,
  setFetchingMetadata: (fetchingMetadata) => set({ fetchingMetadata }),
  preparingClaim: false,
  setPreparingClaim: (preparingClaim) => set({ preparingClaim }),
  preparingReveal: false,
  setPreparingReveal: (preparingReveal) => set({ preparingReveal }),
  adventurersMetadata: [],
  setAdventurersMetadata: (metadata) => set({ adventurersMetadata: metadata }),
  revealedAllMetadata: [],
  setRevealedAllMetadata: (revealedAllMetadata) => set({ revealedAllMetadata }),
  claimedData: [],
  setClaimedData: (claimedData) => set({ claimedData }),
  freeGamesData: [],
  setFreeGamesData: (freeGamesData) => set({ freeGamesData }),
  username: "",
  setUsername: (username) => set({ username }),
  isRevealingAll: false,
  setIsRevealingAll: (isRevealingAll) => set({ isRevealingAll }),
  alreadyClaimed: false,
  setAlreadyClaimed: (alreadyClaimed) => set({ alreadyClaimed }),
}));
