import { initPuppeteerRun, puppeteerLog } from "../logging/puppeteer-logger";
import { add, subtract } from "./basic-ops";
import { mean, max, min } from "./statistics";

/**
 * Demonstrates Math Tales operations with comprehensive logging.
 * @logdoc Main demo runner for Math Tales development
 */
export function runMathDemo(runId: string) {
  initPuppeteerRun({
    runId,
    model: "claude-sonnet-4",
    sessionId: `math_session_${Date.now()}`,
    tags: ["math-tales", "development", "iteration"]
  });

  const features = getFeatures(runId);
  
  puppeteerLog("demo.session.start", { 
    version: "3.0.0",
    features,
    iterationId: runId
  });

  try {
    testAddFunction();
    
    if (features.includes("subtract")) {
      testSubtractFunction();
    }
    
    if (features.includes("statistics")) {
      testStatisticsFunction();
    }
    
    puppeteerLog("demo.session.success", { 
      status: "completed", 
      featuresCount: features.length,
      totalOperations: getTotalOperationsCount(features)
    });
  } catch (error) {
    puppeteerLog("demo.session.error", { 
      error: error instanceof Error ? error.message : String(error) 
    }, { stack: true });
  }
}

/**
 * Tests the add function with various inputs.
 * @logdoc Comprehensive testing of addition functionality
 */
function testAddFunction() {
  puppeteerLog("test.add.start", { testCases: 4 });

  const testCases = [
    [1, 2],
    [10, 20, 30],
    [1.5, 2.7, 3.8],
    [0, -5, 10]
  ];

  testCases.forEach((inputs, index) => {
    puppeteerLog("test.case.start", { 
      caseIndex: index,
      inputs: inputs.slice(0, 5)
    });

    const result = add(...inputs);

    puppeteerLog("test.case.complete", {
      caseIndex: index,
      expected: inputs.reduce((a, b) => a + b, 0),
      actual: result.value,
      passed: Math.abs(result.value - inputs.reduce((a, b) => a + b, 0)) < 1e-10
    });
  });

  puppeteerLog("test.add.complete", { totalTests: testCases.length });
}

/**
 * Tests the subtract function with various inputs.
 * @logdoc Testing subtraction functionality with edge cases
 */
function testSubtractFunction() {
  puppeteerLog("test.subtract.start", { testCases: 3 });

  const testCases = [
    { args: [10, 3], expected: 7 },
    { args: [100, 25, 15], expected: 60 },
    { args: [0, -5], expected: 5 }
  ];

  testCases.forEach(({ args, expected }, index) => {
    puppeteerLog("test.case.start", { 
      operation: "subtract",
      caseIndex: index,
      inputs: args
    });

    const result = subtract(args[0], ...args.slice(1));

    puppeteerLog("test.case.complete", {
      operation: "subtract",
      caseIndex: index,
      expected,
      actual: result.value,
      passed: Math.abs(result.value - expected) < 1e-10
    });
  });

  puppeteerLog("test.subtract.complete", { totalTests: testCases.length });
}

/**
 * Tests statistical functions with sample datasets.
 * @logdoc Statistical operations testing with real datasets
 */
function testStatisticsFunction() {
  puppeteerLog("test.statistics.start", { operations: ["mean", "max", "min"] });

  const dataset = [1, 5, 3, 9, 2, 7, 4, 8, 6];
  
  puppeteerLog("test.dataset.info", {
    size: dataset.length,
    dataset
  });

  const meanResult = mean(dataset);
  const maxResult = max(dataset);
  const minResult = min(dataset);

  puppeteerLog("test.statistics.results", {
    mean: meanResult.value,
    max: maxResult.value,
    min: minResult.value,
    range: maxResult.value - minResult.value
  });

  puppeteerLog("test.statistics.complete", { 
    operationsCompleted: 3,
    datasetProcessed: dataset.length
  });
}

/**
 * @nolog
 */
function getFeatures(runId: string): string[] {
  if (runId.includes("add_only")) return ["add"];
  if (runId.includes("add_subtract")) return ["add", "subtract"];
  if (runId.includes("statistics")) return ["add", "subtract", "statistics"];
  return ["add"];
}

/**
 * @nolog
 */
function getTotalOperationsCount(features: string[]): number {
  let count = 0;
  if (features.includes("add")) count += 4;
  if (features.includes("subtract")) count += 3;
  if (features.includes("statistics")) count += 3;
  return count;
}

if (require.main === module) {
  const iteration = process.argv[2] || "iteration_003_statistics";
  runMathDemo(iteration);
}