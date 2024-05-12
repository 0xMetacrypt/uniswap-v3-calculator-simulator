import { FC } from "react";

import { Pool, UniswapTiers } from "@/hooks/uniswap-v3/types";
import { classNames } from "@/utils/tailwind";

interface ISingleFeeTier {
  pool: Pool | undefined;
  totalLiquidity: number;
  currentTier: UniswapTiers;
  v: UniswapTiers;
  applyTier: () => void;
}

export const SingleFeeTier: FC<ISingleFeeTier> = ({ pool, totalLiquidity, currentTier, applyTier, v }) => (
  <div
    className={classNames(
      "flex w-full select-none items-center justify-between rounded-lg border px-3 py-2 transition-all duration-300",
      !pool ? "cursor-not-allowed bg-gray-200 opacity-20" : "cursor-pointer",
      currentTier === pool?.feeTier ? "border-pink-400" : "border-gray-200 hover:border-gray-400",
    )}
    onClick={() => pool && applyTier()}
  >
    <div className="text-md text-gray-600">{parseFloat(v) / 10000}%</div>
    <div className="text-xs">
      <span className={classNames("rounded-full px-2 py-0.5", "bg-pink-100 text-pink-500")}>
        {(((pool?.totalValueLockedToken0 ?? 0) / totalLiquidity) * 100 || 0).toFixed(2)}%
      </span>
    </div>
  </div>
);
