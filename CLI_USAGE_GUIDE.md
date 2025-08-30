# 🎭 Puppeteer CLI Usage Guide

## Complete Setup Command

```bash
npm run cli setup <name> <path> <description>
```

**Example:**
```bash
npm run cli setup data ./src "Controls data processing operations with validation and transformation tracking"
```

## Generated Structure

```
<path>/<name>-puppeteer/
├── index.ts          # Main wrapper class  
├── config.ts         # Configuration with system prompt
├── schemas/          # Zod event schemas (auto-named)
│   └── events.ts     # DataEvent, DataStartEvent, etc.
└── specs/           # Schema validators
    └── validators.ts # Validation functions
```

## Generated Puppeteer Class

```typescript
export class DataPuppeteer {
  constructor(runId?: string) // Auto-initializes logging
  
  // Control any function
  control<T extends (...args: any[]) => any>(fn: T, eventPrefix?: string): T
  
  // Control entire modules
  controlModule<T extends Record<string, any>>(module: T, modulePrefix?: string): any
  
  // Validate events with schemas  
  validateEvent(event: unknown): DataEvent
  
  // Get captured events
  getEvents(): DataEvent[]
  
  // Analyze and suggest next steps
  analyze(): any
}
```

## Usage Examples

### 1. Control Individual Functions

```typescript
import { createDataPuppeteer } from './data-puppeteer';

// Any existing function - no modification needed
function processData(input: string) {
  return input.toUpperCase();
}

const puppeteer = createDataPuppeteer("my_run_001");
const controlled = puppeteer.control(processData);

// Now the puppeteer controls the function completely
const result = controlled("hello"); // Logs everything automatically
```

### 2. Control Entire Modules

```typescript
import * as dataModule from './legacy-data-utils';

const puppeteer = createDataPuppeteer();
const controlledModule = puppeteer.controlModule(dataModule);

// All functions in the module are now controlled
controlledModule.transform(data);
controlledModule.validate(schema);  
controlledModule.export(results);
```

### 3. Event Validation with Schemas

```typescript
const puppeteer = createDataPuppeteer();

// All events automatically validated with Zod schemas
const analysis = puppeteer.analyze();
console.log(analysis.successRate); // Typed and validated
```

## CLI Commands Available

```bash
# Setup new puppeteer system
npm run cli setup math ./src "Controls mathematical operations"

# Analyze existing logs  
npm run cli analyze logs

# Plan next iteration
npm run cli plan logs

# Show help
npm run cli
```

## Key Benefits

✅ **Zero Code Modification** - Retrofit any existing codebase  
✅ **Auto-Generated Schemas** - Zod validation with proper TypeScript types  
✅ **Complete Control** - Puppeteer controls execution via log strings  
✅ **Analysis Ready** - Built-in event analysis and suggestions  
✅ **Production-Grade** - Proper error handling, validation, and logging

## Philosophy in Action

1. **🎭 Puppeteer** (You) runs CLI setup command
2. **🪢 Strings** (Generated schemas + wrapper) control any code  
3. **🤖 Puppet** (Your existing functions) execute under complete control
4. **📊 Analysis** CLI reads captured events and suggests improvements

The logs are the strings. The CLI generates the strings. Your code becomes the puppet.