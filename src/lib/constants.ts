import { hash } from "starknet";
import { CollectionData } from "./types";

export const COLLECTION_TOKENS_MAP = {
  Blobert: "0x04a79a62dc260f2e9e4b208181b2014c14f3ff44fe7d0e6452a759ed91a106d1",
  DucksEverywhere:
    "0x07c006181ea9cc7dd1b09c29e9ff23112be30ecfef73b760fabe5bc7ae6ecb44",
  Everai: "0x04efe851716110abeee81b7f22f7964845355ffa32e6833fc3a557a1881721ac",
  FocusTree:
    "0x0377c2d65debb3978ea81904e7d59740da1f07412e30d01c5ded1c5d6f1ddc43",
  InfluenceCrew:
    "0x07280a807c8b79379bec87919433b7b836b93a92e6d71b24ee99f4ffe33dd337",
  TheSyndicate: "0x1",
  PixelBanners:
    "0x02d66679de61a5c6d57afd21e005a8c96118bd60315fd79a4521d68f5e5430d1",
  Realms: "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
};

export const COLLECTION_WEAPON_MAP = {
  Blobert: "76",
  DucksEverywhere: "76",
  DuckFrens: "76",
  Everai: "46",
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
    alt: "Influence Crew",
    image: "Influence.png",
  },
  {
    token: COLLECTION_TOKENS_MAP["The Syndicate"],
    alt: "The Syndicate",
    image: "Open-Division.png",
  },
  {
    token: [COLLECTION_TOKENS_MAP["Pixel Banners"]],
    alt: "Pixel Banners",
    image: "Pixel-Banners.png",
  },
  {
    token: [COLLECTION_TOKENS_MAP["Realms"]],
    alt: "Realms",
    image: "Realms.png",
  },
];

export const GAMES_PER_TOKEN = {
  "0x04a79a62dc260f2e9e4b208181b2014c14f3ff44fe7d0e6452a759ed91a106d1": 1,
  "0x07c006181ea9cc7dd1b09c29e9ff23112be30ecfef73b760fabe5bc7ae6ecb44": 1,
  "0x04efe851716110abeee81b7f22f7964845355ffa32e6833fc3a557a1881721ac": 1,
  "0x0377c2d65debb3978ea81904e7d59740da1f07412e30d01c5ded1c5d6f1ddc43": 1,
  "0x07280a807c8b79379bec87919433b7b836b93a92e6d71b24ee99f4ffe33dd337": 1,
  "0x1": 1,
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
