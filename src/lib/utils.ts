import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  shortString,
  StarknetDomain,
  TypedData,
  TypedDataRevision,
  typedData,
} from "starknet";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayAddress(string: string) {
  if (string === undefined) return "unknown";
  return string.substring(0, 6) + "..." + string.substring(string.length - 4);
}

export function padAddress(address: string) {
  if (address && address !== "") {
    const length = address.length;
    const neededLength = 66 - length;
    let zeros = "";
    for (var i = 0; i < neededLength; i++) {
      zeros += "0";
    }
    const newHex = address.substring(0, 2) + zeros + address.substring(2);
    return newHex;
  } else {
    return "";
  }
}

export function indexAddress(address: string) {
  const newHex =
    address.substring(0, 2) + address.substring(3).replace(/^0+/, "");
  return newHex;
}

export function getKeyByValue<T extends object>(
  obj: T,
  value: any
): keyof T | undefined {
  return Object.entries(obj).find(([_, val]) => val === value)?.[0] as
    | keyof T
    | undefined;
}

// ... existing code ...

export function stringToFelt(str: string) {
  return (
    "0x" +
    Array.from(str)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

const relevantAttributes = [
  "Strength",
  "Dexterity",
  "Intelligence",
  "Vitality",
  "Wisdom",
  "Charisma",
];
export const statsRevealed = (meta: any) => {
  const revealedStats = relevantAttributes.map((trait) => {
    const attr = meta.attributes.find((a: any) => a.trait === trait);
    return attr && attr.value !== "?" ? parseInt(attr.value, 10) : NaN;
  });
  const allRevealed = revealedStats.every((stat) => !isNaN(stat));
  const sumGreaterThanZero =
    revealedStats.reduce((sum, stat) => sum + stat, 0) > 0;
  return allRevealed && sumGreaterThanZero;
};

export const colorMap = (stat: number, isRevealing: boolean) => {
  if (isRevealing) return "";
  if (stat <= 0) return "bg-red-900";
  if (stat <= 2) return "bg-terminal-yellow-50";
  if (stat <= 4) return "bg-terminal-green-50";
  if (stat <= 9) return "bg-terminal-green text-terminal-black";
  return "bg-terminal-green text-terminal-black";
};

const types = {
  StarknetDomain: [
    { name: "name", type: "shortstring" },
    { name: "version", type: "shortstring" },
    { name: "chainId", type: "shortstring" },
    { name: "revision", type: "shortstring" },
  ],
  Message: [{ name: "recipient", type: "ContractAddress" }],
};

interface Message {
  recipient: string;
}

function getDomain(chainId: string): StarknetDomain {
  return {
    name: "Loot Survivor",
    version: shortString.encodeShortString("1"),
    chainId,
    revision: TypedDataRevision.ACTIVE,
  };
}

export function getTypedData(myStruct: Message, chainId: string): TypedData {
  return {
    types,
    primaryType: "Message",
    domain: getDomain(chainId),
    message: { ...myStruct },
  };
}

export function getTypedDataHash(
  myStruct: Message,
  chainId: string,
  owner: bigint
): string {
  return typedData.getMessageHash(getTypedData(myStruct, chainId), owner);
}
