import { ethers } from "ethers";
import { sample } from "lodash";
import { NetworkMetadata } from "lib/wallets";
import { isDevelopment } from "./env";

const { parseEther } = ethers.utils;

export const MAINNET = 56;
export const TESTNET = 97;
export const ETH_MAINNET = 1;
export const AVALANCHE = 43114;
export const AVALANCHE_FUJI = 43113;
export const ARBITRUM = 42161;
export const ARBITRUM_TESTNET = 421611;
export const TELOS_TESTNET = 41;



// TODO take it from web3
export const DEFAULT_CHAIN_ID = TELOS_TESTNET;
export const CHAIN_ID = DEFAULT_CHAIN_ID;

export const SUPPORTED_CHAIN_IDS = [TELOS_TESTNET];

if (isDevelopment()) {
  SUPPORTED_CHAIN_IDS.push(ARBITRUM_TESTNET, AVALANCHE_FUJI, TELOS_TESTNET);
}

export const IS_NETWORK_DISABLED = {
  [ARBITRUM]: true,
  [AVALANCHE]: true,
  [TELOS_TESTNET]: false,
};

export const CHAIN_NAMES_MAP = {
  [MAINNET]: "BSC",
  [TESTNET]: "BSC Testnet",
  [ARBITRUM_TESTNET]: "ArbRinkeby",
  [ARBITRUM]: "Arbitrum",
  [AVALANCHE]: "Avalanche",
  [AVALANCHE_FUJI]: "Avalanche Fuji",
  [TELOS_TESTNET]: "Telos Testnet",
};

export const GAS_PRICE_ADJUSTMENT_MAP = {
  [ARBITRUM]: "0",
  [AVALANCHE]: "3000000000", // 3 gwei
  [TELOS_TESTNET]: "0", // 3 gwei
};

export const MAX_GAS_PRICE_MAP = {
  [AVALANCHE]: "200000000000", // 200 gwei
};

export const HIGH_EXECUTION_FEES_MAP = {
  [ARBITRUM]: 3, // 3 USD
  [AVALANCHE]: 3, // 3 USD
  [TELOS_TESTNET]: 3, // 3 USD
};

const constants = {
  [MAINNET]: {
    nativeTokenSymbol: "BNB",
    defaultCollateralSymbol: "BUSD",
    defaultFlagOrdersEnabled: false,
    positionReaderPropsLength: 8,
    v2: false,
  },

  [TESTNET]: {
    nativeTokenSymbol: "BNB",
    defaultCollateralSymbol: "BUSD",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 8,
    v2: false,
  },

  [ARBITRUM_TESTNET]: {
    nativeTokenSymbol: "ETH",
    wrappedTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: false,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.000300001"),
  },

  [ARBITRUM]: {
    nativeTokenSymbol: "ETH",
    wrappedTokenSymbol: "WETH",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: false,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.000300001"),
  },

  [AVALANCHE]: {
    nativeTokenSymbol: "AVAX",
    wrappedTokenSymbol: "WAVAX",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  },

  [AVALANCHE_FUJI]: {
    nativeTokenSymbol: "AVAX",
    wrappedTokenSymbol: "WAVAX",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: true,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.01"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0100001"),
  },
  [TELOS_TESTNET]: {
    nativeTokenSymbol: "TLOS",
    wrappedTokenSymbol: "WTLOS",
    defaultCollateralSymbol: "USDC",
    defaultFlagOrdersEnabled: false,
    positionReaderPropsLength: 9,
    v2: true,

    SWAP_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    INCREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.0003"),
    // contract requires that execution fee be strictly greater than instead of gte
    DECREASE_ORDER_EXECUTION_GAS_FEE: parseEther("0.000300001"),
  },
};

const ALCHEMY_WHITELISTED_DOMAINS = ["gmx.io", "app.gmx.io"];

export const RPC_PROVIDERS = {
  [ETH_MAINNET]: ["https://rpc.ankr.com/eth"],
  [MAINNET]: [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed3.defibit.io",
    "https://bsc-dataseed4.defibit.io",
    "https://bsc-dataseed2.ninicoin.io",
    "https://bsc-dataseed3.ninicoin.io",
    "https://bsc-dataseed4.ninicoin.io",
    "https://bsc-dataseed1.binance.org",
    "https://bsc-dataseed2.binance.org",
    "https://bsc-dataseed3.binance.org",
    "https://bsc-dataseed4.binance.org",
  ],
  [TESTNET]: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
  [ARBITRUM]: [getDefaultArbitrumRpcUrl()],
  [ARBITRUM_TESTNET]: ["https://rinkeby.arbitrum.io/rpc"],
  [AVALANCHE]: ["https://api.avax.network/ext/bc/C/rpc"],
  [AVALANCHE_FUJI]: ["https://api.avax-test.network/ext/bc/C/rpc"],
  [TELOS_TESTNET]: ["https://testnet.telos.net/evm"],

};

export const FALLBACK_PROVIDERS = {
  [ARBITRUM]: [getAlchemyHttpUrl()],
  [AVALANCHE]: ["https://avax-mainnet.gateway.pokt.network/v1/lb/626f37766c499d003aada23b"],
  [TELOS_TESTNET]: ["https://testnet.telos.net/evm"],
};

