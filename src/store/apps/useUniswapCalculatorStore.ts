import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(window.location.hash.slice(1));
    const storedValue = searchParams.get(key) ?? "";

    return JSON.parse(storedValue);
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(window.location.hash.slice(1));
    searchParams.set(key, JSON.stringify(newValue));
    window.location.hash = searchParams.toString();
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(window.location.hash.slice(1));
    searchParams.delete(key);
    window.location.hash = searchParams.toString();
  },
};

interface UniswapCalculatorStore {
  network: string;
  poolAddress: string;
  feeTier: string;
  amount: number;
  setNetwork: (network: string) => void;
  setPoolAddress: (poolAddress: string) => void;
  setFeeTier: (feeTier: string) => void;
  setAmount: (amount: number) => void;
}

export const useUniswapCalculatorStore = create<UniswapCalculatorStore>()(
  persist(
    (set, _get) => ({
      network: "ethereum",
      poolAddress: "",
      feeTier: "",
      amount: 1000,
      setNetwork: (network) => set({ network }),
      setPoolAddress: (poolAddress) => set({ poolAddress }),
      setFeeTier: (feeTier) => set({ feeTier }),
      setAmount: (amount) => set({ amount }),
    }),
    {
      name: "metacrypt:app:uniswap-v3-calculator",
      storage: createJSONStorage(() => hashStorage),
      partialize: (state) => ({ ...state }), // TODO: Pick only the keys that need to be persisted
    },
  ),
);
