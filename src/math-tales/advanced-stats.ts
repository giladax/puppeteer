import { puppeteerLog } from "../logging/puppeteer-logger";
import { MathResult } from "./types";

/**
 * Calculates the variance of a dataset (population variance).
 * @logdoc Population variance calculation with mean computation
 */
export function variance(numbers: number[]): MathResult {
  puppeteerLog("stats.variance.start", {
    datasetSize: numbers.length,
    sampleMode: "population"
  });

  if (numbers.length === 0) {
    puppeteerLog("stats.variance.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot calculate variance of empty dataset");
  }

  const meanValue = calculateMean(numbers);
  puppeteerLog("stats.variance.mean_computed", { meanValue });

  const squaredDiffs = computeSquaredDifferences(numbers, meanValue);
  const varianceValue = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;

  puppeteerLog("stats.variance.complete", {
    result: varianceValue,
    mean: meanValue,
    computedDifferences: squaredDiffs.length
  }, { snippet: true });

  return {
    value: varianceValue,
    operation: "variance",
    inputs: numbers
  };
}

/**
 * Calculates the standard deviation of a dataset.
 * @logdoc Standard deviation via square root of variance
 */
export function standardDeviation(numbers: number[]): MathResult {
  puppeteerLog("stats.stddev.start", {
    datasetSize: numbers.length,
    approach: "sqrt_of_variance"
  });

  const varianceResult = variance(numbers);
  const stdDevValue = Math.sqrt(varianceResult.value);

  puppeteerLog("stats.stddev.complete", {
    result: stdDevValue,
    variance: varianceResult.value,
    relationship: "sqrt(variance)"
  });

  return {
    value: stdDevValue,
    operation: "standardDeviation",
    inputs: numbers
  };
}

/**
 * @nolog
 */
function calculateMean(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * @nolog
 */
function computeSquaredDifferences(numbers: number[], mean: number): number[] {
  return numbers.map(num => Math.pow(num - mean, 2));
}