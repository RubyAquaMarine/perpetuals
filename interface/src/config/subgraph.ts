import { ARBITRUM, AVALANCHE, TELOS_TESTNET } from "./chains";

export const SUBGRAPH_URLS = {
  [ARBITRUM]: {
    stats: "",
    referrals: "http://207.154.248.98:8000/subgraphs/name/perpetuals-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },

  [AVALANCHE]: {
    stats: "",
    referrals: "http://207.154.248.98:8000/subgraphs/name/perpetuals-referrals",
  },

  [TELOS_TESTNET]: {
    stats: "",
    referrals: "http://207.154.248.98:8000/subgraphs/name/perpetuals-referrals",
  },

  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
  },
};
