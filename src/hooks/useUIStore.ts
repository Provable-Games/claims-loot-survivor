import { create } from "zustand";
import { AdventurerMetadata } from "../lib/types";
import { Signature } from "starknet";

type State = {
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
  setAdventurersMetadata: (
    updater:
      | AdventurerMetadata[]
      | ((prevMetadata: AdventurerMetadata[]) => AdventurerMetadata[])
  ) => void;
  revealedAllMetadata: AdventurerMetadata[];
  setRevealedAllMetadata: (revealedAllMetadata: AdventurerMetadata[]) => void;
  claimedData: any[];
  setClaimedData: (claimedData: any[]) => void;
  freeGamesData: any[];
  setFreeGamesData: (
    updater: any[] | ((prevFreeGamesData: any[]) => any[])
  ) => void;
  username: string;
  setUsername: (username: string) => void;
  isRevealingAll: boolean;
  setIsRevealingAll: (isRevealingAll: boolean) => void;
  alreadyClaimed: boolean;
  setAlreadyClaimed: (alreadyClaimed: boolean) => void;
  skipGameFetch: boolean;
  setSkipGameFetch: (skipGameFetch: boolean) => void;
  signature: Signature;
  setSignature: (signature: Signature) => void;
  resetAllState: () => void;
};

export const useUIStore = create<State>((set) => ({
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
  setAdventurersMetadata: (updater) =>
    set((state) => ({
      adventurersMetadata:
        typeof updater === "function"
          ? updater(state.adventurersMetadata)
          : updater,
    })),
  revealedAllMetadata: [],
  setRevealedAllMetadata: (revealedAllMetadata) => set({ revealedAllMetadata }),
  claimedData: [],
  setClaimedData: (claimedData) => set({ claimedData }),
  freeGamesData: [],
  setFreeGamesData: (updater) =>
    set((state) => ({
      freeGamesData:
        typeof updater === "function" ? updater(state.freeGamesData) : updater,
    })),
  username: "",
  setUsername: (username) => set({ username }),
  isRevealingAll: false,
  setIsRevealingAll: (isRevealingAll) => set({ isRevealingAll }),
  alreadyClaimed: false,
  setAlreadyClaimed: (alreadyClaimed) => set({ alreadyClaimed }),
  skipGameFetch: false,
  setSkipGameFetch: (skipGameFetch) => set({ skipGameFetch }),
  signature: null,
  setSignature: (signature) => set({ signature }),
  resetAllState: () =>
    set({
      claimed: false,
      claiming: false,
      fetchingMetadata: false,
      preparingClaim: false,
      preparingReveal: false,
      adventurersMetadata: [],
      revealedAllMetadata: [],
      claimedData: [],
      freeGamesData: [],
      username: "",
      isRevealingAll: false,
      alreadyClaimed: false,
      skipGameFetch: false,
    }),
}));
