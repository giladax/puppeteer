import { initPuppeteerRun, puppeteerLog } from "./logging/puppeteer-logger";
import { puppeteerBootstrap } from "./puppeteer-cli/bootstrap";

// Legacy unlogged function - no built-in logging
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Demonstrates the complete Puppeteer system.
 * @logdoc Complete system demo - Puppeteer, Strings, Puppet
 */
export function completeSystemDemo() {
  // The Puppeteer initializes the session
  initPuppeteerRun({
    runId: "complete_system_demo",
    model: "claude-sonnet-4", 
    sessionId: `complete_${Date.now()}`,
    tags: ["complete-system", "puppeteer", "strings", "puppet"]
  });

  puppeteerLog("system.demo.start", {
    components: ["puppeteer", "strings", "puppet"],
    demonstration: "complete_control_system"
  });

  // The Puppeteer attaches strings to the puppet
  const controlledFactorial = puppeteerBootstrap(factorial, {
    eventPrefix: "math.factorial",
    executionGate: "always",
    resultLogging: "full",
    includeSnippet: true,
    includeStack: false
  });

  puppeteerLog("system.strings_attached", {
    puppet: "factorial",
    puppeteer: "demo_runner",
    strings: "logs"
  });

  // Now the strings control the puppet
  demonstrateControl(controlledFactorial);

  puppeteerLog("system.demo.complete", {
    demonstration: "puppeteer_strings_puppet_complete",
    nextStep: "analyze_logs_for_patterns"
  });
}

/**
 * Shows how strings control puppet behavior.
 * @logdoc Demonstration of log-string control over puppet functions
 */
function demonstrateControl(controlledFunction: (n: number) => number) {
  puppeteerLog("control.demo.start", {
    controllingFunction: "factorial",
    stringController: "active"
  });

  // The strings now control every aspect of execution
  const testCases = [5, 0, 1, 7];
  
  testCases.forEach((input, index) => {
    puppeteerLog("control.test.case", {
      caseIndex: index,
      input,
      stringsPulling: true
    });

    const result = controlledFunction(input);
    
    puppeteerLog("control.test.result", {
      caseIndex: index,
      input,
      output: result,
      puppetResponded: true
    });
  });

  puppeteerLog("control.demo.complete", {
    casesExecuted: testCases.length,
    allControlledByStrings: true
  });
}

if (require.main === module) {
  completeSystemDemo();
}