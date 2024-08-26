import { InvokeTransactionReceiptResponse } from "starknet";
import { getKeyByValue } from "./utils";
import { SELECTOR_KEYS } from "./constants";

export async function parseEvents(
  receipt: InvokeTransactionReceiptResponse,
  event?: string
) {
  if (!receipt.events) {
    throw new Error(`No events found`);
  }

  let events: Array<any> = [];

  for (let raw of receipt.events) {
    let eventName: string | null = "";

    if (event) {
      const eventFromKey = getKeyByValue(SELECTOR_KEYS, raw.keys[0])!;
      if (event == eventFromKey) {
        eventName = event;
      } else {
        eventName = null;
      }
    } else {
      eventName = getKeyByValue(SELECTOR_KEYS, raw.keys[0]);
    }

    switch (eventName) {
      case "ClaimedFreeGame":
        const claimedFreeGameData = {
          adventurerId: parseInt(raw.data[0]),
          collectionAddress: raw.data[1],
          tokenId: parseInt(raw.data[2]),
        };
        events.push({ name: eventName, data: claimedFreeGameData });
        break;
    }
  }

  return events;
}
