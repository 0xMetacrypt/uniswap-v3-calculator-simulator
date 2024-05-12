import { PageHeader } from "@/components/layout/PageHeader";
import { FullApp } from "@/sections/uniswap-v3-calculator/FullApp";

export default function Page() {
  return (
    <>
      <PageHeader
        title={["Uniswap V3", "Calculator & Simulator"]}
        description="Easily calculate and track fees generated from Uniswap V3 positions as well as get meaningful insights on volume, prices and investment returns including APR."
      />
      <FullApp />
    </>
  );
}
