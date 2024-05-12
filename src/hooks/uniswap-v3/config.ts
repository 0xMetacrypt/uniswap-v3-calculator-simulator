import { UniswapTiers } from "./types";

export type IUniNetworks = "ethereum" | "polygon" | "optimism" | "arbitrum" | "bsc";

export const defaultUniNetwork: IUniNetworks = "ethereum";

interface IUniNetworkConfig {
  name: string;
  graphql: string;
  logo: string;
  defaultTokens: [string, string];
  defaultFeeTier: UniswapTiers;
  getTokenImage: (token: string) => string;
}

export const UniswapNetworks: { [x in IUniNetworks]: IUniNetworkConfig } = {
  ethereum: {
    name: "Ethereum Network",
    graphql: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    logo: "https://artifacts.metacrypt.org/assets/logos/networks/ethereum.svg",
    defaultTokens: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
    defaultFeeTier: UniswapTiers.v3000,
    getTokenImage: (token: string) => `https://cdn.statically.io/gh/trustwallet/assets/master/blockchains/ethereum/assets/${token}/logo.png`,
  },
  polygon: {
    name: "Polygon PoS Network",
    graphql: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
    logo: "https://artifacts.metacrypt.org/assets/logos/networks/polygon.svg",
    defaultTokens: ["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"],
    defaultFeeTier: UniswapTiers.v3000,
    getTokenImage: (token: string) => `https://cdn.statically.io/gh/trustwallet/assets/master/blockchains/polygon/assets/${token}/logo.png`,
  },
  optimism: {
    name: "Optimism L2 Network",
    graphql: "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
    logo: "https://artifacts.metacrypt.org/assets/logos/networks/optimism.svg",
    defaultTokens: ["0x4200000000000000000000000000000000000006", "0x7f5c764cbc14f9669b88837ca1490cca17c31607"],
    defaultFeeTier: UniswapTiers.v3000,
    getTokenImage: (token: string) => `https://cdn.statically.io/gh/trustwallet/assets/master/blockchains/optimism/assets/${token}/logo.png`,
  },
  arbitrum: {
    name: "Arbitrum L2 Network",
    graphql: "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal",
    logo: "https://artifacts.metacrypt.org/assets/logos/networks/arbitrum.svg",
    defaultTokens: ["0x82af49447d8a07e3bd95bd0d56f35241523fbab1", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"],
    defaultFeeTier: UniswapTiers.v3000,
    getTokenImage: (token: string) => `https://cdn.statically.io/gh/trustwallet/assets/master/blockchains/arbitrum/assets/${token}/logo.png`,
  },
  bsc: {
    name: "Binance Smart Chain",
    graphql: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc",
    logo: "https://artifacts.metacrypt.org/assets/logos/networks/binance.svg",
    defaultTokens: ["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0xe9e7cea3dedca5984780bafc599bd69add087d56"],
    defaultFeeTier: UniswapTiers.v3000,
    getTokenImage: (token: string) => `https://cdn.statically.io/gh/trustwallet/assets/master/blockchains/binance/assets/${token}/logo.png`,
  },
};
