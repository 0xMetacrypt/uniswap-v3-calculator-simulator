import * as d3 from "d3";

import { findMax } from "@/hooks/uniswap-v3/liquidityMath";

const axisArea = 0;

export const colors = {
  PRICE_CURRENT: "rgb(252, 211, 77)",
  PRICE_HIST_MINMAX: "rgb(255, 0, 153)",
  PRICE_MINMAX: "rgb(52, 211, 153)",
  PRICE_BARS: "rgb(244, 114, 182)",
};

export interface Bin {
  x0: number;
  x1: number;
  y: number;
}

interface D3LiquidityHistogramProps {
  width: number;
  height: number;
  data: Bin[];
  currentTick: number;
  minTick: number;
  maxTick: number;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimal: string;
  token1Decimal: string;
  priceMin: number;
  priceMax: number;
}

class D3LiquidityHistogram {
  containerEl;

  props;

  svg;

  x;

  y;

  xAxis;

  yAxis;

  currentTick;

  minTick;

  maxTick;

  token0Symbol;

  token1Symbol;

  priceMin;

  priceMax;

  constructor(containerEl: HTMLDivElement | null, props: D3LiquidityHistogramProps) {
    this.containerEl = containerEl;
    this.props = props;
    this.token0Symbol = props.token0Symbol;
    this.token1Symbol = props.token1Symbol;

    this.svg = d3.select(containerEl).append("svg").attr("width", props.width).attr("height", props.height);

    // add x axis
    const x = d3.scaleLinear().domain([this.props.minTick, this.props.maxTick]).range([0, props.width]);
    this.xAxis = this.svg.append("g").attr("color", "transparent").call(d3.axisBottom(x).tickValues([]));
    this.x = x;

    // add y axis
    const y = d3
      .scaleLinear()
      .domain([0, findMax(this.props.data.map((d) => d.y)) * 1.1])
      .range([props.height, 0]);
    this.yAxis = this.svg.append("g").attr("color", "transparent").call(d3.axisLeft(y).tickValues([]));
    this.y = y;

    this.svg
      .selectAll("rect")
      .data(this.props.data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("transform", (d) => `translate(${x(d.x0)},${y(d.y) - axisArea})`)
      .attr("width", (d) => x(d.x1) - x(d.x0) + 1)
      .attr("height", (d) => props.height - y(d.y))
      .style("fill", colors.PRICE_BARS);

    // this.handleMouseMove();
    this.currentTick = this.renderCurrentTick(this.props.currentTick);

    const { minTickSVG, maxTickSVG } = this.renderMinMaxTickRange(props.minTick, props.maxTick);
    this.minTick = minTickSVG;
    this.maxTick = maxTickSVG;

    const { minPriceSVG, maxPriceSVG } = this.renderPriceMinMaxTickRange(props.priceMin, props.priceMax);
    this.priceMin = minPriceSVG;
    this.priceMax = maxPriceSVG;
  }

  destroy() {
    this.svg.remove();
  }

  renderMinMaxTickRange(minTick: number, maxTick: number) {
    const minTickSVG = this.svg
      .append("g")
      .append("line")
      .style("stroke-width", 1)
      // .style("stroke-dasharray", "10, 1")
      .style("stroke", colors.PRICE_MINMAX)
      .attr("y1", 0)
      .attr("x1", this.x(minTick))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(minTick));

    const maxTickSVG = this.svg
      .append("g")
      .append("line")
      .style("stroke-width", 1)
      // .style("stroke-dasharray", "10, 1")
      .style("stroke", colors.PRICE_MINMAX)
      .attr("y1", 0)
      .attr("x1", this.x(maxTick))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(maxTick));

