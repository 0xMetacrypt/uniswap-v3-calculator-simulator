import React, { FC, Fragment, useEffect, useMemo, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { AiOutlineSearch } from "react-icons/ai";
import { VscLoading } from "react-icons/vsc";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

import { IUniNetworks } from "@/hooks/uniswap-v3/config";
import { Token } from "@/hooks/uniswap-v3/types";
import { useUniswapTokens } from "@/hooks/uniswap-v3/useUniswapTokens";
import { classNames } from "@/utils/tailwind";

import { SingleTokenDisplay } from "../SingleTokenDisplay";

interface IIndividualToken {
  network: IUniNetworks;
  index: number;
  style: React.CSSProperties;
  data: Token[];
  excluded: string[];
  onChange: (x: string) => void;
}

const IndividualToken: FC<IIndividualToken> = ({ network, index, style, data, excluded, onChange }) => {
  const notAllowed = excluded.includes(data[index].id);

  return (
    <div
      className={classNames(notAllowed ? "opacity-25" : "cursor-pointer hover:border-gray-600")}
      style={style}
    >
      <SingleTokenDisplay
        network={network}
        token={data[index].id}
        onChange={() => !notAllowed && onChange(data[index].id)}
        disabled={notAllowed}
        hideIcon
      />
    </div>
  );
};

interface ITokenSelector {
  network: IUniNetworks;
  show: boolean;
  onClose: () => void;
  excluded: string[];
  onChange: (x: string) => void;
}

export const TokenSelector: FC<ITokenSelector> = ({ network, show, onClose, excluded, onChange }) => {
  const { data: tokenData, isLoading: tokensLoading } = useUniswapTokens(network);

  const [searchString, setSearchString] = useState("");

  const filteredList = useMemo(() => {
    if (!tokenData || tokenData?.length === 0) {
      return [];
    }
    return tokenData.filter(
      (e) =>
        e.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
        e.symbol.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
        e.id.toLowerCase() === searchString.toLowerCase().trim(),
    );
  }, [searchString, tokenData]);

  useEffect(() => {
    if (show) {
      setSearchString("");
    }
  }, [show]);

  return (
    <Transition.Root
      show={show}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex items-start">
                  <div className="mt-1 flex w-full rounded-md">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-200 bg-gray-50 px-2 text-sm text-gray-500">
                      <AiOutlineSearch className="h-6 w-6 text-gray-600" />
                    </span>
                    <input
                      type="text"
                      className="block w-full flex-1 rounded-none rounded-r-md border-gray-200 placeholder-gray-400 focus:ring-transparent sm:text-sm"
                      placeholder="Token name, symbol or contract address"
                      value={searchString}
                      onChange={(e) => setSearchString(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  className="mt-2 flex items-start"
                  style={{ height: "410px" }}
                >
                  <div className="flex h-full w-full flex-col">
                    {tokensLoading && (
                      <div className="grid h-full w-full items-center justify-center">
                        <VscLoading className="h-12 w-12 animate-spin overflow-hidden rounded-full text-blue-500" />
                      </div>
                    )}
                    {!tokensLoading && (
                      <AutoSizer>
                        {({ height, width }) => (
                          <List
                            className="noScroller"
                            height={height}
                            itemCount={filteredList?.length ?? 0}
                            itemSize={62}
                            itemKey={(index, data) => data[index].id}
                            itemData={filteredList}
                            width={width}
                          >
                            {(props) => IndividualToken({ ...props, network, excluded, onChange })}
                          </List>
                        )}
                      </AutoSizer>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
