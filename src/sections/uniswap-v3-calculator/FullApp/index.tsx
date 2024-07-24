"use client";

import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";

import Slider from "@mui/material/Slider";
import { FaGithub } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { VscLoading } from "react-icons/vsc";

import { Container } from "@/components/layout/Container";
import {
  LiquidityDistributionChart,
  height as chartHeight,
} from "@/components/UniswapV3Calculator/LiquidityDistribution";
import { colors as chartColors } from "@/components/UniswapV3Calculator/LiquidityDistribution/Histogram";
import { NetworkSelector } from "@/components/UniswapV3Calculator/NetworkSelector";
import { SingleFeeTier } from "@/components/UniswapV3Calculator/SingleFeeTier";
import { SingleROI } from "@/components/UniswapV3Calculator/SingleROI";
import { SingleTokenDisplay } from "@/components/UniswapV3Calculator/SingleTokenDisplay";
import { TokenSelector } from "@/components/UniswapV3Calculator/TokenSelector";
import { IUniNetworks, UniswapNetworks } from "@/hooks/uniswap-v3/config";
import {
  calculateFee,
  calculateLiquidity,
  getLiquidityForAmounts,
  getSqrtPriceX96,
  getTickFromPrice,
  getTokenAmountsFromDepositAmounts,
} from "@/hooks/uniswap-v3/liquidityMath";
import { sortToken, UniswapTiers, ZOOM_LEVELS } from "@/hooks/uniswap-v3/types";
import { useEtherPrice } from "@/hooks/uniswap-v3/useEtherPrice";
import { usePoolForPair } from "@/hooks/uniswap-v3/usePoolForPair";
import { usePoolVolume } from "@/hooks/uniswap-v3/usePoolVolume";
import { useTicksForPool } from "@/hooks/uniswap-v3/useTicksForPool";
import { useUniswapTokens } from "@/hooks/uniswap-v3/useUniswapTokens";

const SingleFAQ: FC<{ title: string; text: string | ReactNode }> = ({ title, text }) => (
  <div className="py-8">
    <p className="text-xl font-bold text-gray-900">{title}</p>
    <p className="text-md mt-4 space-y-2 font-normal text-gray-600">{text}</p>
  </div>
);

