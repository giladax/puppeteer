import { writeFileSync } from "fs";
import { puppeteerLog } from "../logging/puppeteer-logger";

/**
 * Generates code for the next iteration based on analysis.
 * @logdoc Code generation engine following established patterns
 */
export function generateFunction(functionName: string, category: string): string {
  puppeteerLog("generator.start", { 
    functionName, 
    category,
    templateApproach: "pattern_based"
  });

  const template = getTemplate(functionName, category);
  
  puppeteerLog("generator.template_selected", { 
    functionName,
    templateLength: template.length
  });

  return template;
}

/**
 * Creates a new test case for the generated function.
 * @logdoc Test case generator following established testing patterns
 */
export function generateTestCase(functionName: string, expectedBehavior: string): string {
  puppeteerLog("generator.test.start", { functionName, expectedBehavior });

  const testTemplate = `
/**
 * Tests the ${functionName} function with various inputs.
 * @logdoc Testing ${functionName} functionality with edge cases
 */
function test${capitalize(functionName)}Function() {
  puppeteerLog("test.${functionName}.start", { testCases: 3 });

  const testCases = [
    // TODO: Add appropriate test cases
    { input: [], expected: 0 },
    { input: [1, 2, 3], expected: 2 }, // Example for median
    { input: [1, 1, 2, 3, 3, 3], expected: 3 } // Example for mode
  ];

  testCases.forEach(({ input, expected }, index) => {
    puppeteerLog("test.case.start", { 
      operation: "${functionName}",
      caseIndex: index,
      inputs: input
    });

    const result = ${functionName}(input);

    puppeteerLog("test.case.complete", {
      operation: "${functionName}",
      caseIndex: index,
      expected,
      actual: result.value,
      passed: Math.abs(result.value - expected) < 1e-10
    });
  });

  puppeteerLog("test.${functionName}.complete", { totalTests: testCases.length });
}`;

  puppeteerLog("generator.test.complete", { 
    functionName,
    testTemplateGenerated: true
  });

  return testTemplate;
}

/**
 * @nolog
 */
function getTemplate(functionName: string, category: string): string {
  const templates: Record<string, string> = {
    median: `
/**
 * Calculates the median value of a dataset.
 * @logdoc Median calculation with sorting and position finding
 */
export function median(numbers: number[]): MathResult {
  puppeteerLog("stats.median.start", {
    datasetSize: numbers.length,
    needsSorting: true
  });

  if (numbers.length === 0) {
    puppeteerLog("stats.median.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot calculate median of empty dataset");
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  const medianValue = sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  puppeteerLog("stats.median.complete", {
    result: medianValue,
    sortedDataset: sorted,
    midpoint: mid
  }, { snippet: true });

  return {
    value: medianValue,
    operation: "median",
    inputs: numbers
  };
}`,
    variance: `
/**
 * Calculates the variance of a dataset.
 * @logdoc Variance calculation with mean and squared differences
 */
export function variance(numbers: number[]): MathResult {
  puppeteerLog("stats.variance.start", { datasetSize: numbers.length });

  if (numbers.length === 0) {
    puppeteerLog("stats.variance.error", { error: "Empty dataset" }, { stack: true });
    throw new Error("Cannot calculate variance of empty dataset");
  }

  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const varianceValue = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;

  puppeteerLog("stats.variance.complete", {
    result: varianceValue,
    mean,
    squaredDiffsCount: squaredDiffs.length
  }, { snippet: true });

  return {
    value: varianceValue,
    operation: "variance",
    inputs: numbers
  };
}`
  };

  return templates[functionName] || templates.variance;
}

/**
 * @nolog
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}