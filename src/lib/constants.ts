import { hash } from "starknet";
import { CollectionData } from "./types";

export const COLLECTION_TOKENS_MAP = {
  Blobert: "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1",
  DucksEverywhere:
    "0x058949fa2955b10b3a82521934e8b0505dc0b7ba929c3049622ae91d2c52e194",
  Everai: "0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478",
  FocusTree:
    "0x0377c2d65debb3978ea81904e7d59740da1f07412e30d01c5ded1c5d6f1ddc43",
  InfluenceCrew:
    "0x0241b9c4ce12c06f49fee2ec7c16337386fa5185168f538a7631aacecdf3df74",
  TheSyndicate:
    "0x065a413ce0b5c169c583c7efad857913523485f1febcf5ef4f3909133f04904a",
  PixelBanners:
    "0x02d66679de61a5c6d57afd21e005a8c96118bd60315fd79a4521d68f5e5430d1",
  Realms: "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
};

export const COLLECTION_WEAPON_MAP = {
  Blobert: "76",
  DucksEverywhere: "76",
  Everai: "12",
  FocusTree: "16",
  InfluenceCrew: "16",
  TheSyndicate: "12",
  PixelBanners: "46",
  Realms: "46",
};

export const collectionsData: CollectionData[] = [
  {
    token: COLLECTION_TOKENS_MAP["Blobert"],
    alt: "Blobert",
    image: "Blobert.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["DucksEverywhere"],
    alt: "Duck",
    image: "Ducks-Everywhere.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["Everai"],
    alt: "Everai",
    image: "Everai.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["FocusTree"],
    alt: "Focus Tree",
    image: "Focus-Tree.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["InfluenceCrew"],
    alt: "Influence Crewmate",
    image: "Influence.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["TheSyndicate"],
    alt: "The Syndicate",
    image: "The-Syndicate.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["PixelBanners"],
    alt: "Pixel Banners",
    image: "Pixel-Banners.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["Realms"],
    alt: "Realms",
    image: "Realms.png",
  },
];

export const GAMES_PER_TOKEN = {
  "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1": 1,
  "0x058949fa2955b10b3a82521934e8b0505dc0b7ba929c3049622ae91d2c52e194": 6,
  "0x02acee8c430f62333cf0e0e7a94b2347b5513b4c25f699461dd8d7b23c072478": 2,
  "0x0377c2d65debb3978ea81904e7d59740da1f07412e30d01c5ded1c5d6f1ddc43": 1,
  "0x0241b9c4ce12c06f49fee2ec7c16337386fa5185168f538a7631aacecdf3df74": 1,
  "0x065a413ce0b5c169c583c7efad857913523485f1febcf5ef4f3909133f04904a": 1,
  "0x02d66679de61a5c6d57afd21e005a8c96118bd60315fd79a4521d68f5e5430d1": 1,
  "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809": 1,
};

export const getCollectionAlt = (token: string) => {
  const collection = collectionsData.find(
    (collection) => collection.token === token
  );
  return collection?.alt;
};

export const SELECTOR_KEYS = {
  ClaimedFreeGame: hash.getSelectorFromName("ClaimedFreeGame"),
};

export const collectionTotalGames = (tournament: string) => {
  if (tournament === "1") {
    return 300;
  } else {
    return 1600;
  }
};
export const maxFreeGames = (tournament: string) => {
  if (tournament === "1") {
    return 2400;
  } else {
    return 12800;
  }
};
