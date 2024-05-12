import { FC, Fragment } from "react";

import { Listbox, Transition } from "@headlessui/react";
import { HiOutlineSelector } from "react-icons/hi";
import { MdOutlineCheck } from "react-icons/md";

import { IUniNetworks, UniswapNetworks } from "@/hooks/uniswap-v3/config";
import { classNames } from "@/utils/tailwind";

interface INetworkSelector {
  currentNetwork: IUniNetworks;
  onChange: (x: IUniNetworks) => void;
}

export const NetworkSelector: FC<INetworkSelector> = ({ currentNetwork, onChange }) => {
  const selectedNetwork = UniswapNetworks[currentNetwork];

  return (
    <div className="w-full">
      <Listbox
        value={currentNetwork}
        onChange={onChange}
      >
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-3 text-left transition-all duration-300 hover:border-gray-400 sm:text-sm">
            <div className="flex w-full items-center">
              <div className="flex flex-grow items-center">
                <div className="inline-block">
                  <img
                    src={selectedNetwork.logo}
                    alt=""
                    className="h-6 w-6 overflow-hidden rounded-full"
                  />
                </div>
                <div className="ml-2 inline-block">
                  <div className="text-md text-gray-600">{selectedNetwork.name}</div>
                </div>
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <HiOutlineSelector
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {Object.keys(UniswapNetworks).map((single) => (
                <Listbox.Option
                  key={single}
                  className={({ active }) =>
                    classNames(
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900",
                      "relative cursor-default select-none px-3 py-2",
                    )
                  }
                  value={single}
                >
                  {({ selected, active }) => (
                    <div className="flex w-full items-center">
                      <div className="flex flex-grow items-center">
                        <div className="inline-block">
                          <img
                            src={UniswapNetworks[single as IUniNetworks].logo}
                            alt=""
                            className="h-6 w-6 overflow-hidden rounded-full"
                          />
                        </div>
                        <div className="ml-2 inline-block">
                          <div className="text-md leading-snug">{UniswapNetworks[single as IUniNetworks].name}</div>
                        </div>
                      </div>
                      {selected && (
                        <span
                          className={classNames(
                            "inset-y-0 left-0 flex items-center",
                            active ? "text-amber-600" : "text-amber-600",
                          )}
                        >
                          <MdOutlineCheck
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
