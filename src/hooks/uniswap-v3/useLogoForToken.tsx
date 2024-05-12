import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";

import { IUniNetworks, UniswapNetworks } from "./config";

export const QueryKey = "uniswap-v3/token-logo";

export function useLogoForToken(network: IUniNetworks, token: string | undefined) {
  return useQuery<string>({
    queryKey: [QueryKey, token, network],
    queryFn: () => {
      const priUrl = UniswapNetworks[network].getTokenImage(ethers.utils.getAddress(token!));
      const altUrl = UniswapNetworks[network].logo;

      return fetch(priUrl).then((e) => (e.ok ? priUrl : altUrl));
    },
    enabled: !!token,
  });
}
