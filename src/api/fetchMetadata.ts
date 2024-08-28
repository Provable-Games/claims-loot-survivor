import { Buffer } from "buffer";

export const fetchAdventurerMetadata = async (
  gameAddress: string,
  tokenId: number,
  rpcUrl: string
) => {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "starknet_call",
      params: [
        {
          contract_address: gameAddress,
          entry_point_selector:
            "0x0226ad7e84c1fe08eb4c525ed93cccadf9517670341304571e66f7c4f95cbe54", // token_uri
          calldata: [tokenId.toString(16), "0x0"],
        },
        "pending",
      ],
      id: 0,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log("Beast fetched successfully");
  } else {
    console.error("Error in response:", data);
  }

  console.log(data);

  // Step 1: Convert hex strings to a single string
  const hexString = data.result.slice(1).join("").slice(2); // Remove '0x' prefix

  // Step 2: Convert hex to ASCII
  const fullString = hexString
    .match(/.{1,2}/g)!
    .map((hex: any) => String.fromCharCode(parseInt(hex, 16)))
    .join("");

  const encodedString = fullString.split(",")[1];

  const decodedString = Buffer.from(encodedString, "base64").toString("utf-8");

  const jsonData = JSON.parse(decodedString);

  return jsonData;
};
