/* eslint-disable new-cap */
import bn from "bignumber.js";

import { Tick, UniswapTiers } from "./types";

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// MATH
export const encodePriceSqrt = (price: number | string | bn): bn =>
  new bn(price).sqrt().multipliedBy(new bn(2).pow(96)).integerValue(3);

export function expandDecimals(n: number | string | bn, exp: number): bn {
  return new bn(n).multipliedBy(new bn(10).pow(exp));
}

export const calculateAvg = (data: number[]): number => data.reduce((result, val) => result + val, 0) / data.length;

export const findMax = (data: number[]): number => data.reduce((max, val) => (max > val ? max : val), 0);

export const findMin = (data: number[]): number =>
  data.reduce((min, val) => (min > val ? val : min), Number.MAX_SAFE_INTEGER);

const mulDiv = (a: bn, b: bn, multiplier: bn) => a.multipliedBy(b).div(multiplier);

// Uniswap
export const getTickFromPrice = (price: number, token0Decimal: string, token1Decimal: string): number => {
  const token0 = expandDecimals(price, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  const sqrtPrice = mulDiv(encodePriceSqrt(token1), new bn(2).pow(96), encodePriceSqrt(token0)).div(new bn(2).pow(96));

  return Math.log(sqrtPrice.toNumber()) / Math.log(Math.sqrt(1.0001));
};

export const getPriceFromTick = (tick: number, token0Decimal: string, token1Decimal: string): number => {
  const sqrtPrice = new bn(Math.sqrt(1.0001) ** tick).multipliedBy(new bn(2).pow(96));
  const token0 = expandDecimals(1, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  const L2 = mulDiv(encodePriceSqrt(token0), encodePriceSqrt(token1), new bn(2).pow(96));
  const price = mulDiv(L2, new bn(2).pow(96), sqrtPrice)
    .div(new bn(2).pow(96))
    .div(new bn(10).pow(token0Decimal))
    .pow(2);

  return price.toNumber();
};

// for calculation detail, please visit README.md (Section: Calculation Breakdown, No. 1)
export const getTokenAmountsFromDepositAmounts = (
  P: number,
  Pl: number,
  Pu: number,
  priceUSDX: number,
  priceUSDY: number,
  targetAmounts: number,
) => {
  const deltaL =
    targetAmounts / ((Math.sqrt(P) - Math.sqrt(Pl)) * priceUSDY + (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu)) * priceUSDX);

  let deltaY = deltaL * (Math.sqrt(P) - Math.sqrt(Pl));
  if (deltaY * priceUSDY < 0) deltaY = 0;
  if (deltaY * priceUSDY > targetAmounts) deltaY = targetAmounts / priceUSDY;

  let deltaX = deltaL * (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu));
  if (deltaX * priceUSDX < 0) deltaX = 0;
  if (deltaX * priceUSDX > targetAmounts) deltaX = targetAmounts / priceUSDX;

  return { amount0: deltaX, amount1: deltaY };
};

// for calculation detail, please visit README.md (Section: Calculation Breakdown, No. 2)
const getLiquidityForAmount0 = (sqrtRatioAX96: bn, sqrtRatioBX96: bn, amount0: bn): bn => {
  // amount0 * (sqrt(upper) * sqrt(lower)) / (sqrt(upper) - sqrt(lower))
  const intermediate = mulDiv(sqrtRatioBX96, sqrtRatioAX96, new bn(2).pow(96));
  return mulDiv(amount0, intermediate, sqrtRatioBX96.minus(sqrtRatioAX96));
};

const getLiquidityForAmount1 = (sqrtRatioAX96: bn, sqrtRatioBX96: bn, amount1: bn): bn =>
  // amount1 / (sqrt(upper) - sqrt(lower))
  mulDiv(amount1, new bn(2).pow(96), sqrtRatioBX96.minus(sqrtRatioAX96));
export const getSqrtPriceX96 = (price: number, token0Decimal: string, token1Decimal: string): bn => {
  const token0 = expandDecimals(price, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  // return mulDiv(encodePriceSqrt(token1), Q96, encodePriceSqrt(token0)).div(
  //   new bn(2).pow(96)
  // );
  return token0.div(token1).sqrt().multipliedBy(new bn(2).pow(96));
};

export const getLiquidityForAmounts = (
  sqrtRatioX96: bn,
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  _amount0: number,
  amount0Decimal: number,
  _amount1: number,
  amount1Decimal: number,
): bn => {
  const amount0 = expandDecimals(_amount0, amount0Decimal);
  const amount1 = expandDecimals(_amount1, amount1Decimal);

  let liquidity: bn;
  if (sqrtRatioX96.lte(sqrtRatioAX96)) {
    liquidity = getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
  } else if (sqrtRatioX96.lt(sqrtRatioBX96)) {
    const liquidity0 = getLiquidityForAmount0(sqrtRatioX96, sqrtRatioBX96, amount0);
    const liquidity1 = getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioX96, amount1);

    liquidity = bn.min(liquidity0, liquidity1);
  } else {
    liquidity = getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
  }

  return liquidity;
};

export const calculateFee = (liquidityDelta: bn, liquidity: bn, volume24H: number, _feeTier: UniswapTiers): number => {
  const feeTier = parseFloat(_feeTier) / 10000 / 100;
  const liquidityPercentage = liquidityDelta.div(liquidity.plus(liquidityDelta)).toNumber();

  return feeTier * volume24H * liquidityPercentage;
};

export const calculateLiquidity = (ticks: Tick[], currentTick: number): bn => {
  if (ticks.length <= 1) return new bn(0);
  let liquidity: bn = new bn(0);
  for (let i = 0; i < ticks.length - 1; i += 1) {
    liquidity = liquidity.plus(new bn(ticks[i].liquidityNet));

    const lowerTick = Number(ticks[i].tickIdx);
    const upperTick = Number(ticks[i + 1].tickIdx);

    if (lowerTick <= currentTick && currentTick <= upperTick) {
      break;
    }
  }

  return liquidity;
};
