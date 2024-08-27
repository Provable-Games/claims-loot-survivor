import { gql } from "@apollo/client";

const TOKEN_FIELDS = `
  adventurerId
  freeGameRevealed
  freeGameUsed
  gameOwnerAddress
  nftOwnerAddress
  token
  tokenId
`;

const TOKENS_FRAGMENT = `
  fragment TokenFields on TokenWithFreeGameStatus {
    ${TOKEN_FIELDS}
  }
`;

const getGamesByNftOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_tokens_by_owner($ownerAddress: HexValue) {
    tokensWithFreeGameStatus(
      where: { nftOwnerAddress: { eq: $ownerAddress } }
      limit: 100000
    ) {
      ...TokenFields
    }
  }
`;

const getGamesByGameOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_tokens_by_owner($ownerAddress: HexValue) {
    tokensWithFreeGameStatus(
      where: { gameOwnerAddress: { eq: $ownerAddress } }
      limit: 100000
    ) {
      ...TokenFields
    }
  }
`;

export { getGamesByNftOwner, getGamesByGameOwner };
