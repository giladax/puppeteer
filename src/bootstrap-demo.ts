import { initPuppeteerRun, puppeteerLog } from "./logging/puppeteer-logger";
import { puppeteerBootstrap, puppeteerBootstrapModule } from "./puppeteer-cli/bootstrap";

// Original unlogged functions - no logging built in
function multiply(a: number, b: number): number {
  return a * b;
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

/**
 * Demonstrates how logs become the puppet strings controlling functions.
 * @logdoc Bootstrap demonstration - logs control unlogged functions
 */
export function runBootstrapDemo() {
  initPuppeteerRun({
    runId: "bootstrap_demo_001",
    model: "claude-sonnet-4",
    sessionId: `bootstrap_session_${Date.now()}`,
    tags: ["bootstrap", "demo", "log-strings"]
  });

  puppeteerLog("bootstrap.demo.start", {
    originalFunctions: ["multiply", "divide", "power"],
    approach: "logs_as_puppet_strings"
  });

  // The logs are now the strings - they control these functions
  const controlledMultiply = puppeteerBootstrap(multiply, {
    eventPrefix: "math.multiply",
    executionGate: "always",
    resultLogging: "full",
    includeSnippet: true
  });

  const controlledDivide = puppeteerBootstrap(divide, {
    eventPrefix: "math.divide", 
    executionGate: "conditional",
    errorHandling: "suppress",
    includeStack: true
  });

  const controlledPower = puppeteerBootstrap(power, {
    eventPrefix: "math.power",
    executionGate: "always",
    resultLogging: "summary"
  });

  puppeteerLog("bootstrap.strings.attached", {
    controlledFunctions: 3,
    puppet_master: "logs"
  });

  // Now the logs control what happens
  testControlledFunctions(controlledMultiply, controlledDivide, controlledPower);

  puppeteerLog("bootstrap.demo.complete", {
    demonstratedConcept: "logs_as_puppet_strings"
  });
}

/**
 * Tests functions now controlled by log strings.
 * @logdoc Testing log-controlled function execution
 */
function testControlledFunctions(
  multiply: (a: number, b: number) => number,
  divide: (a: number, b: number) => number,
  power: (base: number, exponent: number) => number
) {
  puppeteerLog("test.controlled.start", {
    testSubjects: ["multiply", "divide", "power"]
  });

  // Test 1: Normal operation (logs allow execution)
  const result1 = multiply(6, 7);
  
  // Test 2: Error handling (logs control error behavior)
  try {
    const result2 = divide(10, 0); // Will be suppressed by log strings
    puppeteerLog("test.divide_by_zero", { 
      result: result2,
      suppressed: result2 === null 
    });
  } catch (e) {
    puppeteerLog("test.divide_by_zero.error", { caught: true });
  }

  // Test 3: Power operation (logs decide logging level)
  const result3 = power(2, 8);

  puppeteerLog("test.controlled.complete", {
    testsRun: 3,
    controlMechanism: "log_strings"
  });
}

if (require.main === module) {
  runBootstrapDemo();
}