import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";

import { IUniNetworks, UniswapNetworks } from "./config";

export const QueryKey = "uniswap-v3/price-ethereum";

export function useEtherPrice(network: IUniNetworks) {
  return useQuery<number>({
    queryKey: [QueryKey, network],
    queryFn: () =>
      request(
        UniswapNetworks[network].graphql,
        gql`
          {
            bundle(id: 1) {
              id
              ethPriceUSD
            }
          }
        `,
      ).then((e: any) => Number(e.bundle.ethPriceUSD)),
  });
}
