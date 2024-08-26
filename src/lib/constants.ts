import { hash } from "starknet";

export const COLLECTION_TOKENS_MAP = {
  Blobert: "0x04a79a62dc260f2e9e4b208181b2014c14f3ff44fe7d0e6452a759ed91a106d1",
  DefiSpring:
    "0x000aa84534f0e0510618ad6a16f24e9a64fe0277b1f1ca799f0bddfec300d870",
  DucksEverywhere:
    "0x07c006181ea9cc7dd1b09c29e9ff23112be30ecfef73b760fabe5bc7ae6ecb44",
  DuckFrens:
    "0x0433a83c97c083470a1e2f47e24cbc53c4a225f69ffc045580a7279e7f077c79",
  Everai: "0x04efe851716110abeee81b7f22f7964845355ffa32e6833fc3a557a1881721ac",
  FocusTree:
    "0x0377c2d65debb3978ea81904e7d59740da1f07412e30d01c5ded1c5d6f1ddc43",
  InfluenceCrew:
    "0x07280a807c8b79379bec87919433b7b836b93a92e6d71b24ee99f4ffe33dd337",
  OpenDivision: "0x1",
  PixelBanners:
    "0x02d66679de61a5c6d57afd21e005a8c96118bd60315fd79a4521d68f5e5430d1",
  Realms: "0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809",
};

export const COLLECTION_WEAPON_MAP = {
  Blobert: "76",
  DefiSpring: "12",
  DucksEverywhere: "76",
  DuckFrens: "76",
  Everai: "46",
  FocusTree: "16",
  InfluenceCrew: "16",
  OpenDivision: "12",
  PixelBanners: "46",
  Realms: "46",
};

export const collectionsData = [
  {
    tokens: [COLLECTION_TOKENS_MAP["Blobert"]],
    alt: "Blobert",
    image: "Blobert.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["DefiSpring"]],
    alt: "Defi Spring",
    image: "Defi-Spring.png",
  },
  {
    tokens: [
      COLLECTION_TOKENS_MAP["DucksEverywhere"],
      COLLECTION_TOKENS_MAP["DuckFrens"],
    ],
    alt: "Duck",
    image: "Ducks-Everywhere.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["Everai"]],
    alt: "Everai",
    image: "Everai.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["FocusTree"]],
    alt: "Focus Tree",
    image: "Focus-Tree.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["InfluenceCrew"]],
    alt: "Influence Crew",
    image: "Influence.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["Open Division"]],
    alt: "Open Division",
    image: "Open-Division.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["Pixel Banners"]],
    alt: "Pixel Banners",
    image: "Pixel-Banners.png",
  },
  {
    tokens: [COLLECTION_TOKENS_MAP["Realms"]],
    alt: "Realms",
    image: "Realms.png",
  },
];

export const getCollectionAlt = (token: string) => {
  const collection = collectionsData.find((collection) =>
    collection.tokens.includes(token)
  );
  return collection?.alt;
};

export const SELECTOR_KEYS = {
  ClaimedFreeGame: hash.getSelectorFromName("ClaimedFreeGame"),
};