    return { minTickSVG, maxTickSVG };
  }

  updateMinMaxTickRange(minTick: number, maxTick: number) {
    this.minTick
      .attr("y1", 0)
      .attr("x1", this.x(minTick))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(minTick));

    this.maxTick
      .attr("y1", 0)
      .attr("x1", this.x(maxTick))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(maxTick));
  }

  renderPriceMinMaxTickRange(minPrice: number, maxPrice: number) {
    const minPriceSVG = this.svg
      .append("g")
      .append("line")
      .style("stroke-width", 1)
      // .style("stroke-dasharray", "10, 3")
      .style("stroke", colors.PRICE_HIST_MINMAX)
      .attr("y1", 0)
      .attr("x1", this.x(minPrice))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(minPrice));

    const maxPriceSVG = this.svg
      .append("g")
      .append("line")
      .style("stroke-width", 1)
      // .style("stroke-dasharray", "10, 3")
      .style("stroke", colors.PRICE_HIST_MINMAX)
      .attr("y1", 0)
      .attr("x1", this.x(maxPrice))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(maxPrice));

    return { minPriceSVG, maxPriceSVG };
  }

  updatePriceMinMaxTickRange(minPrice: number, maxPrice: number) {
    this.priceMin
      .attr("y1", 0)
      .attr("x1", this.x(minPrice))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(minPrice));

    this.priceMax
      .attr("y1", 0)
      .attr("x1", this.x(maxPrice))
      .attr("y2", this.props.height - axisArea)
      .attr("x2", this.x(maxPrice));
  }

  renderCurrentTick(currentTick: number) {
    return (
      this.svg
        .append("g")
        .append("line")
        .style("stroke-width", 1)
        // .style("stroke-dasharray", "10, 9")
        .style("stroke", colors.PRICE_CURRENT)
        .attr("x1", this.x(currentTick))
        .attr("y1", 0)
        .attr("x2", this.x(currentTick))
        .attr("y2", this.props.height - axisArea)
    );
  }

  updateCurrentTick(currentTick: number) {
    this.currentTick
      .attr("x1", this.x(currentTick))
      .attr("y1", 0)
      .attr("x2", this.x(currentTick))
      .attr("y2", this.props.height - axisArea);
  }

  // handleMouseMove() {
  //   const focusTextToken0 = this.svg
  //     .append("g")
  //     .append("text")
  //     .style("opacity", 0)
  //     .attr("fill", "white")
  //     .attr("font-size", "0.6rem")
  //     .attr("alignment-baseline", "middle");
  //   const focusTextToken1 = this.svg
  //     .append("g")
  //     .append("text")
  //     .style("opacity", 0)
  //     .attr("fill", "white")
  //     .attr("font-size", "0.6rem")
  //     .attr("alignment-baseline", "middle");
  //   const verticalLine = this.svg.append("g").append("line").style("stroke-width", 1).style("stroke", "rgba(255,255,255,0.25)");

  //   const onMouseMove = (e: any) => {
  //     let coords = d3.pointer(e);
  //     const x0 = this.x.invert(coords[0]);
  //     verticalLine
  //       .attr("x1", this.x(x0))
  //       .attr("y1", 0)
  //       .attr("x2", this.x(x0))
  //       .attr("y2", this.props.height - axisArea);

  //     const self = this;
  //     if (this.x(x0) > this.props.width * 0.8) {
  //       focusTextToken0
  //         .html(`${this.token0Symbol}: ${getPriceFromTick(x0, this.props.token0Decimal, this.props.token1Decimal).toFixed(6)} ${this.token1Symbol}`)
  //         .attr("x", function (d: any) {
  //           return self.x(x0) - (this.getComputedTextLength() + 5);
  //         })
  //         .attr("text-anchor", "right")
  //         .attr("y", 5);
  //       focusTextToken1
  //         .html(`${this.token1Symbol}: ${(1 / getPriceFromTick(x0, this.props.token0Decimal, this.props.token1Decimal)).toFixed(6)} ${this.token0Symbol}`)
  //         .attr("x", function (d: any) {
  //           return self.x(x0) - (this.getComputedTextLength() + 5);
  //         })
  //         .attr("text-anchor", "right")
  //         .attr("y", axisArea);
  //     } else {
  //       focusTextToken0
  //         .html(`${this.token0Symbol}: ${getPriceFromTick(x0, this.props.token0Decimal, this.props.token1Decimal)} ${this.token1Symbol}`)
  //         .attr("x", this.x(x0) + 5)
  //         .attr("text-anchor", "left")
  //         .attr("y", 15);
  //       focusTextToken1
  //         .html(`${this.token1Symbol}: ${(1 / getPriceFromTick(x0, this.props.token0Decimal, this.props.token1Decimal)).toFixed(6)} ${this.token0Symbol}`)
  //         .attr("x", this.x(x0) + 5)
  //         .attr("text-anchor", "left")
  //         .attr("y", 30);
  //     }
  //   };

  //   this.svg
  //     .append("rect")
  //     .style("fill", "none")
  //     .style("pointer-events", "all")
  //     .attr("width", this.props.width)
  //     .attr("height", this.props.height)
  //     .on("mouseover", () => {
  //       focusTextToken0.style("opacity", 1);
  //       focusTextToken1.style("opacity", 1);
  //       verticalLine.style("opacity", 1);
  //     })
  //     .on("mouseout", () => {
  //       focusTextToken0.style("opacity", 0);
  //       focusTextToken1.style("opacity", 0);
  //       verticalLine.style("opacity", 0);
  //     })
  //     .on("mousemove", onMouseMove);
  // }
}

export default D3LiquidityHistogram;
