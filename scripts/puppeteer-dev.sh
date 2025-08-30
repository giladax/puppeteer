#!/bin/bash

# Puppeteer Development Automation Script
# Demonstrates the log-driven development workflow

set -e

echo "🎭 Puppeteer Development CLI"
echo "============================"

COMMAND=${1:-"help"}
ITERATION=${2:-"auto"}
LOGS_DIR="logs"

case $COMMAND in
  "run")
    echo "🚀 Running iteration: $ITERATION"
    npm run build
    node dist/math-tales/runner.js "$ITERATION" > "$LOGS_DIR/$ITERATION.jsonl" 2>&1
    echo "✅ Logs saved to: $LOGS_DIR/$ITERATION.jsonl"
    ;;
    
  "analyze")
    echo "📊 Analyzing all iterations..."
    node dist/puppeteer-cli/index.js analyze "$LOGS_DIR"
    ;;
    
  "plan")
    echo "🎯 Planning next iteration..."
    node dist/puppeteer-cli/index.js plan "$LOGS_DIR"
    ;;
    
  "auto")
    echo "🤖 Running full auto-development cycle..."
    
    # Analyze current state
    echo "Step 1: Analyzing existing iterations..."
    node dist/puppeteer-cli/index.js analyze "$LOGS_DIR" > analysis.json
    
    # Show evolution
    echo "Step 2: Evolution path:"
    grep -o '"evolutionPath":\[[^]]*\]' analysis.json | sed 's/"evolutionPath"://g' | jq '.'
    
    # Show next suggestions
    echo "Step 3: Suggested next features:"
    grep -o '"suggestedNextFeatures":\[[^]]*\]' analysis.json | sed 's/"suggestedNextFeatures"://g' | jq '.'
    
    echo "🎭 Auto-development analysis complete!"
    ;;
    
  "logs")
    echo "📋 Available iteration logs:"
    ls -la "$LOGS_DIR"/iteration-*.jsonl 2>/dev/null || echo "No iteration logs found"
    ;;
    
  "clean")
    echo "🧹 Cleaning generated files..."
    rm -rf dist/ "$LOGS_DIR"/*.jsonl analysis.json
    echo "✅ Clean complete"
    ;;
    
  "help"|*)
    echo "Usage: $0 <command> [iteration]"
    echo ""
    echo "Commands:"
    echo "  run <iteration>     - Run specific iteration and log results"
    echo "  analyze             - Analyze all iteration logs"  
    echo "  plan                - Plan next iteration based on logs"
    echo "  auto                - Run full analysis cycle"
    echo "  logs                - List available log files"
    echo "  clean               - Clean generated files"
    echo ""
    echo "Examples:"
    echo "  $0 run iteration_004_variance"
    echo "  $0 analyze"
    echo "  $0 auto"
    ;;
esac