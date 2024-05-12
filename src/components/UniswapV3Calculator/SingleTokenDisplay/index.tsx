import React, { FC, useMemo } from "react";

import { AiOutlineSearch } from "react-icons/ai";
import { VscLoading } from "react-icons/vsc";

import { IUniNetworks } from "@/hooks/uniswap-v3/config";
import { useLogoForToken } from "@/hooks/uniswap-v3/useLogoForToken";
import { useUniswapTokens } from "@/hooks/uniswap-v3/useUniswapTokens";
import { classNames } from "@/utils/tailwind";

interface ISingleDisplay {
  network: IUniNetworks;
  token?: string;
  onChange: () => void;
  disabled?: boolean;
  hideIcon?: boolean;
}

export const SingleTokenDisplay: FC<ISingleDisplay> = ({
  network,
  token = "",
  onChange,
  disabled = false,
  hideIcon = false,
}) => {
  const { data: tokenData, isLoading: tokensLoading } = useUniswapTokens(network);
  const { data: logoUrl, isLoading: isLogoLoading } = useLogoForToken(network, token);

  const singleTokenData = useMemo(() => tokenData?.find((e) => e.id === token.toLowerCase()), [token, tokenData]);

  return (
    <div
      className={classNames(
        "flex w-full cursor-pointer select-none items-center justify-between rounded-lg border border-gray-200 px-3 py-2 transition-all duration-300",
        !disabled && "hover:border-gray-400",
      )}
      onClick={() => !tokensLoading && onChange()}
    >
      <div className="flex items-center">
        <div className="inline-block">
          {(isLogoLoading || tokensLoading) && (
            <VscLoading className="h-10 w-10 animate-spin overflow-hidden rounded-full text-blue-500" />
          )}
          {!(isLogoLoading || tokensLoading) && (
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-10 overflow-hidden rounded-full"
            />
          )}
        </div>
        <div className="ml-2 inline-block">
          <div className="text-md leading-snug">{singleTokenData?.name}</div>
          <div className="text-xs leading-tight text-gray-500">{singleTokenData?.symbol}</div>
        </div>
      </div>
      {!(isLogoLoading || tokensLoading) && !hideIcon && (
        <div className={classNames(isLogoLoading ? "pointer-events-none opacity-0" : "opacity-100")}>
          <AiOutlineSearch className="h-6 w-6 text-gray-600" />
        </div>
      )}
    </div>
  );
};