export const NETWORK_METADATA: { [chainId: number]: NetworkMetadata } = {
  [MAINNET]: {
    chainId: "0x" + MAINNET.toString(16),
    chainName: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[MAINNET],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  [TESTNET]: {
    chainId: "0x" + TESTNET.toString(16),
    chainName: "BSC Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[TESTNET],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
  [ARBITRUM_TESTNET]: {
    chainId: "0x" + ARBITRUM_TESTNET.toString(16),
    chainName: "Arbitrum Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[ARBITRUM_TESTNET],
    blockExplorerUrls: ["https://rinkeby-explorer.arbitrum.io/"],
  },
  [ARBITRUM]: {
    chainId: "0x" + ARBITRUM.toString(16),
    chainName: "Arbitrum",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[ARBITRUM],
    blockExplorerUrls: [getExplorerUrl(ARBITRUM)],
  },
  [AVALANCHE]: {
    chainId: "0x" + AVALANCHE.toString(16),
    chainName: "Avalanche",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[AVALANCHE],
    blockExplorerUrls: [getExplorerUrl(AVALANCHE)],
  },
  [AVALANCHE_FUJI]: {
    chainId: "0x" + AVALANCHE_FUJI.toString(16),
    chainName: "Avalanche Fuji",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: RPC_PROVIDERS[AVALANCHE_FUJI],
    blockExplorerUrls: [getExplorerUrl(AVALANCHE_FUJI)],
  },
  [TELOS_TESTNET]: {
    chainId: "0x" + TELOS_TESTNET.toString(16),
    chainName: "Telos Testnet",
    nativeCurrency: {
      name: "TLOS",
      symbol: "TLOS",
      decimals: 18,
    },
    rpcUrls: ["https://testnet.telos.net/evm"],
    blockExplorerUrls: ["https://testnet.teloscan.io/"],
  },
};

export const CHAIN_ICONS = {
  [ARBITRUM]: {
    16: "ic_arbitrum_16.svg",
    24: "ic_arbitrum_24.svg",
    96: "ic_arbitrum_96.svg",
  },
  [AVALANCHE]: {
    16: "ic_avalanche_16.svg",
    24: "ic_avalanche_24.svg",
    96: "ic_avalanche_96.svg",
  },
  [ARBITRUM_TESTNET]: {
    16: "ic_arbitrum_16.svg",
    24: "ic_arbitrum_24.svg",
    96: "ic_arbitrum_96.svg",
  },
  [AVALANCHE_FUJI]: {
    16: "ic_avalanche_testnet_16.svg",
    24: "ic_avalanche_testnet_24.svg",
    96: "ic_avalanche_testnet_96.svg",
  },
  [TELOS_TESTNET]: {
    16: "ic_tlos_16.svg",
    24: "ic_tlos_24.svg",
    96: "ic_tlos_96.svg",
  },
};

export const getConstant = (chainId: number, key: string) => {
  if (!constants[chainId]) {
    throw new Error(`Unsupported chainId ${chainId}`);
  }

  if (!(key in constants[chainId])) {
    throw new Error(`Key ${key} does not exist for chainId ${chainId}`);
  }

  return constants[chainId][key];
};

export function getChainName(chainId: number) {
  return CHAIN_NAMES_MAP[chainId];
}

export function getChainIcon(chainId: number, size: 16 | 24 | 96 | 41): string | undefined {
  return CHAIN_ICONS[chainId]?.[size];
}

export function getDefaultArbitrumRpcUrl() {
  return "https://arb1.arbitrum.io/rpc";
}

export function getRpcUrl(chainId: number): string | undefined {
  return sample(RPC_PROVIDERS[chainId]);
}

export function getFallbackRpcUrl(chainId: number): string | undefined {
  return sample(FALLBACK_PROVIDERS[chainId]);
}

export function getAlchemyHttpUrl() {
  if (ALCHEMY_WHITELISTED_DOMAINS.includes(window.location.host)) {
    return "https://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ";
  }
  return "https://arb-mainnet.g.alchemy.com/v2/EmVYwUw0N2tXOuG0SZfe5Z04rzBsCbr2";
}

export function getAlchemyWsUrl() {
  if (ALCHEMY_WHITELISTED_DOMAINS.includes(window.location.host)) {
    return "wss://arb-mainnet.g.alchemy.com/v2/ha7CFsr1bx5ZItuR6VZBbhKozcKDY4LZ";
  }
  return "wss://arb-mainnet.g.alchemy.com/v2/EmVYwUw0N2tXOuG0SZfe5Z04rzBsCbr2";
}

export function getExplorerUrl(chainId) {
  if (chainId === 3) {
    return "https://ropsten.etherscan.io/";
  } else if (chainId === 42) {
    return "https://kovan.etherscan.io/";
  } else if (chainId === MAINNET) {
    return "https://bscscan.com/";
  } else if (chainId === TESTNET) {
    return "https://testnet.bscscan.com/";
  } else if (chainId === ARBITRUM_TESTNET) {
    return "https://testnet.arbiscan.io/";
  } else if (chainId === ARBITRUM) {
    return "https://arbiscan.io/";
  } else if (chainId === AVALANCHE) {
    return "https://snowtrace.io/";
  } else if (chainId === TELOS_TESTNET) {
    return "https://testnet.teloscan.io/";
  } else if (chainId === AVALANCHE_FUJI) {
    return "https://testnet.snowtrace.io/";
  }
  return "https://etherscan.io/";
}

export function getHighExecutionFee(chainId) {
  return HIGH_EXECUTION_FEES_MAP[chainId] || 3;
}

export function isSupportedChain(chainId) {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}
