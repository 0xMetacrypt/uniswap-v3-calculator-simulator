import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import { IUniNetworks, UniswapNetworks } from "./config";
import { Pool } from "./types";

export const QueryKey = "uniswap-v3/pool-for-pair";

export function usePoolForPair(network: IUniNetworks, token0: string, token1: string) {
  return useQuery<Pool[]>({
    queryKey: [QueryKey, network, token0, token1],
    queryFn: () =>
      request(
        UniswapNetworks[network].graphql,
        gql`{
        pools(orderBy: feeTier, where: {
            token0: "${token0.toLowerCase()}"
            token1: "${token1.toLowerCase()}"
          }) {
          id
          sqrtPrice
          feeTier
          liquidity
          token0Price
          token1Price
          volumeUSD
          feesUSD
          tick
          totalValueLockedToken0
          totalValueLockedToken1
        }
      }`,
      ).then((e: any) => e.pools),
  });
}
