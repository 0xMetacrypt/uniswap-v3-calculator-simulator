import { useQuery } from "@tanstack/react-query";

import { IUniNetworks, UniswapNetworks } from "./config";
import { Tick } from "./types";

export const QueryKey = "uniswap-v3/ticks-for-pool";

export function useTicksForPool(network: IUniNetworks, poolAddress: string) {
  return useQuery<Tick[]>({
    queryKey: [QueryKey, poolAddress, network],
    queryFn: async () => {
      let page = 0;
      const result = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const tickData = await fetch(UniswapNetworks[network].graphql, {
          method: "POST",
          body: JSON.stringify({
            query: `{
                ticks(
                  first: 1000
                  skip: ${page * 1000}
                  where: {
                   poolAddress: "${poolAddress?.toLowerCase()}"
                  }
                  orderBy: tickIdx
                ) {
                  id
                  tickIdx
                  liquidityNet
                  price0
                  price1
                }
              }`,
          }),
        })
          .then((e) => e.json())
          .then((e) => e.data.ticks as any[]);

        result.push(...tickData);
        page += 1;

        if (tickData.length === 0) {
          break;
        }
      }
      return result;
    },
  });
}
