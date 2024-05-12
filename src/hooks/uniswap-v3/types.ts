export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Token = {
  id: Scalars["ID"];
  symbol: Scalars["String"];
  name: Scalars["String"];
  decimals: Scalars["BigInt"];
  totalSupply: Scalars["BigInt"];
  volumeUSD: Scalars["BigDecimal"];
  feesUSD: Scalars["BigDecimal"];
  totalValueLockedUSD: Scalars["BigDecimal"];
  derivedETH: Scalars["BigDecimal"];
};

export type Pool = {
  id: Scalars["ID"];
  feeTier: UniswapTiers;
  liquidity: Scalars["BigInt"];
  sqrtPrice: Scalars["BigInt"];
  token0Price: Scalars["BigDecimal"];
  token1Price: Scalars["BigDecimal"];
  volumeUSD: Scalars["BigDecimal"];
  feesUSD: Scalars["BigDecimal"];
  totalValueLockedToken0: Scalars["BigDecimal"];
  totalValueLockedToken1: Scalars["BigDecimal"];
  tick: Scalars["String"];
};

export type Tick = {
  id: Scalars["ID"];
  tickIdx: Scalars["BigInt"];
  liquidityNet: Scalars["BigInt"];
  price0: Scalars["BigDecimal"];
  price1: Scalars["BigDecimal"];
  // volumeToken0: Scalars['BigDecimal'];
  // volumeToken1: Scalars['BigDecimal'];
  // volumeUSD: Scalars['BigDecimal'];
  // untrackedVolumeUSD: Scalars['BigDecimal'];
  // feesUSD: Scalars['BigDecimal'];
  // collectedFeesToken0: Scalars['BigDecimal'];
  // collectedFeesToken1: Scalars['BigDecimal'];
  // collectedFeesUSD: Scalars['BigDecimal'];
  // createdAtTimestamp: Scalars['BigInt'];
  // createdAtBlockNumber: Scalars['BigInt'];
  // liquidityProviderCount: Scalars['BigInt'];
  // feeGrowthOutside0X128: Scalars['BigInt'];
  // feeGrowthOutside1X128: Scalars['BigInt'];
};

export enum UniswapTiers {
  v100 = "100",
  v500 = "500",
  v3000 = "3000",
  v10000 = "10000",
}

export interface ZoomLevels {
  initialMin: number;
  initialMax: number;
  min: number;
  max: number;
}

export const ZOOM_LEVELS: Record<UniswapTiers, ZoomLevels> = {
  [UniswapTiers.v100]: {
    initialMin: 0.95,
    initialMax: 1.05,
    min: 0.00001,
    max: 1.5,
  },
  [UniswapTiers.v500]: {
    initialMin: 0.75,
    initialMax: 1.25,
    min: 0.00001,
    max: 1.5,
  },
  [UniswapTiers.v3000]: {
    initialMin: 0.25,
    initialMax: 1.75,
    min: 0.00001,
    max: 20,
  },
  [UniswapTiers.v10000]: {
    initialMin: 0.25,
    initialMax: 1.75,
    min: 0.00001,
    max: 20,
  },
};

export const sortToken = (token0: string, token1: string): string[] => {
  if (token0 < token1) {
    return [token0, token1];
  }
  return [token1, token0];
};