export function FullApp() {
  const [uniNetwork, setUniNetwork] = useState<IUniNetworks>("ethereum");
  const [depositAmount, setDepositAmount] = useState(1000);
  const [tokenSet, setTokenSet] = useState<[string, string]>(UniswapNetworks[uniNetwork].defaultTokens);
  const [feeTier, setFeeTier] = useState<UniswapTiers>(UniswapNetworks[uniNetwork].defaultFeeTier);

  const { data: tokenData, isLoading: tokenDataLoading } = useUniswapTokens(uniNetwork);

  const sortedTokens = useMemo(() => sortToken(...tokenSet), [tokenSet]);

  const [hasTokensChanged, setHasTokensChanged] = useState(false);

  const tokenData0 = useMemo(
    () => (tokenData ? tokenData.find((e) => e.id === sortedTokens[0].toLowerCase()) : undefined),
    [tokenData, sortedTokens],
  );
  const tokenData1 = useMemo(
    () => (tokenData ? tokenData.find((e) => e.id === sortedTokens[1].toLowerCase()) : undefined),
    [tokenData, sortedTokens],
  );

  const [priceRange, setPriceRange] = useState<number[]>([0, 0]);

  const { data: poolsData } = usePoolForPair(uniNetwork, sortedTokens[0], sortedTokens[1]);

  const totalLiquidity = useMemo(
    () => poolsData?.reduce((a, b) => a + Number(b.totalValueLockedToken0), 0) || 0,
    [poolsData],
  );

  useEffect(() => {
    if (hasTokensChanged) {
      const liqMax = Math.max(...(poolsData?.map((e) => Number(e.totalValueLockedToken0)) || []));

      setFeeTier(
        UniswapTiers[
          `v${poolsData?.find((e) => Number(e.totalValueLockedToken0) === liqMax)?.feeTier}` as keyof typeof UniswapTiers
        ],
      );
    }
  }, [hasTokensChanged, poolsData]);

  const selectedPool = useMemo(() => poolsData?.find((e) => e.feeTier === feeTier), [poolsData, feeTier]);
  const zoomLevel = useMemo(() => ZOOM_LEVELS[selectedPool?.feeTier || 3000], [selectedPool?.feeTier]);

  const { data: ticksData, isLoading: isTicksLoading } = useTicksForPool(uniNetwork, selectedPool?.id || "");

  const { data: etherPrice = 1 } = useEtherPrice(uniNetwork);
  const { data: poolVolumeData } = usePoolVolume(uniNetwork, selectedPool?.id!);

  useEffect(() => {
    setPriceRange([
      Math.min(selectedPool?.token0Price, poolVolumeData?.priceMin || 0) * 0.99,
      Math.max(poolVolumeData?.priceMax || 0, selectedPool?.token0Price) * 1.01,
    ]);
  }, [poolVolumeData?.priceMax, poolVolumeData?.priceMin, selectedPool?.token0Price]);

  const { fee } = useMemo(() => {
    const P = Number(selectedPool?.token0Price ?? 0);
    const Pl = priceRange[0];
    const Pu = priceRange[1];
    const priceUSDX = (tokenData1?.derivedETH ?? 0) * etherPrice ?? 1 ?? 1;
    const priceUSDY = (tokenData0?.derivedETH ?? 0) * etherPrice ?? 1 ?? 1;

    const targetAmounts = depositAmount;

    const { amount0, amount1 } = getTokenAmountsFromDepositAmounts(P, Pl, Pu, priceUSDX, priceUSDY, targetAmounts);

    const sqrtRatioX96 = getSqrtPriceX96(P, tokenData0?.decimals || "18", tokenData1?.decimals || "18");
    const sqrtRatioAX96 = getSqrtPriceX96(Pl, tokenData0?.decimals || "18", tokenData1?.decimals || "18");
    const sqrtRatioBX96 = getSqrtPriceX96(Pu, tokenData0?.decimals || "18", tokenData1?.decimals || "18");

    const deltaL = getLiquidityForAmounts(
      sqrtRatioX96,
      sqrtRatioAX96,
      sqrtRatioBX96,
      amount0,
      Number(tokenData1?.decimals || 18),
      amount1,
      Number(tokenData0?.decimals || 18),
    );

    const currentTick = getTickFromPrice(P, tokenData0?.decimals || "18", tokenData1?.decimals || "18");

    const L = calculateLiquidity(ticksData || [], currentTick);
    const feeTierX = selectedPool?.feeTier ?? UniswapTiers.v3000;

    const feeX = P < Pl || P > Pu ? 0 : calculateFee(deltaL, L, poolVolumeData?.volume7dUSD ?? 0, feeTierX);

    return {
      fee: feeX,
      amount0,
      amount1,
    };
  }, [
    depositAmount,
    etherPrice,
    poolVolumeData?.volume7dUSD,
    priceRange,
    selectedPool?.feeTier,
    selectedPool?.token0Price,
    ticksData,
    tokenData0?.decimals,
    tokenData0?.derivedETH,
    tokenData1?.decimals,
    tokenData1?.derivedETH,
  ]);

  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [tokenSwitchSelector, setTokenSwitchSelector] = useState<string>("");

  const changeToken = (which?: string) => {
    setTokenSwitchSelector(which!);
    setShowTokenSelector(true);
  };

  const acceptChangeToken = (tokenId: string) => {
    setTokenSet((e) => e.map((f) => (f === tokenSwitchSelector ? tokenId : f)) as [string, string]);
    setHasTokensChanged(true);
    setShowTokenSelector(false);
  };

  const onNetworkChange = (network: IUniNetworks) => {
    const selectedNetwork = UniswapNetworks[network];

    setUniNetwork(network);
    setTokenSet(selectedNetwork.defaultTokens);
    setFeeTier(selectedNetwork.defaultFeeTier);
  };

  return (
    <section className="relative w-full bg-slate-50">
      <Container className="my-12 max-w-3xl space-y-4 rounded-xl">
        <TokenSelector
          network={uniNetwork}
          show={showTokenSelector}
          onClose={() => setShowTokenSelector(false)}
          excluded={tokenSet}
          onChange={acceptChangeToken}
        />
        <div className="mx-auto mt-4 max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white px-5 py-3">
          <div>
            <div className="mb-1 text-sm">Select Network</div>
            <div className="flex">
              <NetworkSelector
                currentNetwork={uniNetwork}
                onChange={onNetworkChange}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm">Select Pair</div>
            <div className="flex space-x-2">
              <div className="flex-grow">
                <div className="grid gap-2 md:grid-cols-2">
                  <SingleTokenDisplay
                    network={uniNetwork}
                    token={tokenData0?.id}
                    onChange={() => changeToken(tokenData0?.id)}
                  />
                  <SingleTokenDisplay
                    network={uniNetwork}
                    token={tokenData1?.id}
                    onChange={() => changeToken(tokenData1?.id)}
                  />
                </div>
              </div>
              {/* <div className="rounded-lg justify-between p-2 bg-white border border-gray-200 hover:border-gray-400 transition-all duration-300 cursor-pointer">
              <div className="p-1">
                <MdCompareArrows className="text-gray-600 w-6 h-6" />
              </div>
            </div> */}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm">Select Fee Tier</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {Object.values(UniswapTiers).map((e) => (
                <SingleFeeTier
                  v={e}
                  key={e}
                  pool={poolsData?.find((f) => f.feeTier === e)}
                  currentTier={feeTier!}
                  totalLiquidity={totalLiquidity}
                  applyTier={() => setFeeTier(e)}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm">Deposit Amount</div>
            <div className="relative rounded-md ">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="deposit"
                className="block w-full rounded-md border-gray-200 pl-7 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm">Estimated ROI</div>
            <div className="">
              <div className="grid gap-2 md:grid-cols-3">
                <SingleROI
                  title="24H Fees"
                  primary={fee}
                  percentage={(fee / depositAmount) * 100}
                />
                <SingleROI
                  title="Monthly Fees"
                  primary={fee * 28}
                  percentage={((fee * 28) / depositAmount) * 100}
                />
                <SingleROI
                  title="Yearly (APR)"
                  primary={fee * 365}
                  percentage={((fee * 365) / depositAmount) * 100}
                />
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="rounded-md border border-gray-200 px-4 py-2">
                  <div className="text-xs text-gray-500">Daily Pool Volume (7d Avg)</div>
                  <div className="text-xl">
                    $
                    {(poolVolumeData?.volume7dUSD ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 px-4 py-2">
                  <div className="text-xs text-gray-500">Pool TVL</div>
                  <div className="text-xl">
                    $
                    {(poolVolumeData?.tvlLatest ?? 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm">Liquidity Distribution</div>
            <div
              className="overflow-hidden rounded-md border border-gray-200"
              style={{ height: `${chartHeight}px` }}
            >
              {(isTicksLoading || tokenDataLoading) && (
                <div className="grid h-full items-center justify-center">
                  <VscLoading className="h-12 w-12 animate-spin text-pink-400" />
                </div>
              )}
              {!(isTicksLoading || tokenDataLoading) && (
                <>
                  {ticksData && tokenData0 && tokenData1 && selectedPool && (
                    <LiquidityDistributionChart
                      rawTicks={ticksData}
                      token0={tokenData0}
                      token1={tokenData1}
                      pool={selectedPool}
                      zoomLevel={zoomLevel}
                      liqStart={priceRange[0]}
                      liqEnd={priceRange[1]}
                      priceMin={poolVolumeData?.priceMin ?? 0}
                      priceMax={poolVolumeData?.priceMax ?? 0}
                    />
                  )}
                  {ticksData && ticksData.length === 0 && poolsData && poolsData.length === 0 && (
                    <div className="grid h-full items-center justify-center">
                      <MdOutlineCancel className="h-12 w-12 text-red-400" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between px-1 text-sm">
              <span>Liquidity Price Range</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: chartColors.PRICE_MINMAX }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="relative rounded-md ">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                    placeholder="0.00"
                    value={priceRange[0]}
                    step={0.000001}
                    onChange={(e) => setPriceRange((f) => [Number(e.target.value), f[1]])}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {tokenData0?.symbol} per {tokenData1?.symbol}
                </div>
              </div>
              <div>
                <div className="relative rounded-md ">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                    placeholder="0.00"
                    value={priceRange[1]}
                    step={0.000001}
                    onChange={(e) => setPriceRange((f) => [f[0], Number(e.target.value)])}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {tokenData0?.symbol} per {tokenData1?.symbol}
                </div>
              </div>
              <div className="col-span-2">
                <Slider
                  getAriaLabel={() => "Temperature range"}
                  value={priceRange}
                  onChange={(event: Event, newValue: number | number[]) => {
                    setPriceRange(newValue as number[]);
                  }}
                  valueLabelDisplay="auto"
                  min={(selectedPool?.token0Price ?? 0) * zoomLevel.initialMin}
                  max={(selectedPool?.token0Price ?? 0) * zoomLevel.initialMax}
                  step={0.000001}
                  disableSwap
                />
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between px-1 text-sm">
              <span>Current Active Price</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: chartColors.PRICE_CURRENT }}
              />
            </div>
            <div className="relative rounded-md ">
              <input
                type="number"
                disabled
                className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                placeholder="0.00"
                value={selectedPool?.token0Price}
                step={0.1}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {tokenData0?.symbol} per {tokenData1?.symbol}
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 flex items-center justify-between px-1 text-sm">
                  <span>28D Low</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: chartColors.PRICE_HIST_MINMAX }}
                  />
                </div>
                <div className="relative rounded-md ">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                    placeholder="0.00"
                    value={poolVolumeData?.priceMin ?? 0}
                    disabled
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {tokenData0?.symbol} per {tokenData1?.symbol}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between px-1 text-sm">
                  <span>28D High</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: chartColors.PRICE_HIST_MINMAX }}
                  />
                </div>
                <div className="relative rounded-md ">
                  <input
                    type="number"
                    className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                    placeholder="0.00"
                    value={poolVolumeData?.priceMax ?? 0}
                    disabled
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {tokenData0?.symbol} per {tokenData1?.symbol}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-2xl  space-y-4 rounded-lg border border-gray-200 bg-white px-5 py-3">
          <div>
            <div className="mb-1 text-sm">Pool ID</div>
            <div className="relative rounded-md ">
              <input
                type="text"
                disabled
                className="block w-full rounded-md border-gray-200 focus:border-blue-300 focus:ring-blue-300 sm:text-sm"
                placeholder="0.00"
                value={selectedPool?.id}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">Provided for informational purposes only.</div>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <div className="mx-auto w-96 text-center text-sm text-gray-600">
            All data is directly retrieved from the Uniswap V3 Subgraph. If you feel like any of this data is incorrect,
            please check the Uniswap Info site to confirm.
          </div>
          <div className="mx-auto w-96 text-center text-sm text-gray-600">
            Data for Optimism and Arbitrum is unreliable due to low liquidity. The data returned from the Uniswap
            subgraph for the said networks is also often not accurate enough. I recommend sticking with Ethereum and
            Polygon.
          </div>
          <div className="text-center text-sm">
            Created by{" "}
            <a
              href="https://twitter.com/iakshatmittal"
              target="_blank"
              rel="noreferrer"
              className="border-blue-400 text-blue-600 hover:border-b"
            >
              @iakshatmittal
            </a>
            ! Come say hi or request new features!
          </div>
        </div>
        <a
          href="https://unispark.metacrypt.org/"
          target="_blank"
          rel="noreferrer"
          className="mx-auto block max-w-2xl"
        >
          <div className="mx-auto space-y-2 rounded-lg border bg-gray-100 p-4 text-center text-sm text-gray-800">
            <img
              src="https://unispark.metacrypt.org/unispark.svg"
              className="mx-auto h-16 w-16"
              alt="Unispark Logo"
            />
            <h2 className="special-text text-2xl font-bold">Unispark</h2>
            <p>
              Try out Unispark, which gives you everything this tool does and a lot more, including more accurate
              backtests, detailed analysis and more!
            </p>
          </div>
        </a>
        <div className="mt-8 text-center">
          <a
            href="https://github.com/0xMetacrypt/uniswap-v3-calculator-simulator"
            target="_blank"
            rel="noreferrer"
            className="text-center text-blue-600 hover:underline"
          >
            <div className="flex items-center justify-center space-x-2">
              <FaGithub />
              <span>View on GitHub.</span>
            </div>
          </a>
        </div>
        <div className="mx-4 mt-12">
          <div className="mx-auto max-w-4xl">
            <div className="flow-root">
              <div className="divide-y divide-gray-200">
                <SingleFAQ
                  title="What is Uniswap V3 Calculator &amp; Simulator?"
                  text={
                    <>
                      <p>
                        Uniswap V3 Calculator is an exploration tool for Uniswap V3 providing insights and fee estimates
                        which are usually abstracted away from the UI. Uniswap doesn&apos;t show returns or APR for any
                        new liquidity position that you create, which makes it hard to judge how well a position would
                        do.
                      </p>
                      <p>
                        You can use this tool to get an idea of which tokens and how much would you want to invest, and
                        estimate what your income from fee could be based on historical data. All the data is directly
                        fetched from Uniswap V3, and is accurate to the current block and subgraph sync time.
                      </p>
                      <p>This tool is also helpful if you are new to Uniswap and would like to learn how it works.</p>
                    </>
                  }
                />
                <SingleFAQ
                  title="What do these numbers and charts represent?"
                  text={
                    <>
                      <p>
                        This tool uses historical data from the selected pool to show a simple ideal case scenario on
                        how much fee you could potentially earn for providing liquidity to Uniswap V3 for the selected
                        tokens and fee tier. Although, this tool has several assumptions. For the sake of the
                        calculations, this tool assumes no change in the swap ratio (price), the volume or the liquidity
                        positions. This is most certainly the ideal case scenario. This tool also does not account for
                        Impermanent Loss and any honeypot mechanics.
                      </p>
                      <p>
                        All functions, formulas and assumptions are the same as in the Uniswap codebase, including
                        percentages, liquidity and the price calculations.
                      </p>
                    </>
                  }
                />
                <SingleFAQ
                  title="How does this tool work?"
                  text={
                    <>
                      <p className="text-xs">
                        <i>*technical stuff ahead*</i>
                      </p>
                      <p>
                        Uniswap V3 Fee Calculator uses the formulas as described in the Uniswap V3 Whitepaper to
                        calculate specific token amounts as well as liquidity and uses the current swap volume and
                        liquidity to create an estimate of future fee potential based on historical values.
                      </p>
                      <p>
                        The prices for the tokens are calculated by using <code>derivedETH</code> values for{" "}
                        <code>token</code> and multiplying with the USD price for Ethereum taken from a weighted average
                        of the stablecoin pools. The <code>depositAmount</code> is then used to calculate token splits
                        using the liquidity formulas below, using current global liquidity.
                      </p>
                      <p>
                        The pool volume is calculated from the average of the last 7 days, not including the present
                        day.
                        <br />
                        <code>24hVolume = avg([volumeT1...volumeT8])</code>
                      </p>
                      <p>
                        User liquidity is calculated as an addition to the total liquidity pool:
                        <br />
                        <code>
                          liquidity0 = amount0 * (sqrtRatioBX96 * sqrtRatioAX96) / (sqrtRatioBX96 - sqrtRatioAX96)
                        </code>
                        <br />
                        <code>liquidity1 = amount1 / (sqrtRatioBX96 - sqrtRatioAX96)</code>
                      </p>
                      <p>
                        Then, <br />
                        If <code>P &lt;= Pa</code>, then <code>userTotalLiquidity = liquidity0</code>.<br />
                        If <code>Pa &lt; P &lt; Pb</code>, then{" "}
                        <code>userTotalLiquidity = min(liquidity0, liquidity1)</code>.<br />
                        If <code>P &gt;= Pb</code>, then <code>userTotalLiquidity = liquidity1</code>.<br />
                      </p>
                      <p>
                        Finally using Liquidity from Uniswap V3, we can calculate the following:
                        <br />
                        <code>
                          computedFee = feeTier * 24hVolume * (userTotalLiquidity / (existingLiquidity +
                          userTotalLiquidity))
                        </code>
                      </p>
                      <p>
                        This <code>computedFee</code> is plugged back into the Uniswap V3 formula to calculate the
                        actual fee for the selected tokens and fee tier.
                      </p>
                      <p>
                        <a
                          href="https://uniswap.org/whitepaper-v3.pdf"
                          target="_blank"
                          rel="noreferrer"
                          className="border-blue-400 text-blue-600 hover:border-b"
                        >
                          Uniswap V3 Whitepaper Reference
                        </a>
                      </p>
                    </>
                  }
                />
                <SingleFAQ
                  title="Disclaimer"
                  text={
                    <>
                      <p>
                        This tool is great to visualize and simulate any Uniswap V3 position, but please do your own
                        research before investing. Nothing on this website is investment advice, and you bear all
                        responsibility from investing. All of this is based on historical data, and nobody can predict
                        the future.
                      </p>
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
