import { puppeteerLog } from "../logging/puppeteer-logger";

/**
 * Bootstrap wrapper where logs are the strings controlling the puppet.
 * Every function becomes controlled by its log events.
 * @logdoc Logs-as-strings wrapper - logs control function behavior
 */
export function puppeteerBootstrap<T extends (...args: any[]) => any>(
  fn: T,
  logStrings: LogStrings = {}
): T {
  const functionName = fn.name || "anonymous";
  const eventBase = logStrings.eventPrefix || `auto.${functionName}`;

  puppeteerLog("bootstrap.attach_strings", {
    functionName,
    eventBase,
    controlStrings: Object.keys(logStrings)
  });

  const wrappedFunction = ((...args: Parameters<T>) => {
    // The log pulls the strings - it decides what happens
    const executionId = `exec_${Date.now()}`;
    
    // String 1: Should this function execute?
    const shouldExecute = pullExecutionString(eventBase, args, logStrings);
    if (!shouldExecute) {
      puppeteerLog(`${eventBase}.blocked`, { 
        reason: "execution_string_pulled_stop",
        executionId 
      });
      return null;
    }

    // String 2: How should it execute?  
    const executionMode = pullModeString(eventBase, args, logStrings);
    
    puppeteerLog(`${eventBase}.execute`, {
      executionId,
      mode: executionMode,
      inputCount: args.length,
      controlledBy: "log_strings"
    }, { 
      snippet: logStrings.includeSnippet,
      stack: logStrings.includeStack 
    });

    try {
      const result = fn(...args);

      // String 3: How should results be handled?
      const resultMode = pullResultString(eventBase, result, logStrings);
      
      puppeteerLog(`${eventBase}.result`, {
        executionId,
        resultMode,
        success: true
      });

      return result;
    } catch (error) {
      // String 4: How should errors be handled?
      const errorMode = pullErrorString(eventBase, error, logStrings);
      
      puppeteerLog(`${eventBase}.error`, {
        executionId,
        errorMode,
        error: error instanceof Error ? error.message : String(error)
      }, { stack: true });

      if (errorMode === "suppress") {
        return null;
      }
      throw error;
    }
  }) as T;

  Object.defineProperty(wrappedFunction, "name", { value: functionName });
  
  puppeteerLog("bootstrap.strings_attached", {
    functionName,
    controllerReady: true
  });

  return wrappedFunction;
}

/**
 * Wraps an entire module where logs control all function behavior.
 * @logdoc Module-level bootstrap where logs are the puppet strings
 */
export function puppeteerBootstrapModule<T extends Record<string, any>>(
  module: T,
  globalStrings: LogStrings = {}
): any {
  puppeteerLog("bootstrap.module.start", {
    moduleName: module.constructor?.name || "unknown",
    functionCount: Object.keys(module).filter(k => typeof module[k] === "function").length
  });

  const controlledModule = { ...module };

  for (const [key, value] of Object.entries(module)) {
    if (typeof value === "function") {
      (controlledModule as any)[key] = puppeteerBootstrap(value, {
        ...globalStrings,
        eventPrefix: globalStrings.eventPrefix || `module.${key}`
      });
      
      puppeteerLog("bootstrap.function.controlled", {
        functionName: key,
        stringsPulled: true
      });
    }
  }

  puppeteerLog("bootstrap.module.complete", {
    controlledFunctions: Object.keys(controlledModule).filter(k => 
      typeof controlledModule[k] === "function"
    ).length
  });

  return controlledModule;
}

export interface LogStrings {
  eventPrefix?: string;
  description?: string;
  executionGate?: "always" | "conditional" | "never";
  errorHandling?: "throw" | "suppress" | "log_and_continue";
  resultLogging?: "full" | "summary" | "none";
  includeStack?: boolean;
  includeSnippet?: boolean;
}

/**
 * @nolog
 */
function pullExecutionString(eventBase: string, args: any[], strings: LogStrings): boolean {
  const gate = strings.executionGate || "always";
  
  switch (gate) {
    case "never": return false;
    case "conditional": return args.length > 0;
    case "always": 
    default: return true;
  }
}

/**
 * @nolog  
 */
function pullModeString(eventBase: string, args: any[], strings: LogStrings): string {
  if (args.length === 0) return "no_input_mode";
  if (args.length === 1) return "single_input_mode";
  return "multi_input_mode";
}

/**
 * @nolog
 */
function pullResultString(eventBase: string, result: any, strings: LogStrings): string {
  const mode = strings.resultLogging || "summary";
  
  switch (mode) {
    case "none": return "silent";
    case "full": return "detailed";
    case "summary":
    default: return "summary";
  }
}

/**
 * @nolog
 */
function pullErrorString(eventBase: string, error: any, strings: LogStrings): string {
  return strings.errorHandling || "throw";
}