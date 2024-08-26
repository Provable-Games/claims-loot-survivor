import { gql } from "@apollo/client";

const TOKEN_FIELDS = `
token
tokenId
ownerAddress
freeGameUsed
freeGameRevealed
adventurerId
`;

const TOKENS_FRAGMENT = `
  fragment TokenFields on TokenWithFreeGameStatus {
    ${TOKEN_FIELDS}
  }
`;

const getTokensByOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_tokens_by_owner($ownerAddress: HexValue) {
    tokensWithFreeGameStatus(
      where: { ownerAddress: { eq: $ownerAddress } }
      limit: 100000
    ) {
      ...TokenFields
    }
  }
`;

const getClaimedTokensByOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_tokens_by_owner($ownerAddress: HexValue) {
    tokensWithFreeGameStatus(
      where: { ownerAddress: { eq: $ownerAddress } }
      limit: 100000
    ) {
      ...TokenFields
    }
  }
`;

const getRevealedTokensByOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_revealed_tokens_by_owner($ownerAddress: HexValue) {
    tokensWithFreeGameStatus(
      where: {
        ownerAddress: { eq: $ownerAddress }
        freeGameRevealed: { eq: true }
      }
      limit: 100000
    ) {
      ...TokenFields
    }
  }
`;

export { getTokensByOwner, getClaimedTokensByOwner, getRevealedTokensByOwner };
