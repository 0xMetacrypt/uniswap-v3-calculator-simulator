import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import { IUniNetworks, UniswapNetworks } from "./config";
import { Token } from "./types";

export const QueryKey = "uniswap-v3/token-list";

export function useUniswapTokens(network: IUniNetworks) {
  return useQuery<Token[]>({
    queryKey: [QueryKey, network],
    queryFn: () =>
      // eslint-disable-next-line no-async-promise-executor
      new Promise<Token[]>(async (resolve) => {
        let page = 0;
        const results = [] as Token[];

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { tokens } = await request(
            UniswapNetworks[network].graphql,
            gql`
            {
              tokens(
                skip: ${page * 1000}
                first: 1000
                orderBy: totalValueLockedUSD
                orderDirection: desc
              ) {
                id
                name
                symbol
                volumeUSD
                feesUSD
                totalValueLockedUSD
                decimals
                derivedETH
              }
            }
            `,
          )
            .catch((e: any) => {
              console.error(e);

              return {
                tokens: [],
              };
            })
            .then((e: any) => e);
          // console.log(tokens);
          results.push(...tokens);
          page += 1;
          if (tokens.length < 1000) {
            break;
          }
        }

        // eslint-disable-next-line no-promise-executor-return
        return resolve(results);
      }),
  });
}
