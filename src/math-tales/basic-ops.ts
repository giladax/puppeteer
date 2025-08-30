import { initPuppeteerRun, puppeteerLog } from "../logging/puppeteer-logger";
import { MathResult } from "./types";

/**
 * Adds two or more numbers together.
 * @logdoc Core addition operation for Math Tales
 */
export function add(...numbers: number[]): MathResult {
  puppeteerLog("math.add.start", { 
    inputCount: numbers.length,
    inputPreview: numbers.slice(0, 3)
  });

  validateInputs(numbers);

  const result = performAddition(numbers);

  puppeteerLog("math.add.complete", { 
    result: result.value,
    operationTime: Date.now()
  }, { snippet: true });

  return result;
}

/**
 * Subtracts numbers sequentially from the first number.
 * @logdoc Sequential subtraction operation - first minus all others
 */
export function subtract(first: number, ...rest: number[]): MathResult {
  puppeteerLog("math.subtract.start", {
    inputCount: rest.length + 1,
    firstValue: first,
    restPreview: rest.slice(0, 3)
  });

  const allNumbers = [first, ...rest];
  validateInputs(allNumbers);

  const result = performSubtraction(first, rest);

  puppeteerLog("math.subtract.complete", {
    result: result.value,
    subtractedCount: rest.length
  }, { snippet: true });

  return result;
}

/**
 * Validates that all inputs are valid numbers.
 * @logdoc Input validation for mathematical operations
 */
function validateInputs(numbers: number[]): void {
  puppeteerLog("math.validation.start", { count: numbers.length });

  if (numbers.length === 0) {
    puppeteerLog("math.validation.error", { error: "No inputs provided" }, { stack: true });
    throw new Error("At least one number is required");
  }

  for (let i = 0; i < numbers.length; i++) {
    if (typeof numbers[i] !== "number" || isNaN(numbers[i])) {
      puppeteerLog("math.validation.error", { 
        invalidInput: numbers[i], 
        position: i 
      }, { stack: true });
      throw new Error(`Invalid number at position ${i}: ${numbers[i]}`);
    }
  }

  puppeteerLog("math.validation.success", { validatedCount: numbers.length });
}

/**
 * @nolog
 */
function performAddition(numbers: number[]): MathResult {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return {
    value: sum,
    operation: "add",
    inputs: numbers
  };
}

/**
 * @nolog
 */
function performSubtraction(first: number, rest: number[]): MathResult {
  const result = rest.reduce((acc, num) => acc - num, first);
  return {
    value: result,
    operation: "subtract",
    inputs: [first, ...rest]
  };
}