import { puppeteerLog } from "../logging/puppeteer-logger";
import { MathResult } from "./types";

/**
 * Calculates the arithmetic mean of a dataset.
 * @logdoc Statistical mean calculation with validation
 */
export function mean(numbers: number[]): MathResult {
  puppeteerLog("stats.mean.start", {
    datasetSize: numbers.length,
    datasetPreview: numbers.slice(0, 5)
  });

  if (numbers.length === 0) {
    puppeteerLog("stats.mean.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot calculate mean of empty dataset");
  }

  const sum = calculateSum(numbers);
  const meanValue = sum / numbers.length;

  puppeteerLog("stats.mean.complete", {
    result: meanValue,
    sum,
    count: numbers.length
  }, { snippet: true });

  return {
    value: meanValue,
    operation: "mean",
    inputs: numbers
  };
}

/**
 * Finds the maximum value in a dataset.
 * @logdoc Maximum value finder with performance tracking
 */
export function max(numbers: number[]): MathResult {
  puppeteerLog("stats.max.start", { datasetSize: numbers.length });

  if (numbers.length === 0) {
    puppeteerLog("stats.max.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot find max of empty dataset");
  }

  const maxValue = Math.max(...numbers);

  puppeteerLog("stats.max.complete", {
    result: maxValue,
    searched: numbers.length
  });

  return {
    value: maxValue,
    operation: "max",
    inputs: numbers
  };
}

/**
 * Finds the minimum value in a dataset.
 * @logdoc Minimum value finder with performance tracking
 */
export function min(numbers: number[]): MathResult {
  puppeteerLog("stats.min.start", { datasetSize: numbers.length });

  if (numbers.length === 0) {
    puppeteerLog("stats.min.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot find min of empty dataset");
  }

  const minValue = Math.min(...numbers);

  puppeteerLog("stats.min.complete", {
    result: minValue,
    searched: numbers.length
  });

  return {
    value: minValue,
    operation: "min",
    inputs: numbers
  };
}

/**
 * @nolog
 */
function calculateSum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0);
}