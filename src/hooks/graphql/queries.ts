import { gql } from "@apollo/client";

// const TOKEN_FIELDS = `
//   adventurerId
//   freeGameRevealed
//   freeGameUsed
//   gameOwnerAddress
//   nftOwnerAddress
//   token
//   tokenId
// `;

const TOKEN_FIELDS = `
    nftOwnerAddress
    timestamp
    token
    tokenId
    hash
`;

const FREE_GAME_FIELDS = `
  adventurerId
  gameOwnerAddress
  revealed
  tokenId
  token
  hash
`;

const TOKENS_FRAGMENT = `
    fragment TokenFields on Token {
      ${TOKEN_FIELDS}
    }
`;

const FREE_GAME_FRAGMENT = `
  fragment FreeGameFields on ClaimedFreeGame {
    ${FREE_GAME_FIELDS}
  }
`;

// const getGamesByNftOwner = gql`
//   ${TOKENS_FRAGMENT}
//   query get_tokens_by_owner($ownerAddress: HexValue) {
//     tokensWithFreeGameStatus(
//       where: { nftOwnerAddress: { eq: $ownerAddress } }
//       limit: 100000
//     ) {
//       ...TokenFields
//     }
//   }
// `;

const getTokensByNftOwner = gql`
  ${TOKENS_FRAGMENT}
  query get_tokens_by_owner($ownerAddress: HexValue) {
    tokens(where: { nftOwnerAddress: { eq: $ownerAddress } }, limit: 100000) {
      ...TokenFields
    }
  }
`;

const getGamesByTokens = gql`
  ${FREE_GAME_FRAGMENT}
  query get_games_by_owner($hashList: [String!]) {
    claimedFreeGames(where: { hash: { In: $hashList } }, limit: 100000) {
      ...FreeGameFields
    }
  }
`;

const getGamesByGameOwner = gql`
  ${FREE_GAME_FRAGMENT}
  query get_games_by_owner($ownerAddress: HexValue) {
    claimedFreeGames(
      where: { gameOwnerAddress: { eq: $ownerAddress }, token: { gt: "0x0" } }
      limit: 100000
    ) {
      ...FreeGameFields
    }
  }
`;

export { getTokensByNftOwner, getGamesByTokens, getGamesByGameOwner };
