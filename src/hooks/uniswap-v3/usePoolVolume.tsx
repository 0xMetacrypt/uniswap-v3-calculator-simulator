import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import { IUniNetworks, UniswapNetworks } from "./config";

export const QueryKey = "uniswap-v3/pool-volume";

interface IPoolVolume {
  volume7dUSD: number;
  tvlLatest: number;
  priceMin: number;
  priceMax: number;
}

export function usePoolVolume(network: IUniNetworks, pool: string) {
  return useQuery<IPoolVolume>({
    queryKey: [QueryKey, pool, network],
    queryFn: () =>
      request(
        UniswapNetworks[network].graphql,
        gql`{
        poolDayDatas(
          skip: 0
          first: 29
          orderBy: date
          orderDirection: desc
          where: { pool: "${pool}" }
        ) {
          token0Price
          token1Price
          volumeUSD
          tvlUSD
          date
        }
      }`,
      ).then((e: any) => {
        const { poolDayDatas } = e;
        const recent7 = poolDayDatas.slice(1, 8);

        return {
          volume7dUSD:
            recent7.map((f: any) => Number(f.volumeUSD)).reduce((a: number, b: number) => a + b, 0) / recent7.length,
          priceMin: Math.min(...poolDayDatas.map((f: any) => Number(f.token0Price))),
          priceMax: Math.max(...poolDayDatas.map((f: any) => Number(f.token0Price))),
          tvlLatest: Number(poolDayDatas[0]?.tvlUSD || 0),
        };
      }),
    enabled: !!pool,
  });
}
