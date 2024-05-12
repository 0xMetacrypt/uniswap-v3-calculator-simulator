import React, { FC, useEffect, useRef } from "react";

import { getTickFromPrice } from "@/hooks/uniswap-v3/liquidityMath";
import { Pool, Tick, Token, ZoomLevels } from "@/hooks/uniswap-v3/types";

import D3LiquidityHistogram, { Bin } from "./Histogram";

let d3Chart: D3LiquidityHistogram | null = null;
export const height = 300;

interface IChart {
  rawTicks: Tick[];
  token0: Token;
  token1: Token;
  pool: Pool;
  zoomLevel: ZoomLevels;
  liqStart: number;
  liqEnd: number;
  priceMin: number;
  priceMax: number;
}

export const LiquidityDistributionChart: FC<IChart> = ({
  rawTicks,
  token0,
  token1,
  pool,
  zoomLevel,
  liqStart,
  liqEnd,
  priceMin,
  priceMax,
}) => {
  const refElement = useRef<HTMLDivElement>(null);

  const processData = (ticks: Tick[], minTick: number, maxTick: number): Bin[] => {
    const bins: Bin[] = [];
    let liquidity = 0;
    for (let i = 0; i < ticks.length - 1; i += 1) {
      liquidity += Number(ticks[i].liquidityNet);

      const lowerTick = Number(ticks[i].tickIdx);
      const upperTick = Number(ticks[i + 1].tickIdx);

      if (upperTick > minTick && lowerTick < maxTick) {
        bins.push({
          x0: Number(ticks[i].tickIdx),
          x1: Number(ticks[i + 1].tickIdx),
          y: liquidity,
        });
      }
    }
    return bins;
  };

  useEffect(() => {
    const width = refElement.current?.offsetWidth || 500;

    if (d3Chart) d3Chart.destroy();

    const currentPrice = Number(pool.token0Price);

    const minPrice = currentPrice * zoomLevel.initialMin;
    const maxPrice = currentPrice * zoomLevel.initialMax;

    const currentTick = getTickFromPrice(currentPrice, token0.decimals, token1.decimals);

    const minTick = getTickFromPrice(minPrice, token0.decimals, token1.decimals);
    const maxTick = getTickFromPrice(maxPrice, token0.decimals, token1.decimals);

    const priceMinTick = getTickFromPrice(priceMin, token0.decimals, token1.decimals);
    const priceMaxTick = getTickFromPrice(priceMax, token0.decimals, token1.decimals);

    const ticks = [minTick, maxTick].sort((a, b) => a - b);

    const token0Symbol = token0?.symbol;
    const token1Symbol = token1?.symbol;

    d3Chart = new D3LiquidityHistogram(refElement.current, {
      width,
      height,
      minTick: ticks[0],
      maxTick: ticks[1],
      currentTick,
      token0Symbol,
      token1Symbol,
      token0Decimal: token0.decimals,
      token1Decimal: token1.decimals,
      data: processData(rawTicks, ticks[0], ticks[1]),
      priceMin: priceMinTick,
      priceMax: priceMaxTick,
    });

    return () => {
      d3Chart?.destroy();
    };
  }, [
    pool.token0Price,
    priceMax,
    priceMin,
    rawTicks,
    token0.decimals,
    token0?.symbol,
    token1.decimals,
    token1?.symbol,
    zoomLevel.initialMax,
    zoomLevel.initialMin,
  ]);

  useEffect(() => {
    if (!d3Chart) return;
    if (!token0 || !token1) return;

    d3Chart.updateCurrentTick(getTickFromPrice(Number(pool.token0Price), token0.decimals, token1.decimals));
  }, [pool, token0, token1]);

  useEffect(() => {
    if (!d3Chart) return;
    if (!token0 || !token1) return;

    d3Chart.updateMinMaxTickRange(
      getTickFromPrice(liqStart, token0.decimals, token1.decimals),
      getTickFromPrice(liqEnd, token0.decimals, token1.decimals),
    );
  }, [liqEnd, liqStart, token0, token1]);

  useEffect(() => {
    if (!d3Chart) return;
    if (!token0 || !token1) return;

    d3Chart.updatePriceMinMaxTickRange(
      getTickFromPrice(priceMin, token0.decimals, token1.decimals),
      getTickFromPrice(priceMax, token0.decimals, token1.decimals),
    );
  }, [priceMin, priceMax, token0, token1]);

  return <div ref={refElement} />;
};
