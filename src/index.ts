// #!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { program } from "commander";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables first
dotenv.config();

// Simple logging to both console and file
import fs from 'fs';
const logStream = fs.createWriteStream(path.join(process.cwd(), 'xcli-startup.log'), { flags: 'a' });
const log = (...args: string[]) => {
  const timestamp = new Date().toISOString();
  const msg = `[${timestamp}] ${args.join(' ')}\n`;
  console.log(msg.trim());  // Terminal output
  try {
    logStream.write(msg);
  } catch {
    // Ignore file write errors
  }
};

log("🚀 X-CLI Starting Up...");
log(`📂 Working directory: ${process.cwd()}`);
log(`🖥️  Node version: ${process.version}`);

// Check API key early
const apiKey = process.env.GROK_API_KEY;
log(`🔑 API Key: ${apiKey ? "✅ Found" : "❌ Missing"}`);

if (!apiKey) {
  console.error("❌ No API key found. Set GROK_API_KEY environment variable.");
  log("❌ Missing API key - exiting");
  process.exit(1);
}

// Import core modules with error handling
log("📦 Loading core modules...");
try {
  const { GrokAgent } = await import("./agent/grok-agent.js");
  const ChatInterface = (await import("./ui/components/chat-interface.js")).default;
  const { printWelcomeBanner } = await import("./hooks/use-console-setup.js");
  const { getSettingsManager } = await import("./utils/settings-manager.js");
  const { ConfirmationService } = await import("./utils/confirmation-service.js");
  const { createMCPCommand } = await import("./commands/mcp.js");
  const { createSetNameCommand } = await import("./commands/set-name.js");
  const { createToggleConfirmationsCommand } = await import("./commands/toggle-confirmations.js");
  const pkg = await import("../package.json", { assert: { type: "json" } });
  const { checkForUpdates } = await import("./utils/version-checker.js");
  const { loadContext, formatContextStatus } = await import("./utils/context-loader.js");
  
  log("✅ All modules imported successfully");
  
  // Setup error handlers
  process.on("SIGTERM", () => {
    log("👋 Gracefully shutting down...");
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    log(`💥 Uncaught exception: ${error.message}`);
    console.error("💥 Uncaught exception:", error.message);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    log(`💥 Unhandled rejection: ${reason}`);
    console.error("💥 Unhandled rejection:", reason);
    process.exit(1);
  });

  // Helper functions
  function loadModel(): string | undefined {
    let model = process.env.GROK_MODEL;
    if (!model) {
      try {
        const manager = getSettingsManager();
        model = manager.getCurrentModel?.();
      } catch {
        model = "grok-4-fast-non-reasoning";  // Default model
      }
    }
    return model;
  }

  async function saveCommandLineSettings(apiKey?: string, baseURL?: string): Promise<void> {
    try {
      const manager = getSettingsManager();
      if (apiKey) {
        manager.updateUserSetting("apiKey", apiKey);
        log("✅ API key saved to settings");
      }
      if (baseURL) {
        manager.updateUserSetting("baseURL", baseURL);
        log("✅ Base URL saved to settings");
      }
    } catch (error) {
      log(`⚠️ Could not save settings: ${error}`);
    }
  }

  // Main CLI setup
  log("🎯 Initializing CLI...");
  try {
    const baseURL = process.env.GROK_BASE_URL;
    const model = loadModel();
    const maxToolRounds = parseInt(process.env.MAX_TOOL_ROUNDS || "400");
    
    log("🤖 Creating GrokAgent instance...");
    const agent = new GrokAgent(apiKey, baseURL, model, maxToolRounds);

    log("📋 Setting up Commander CLI...");
    program
      .name("x-cli")
      .description("AI-powered CLI assistant")
      .version(pkg.default.version)
      .argument("[message...]", "Initial message to send to Grok")
      .option("-d, --directory <dir>", "set working directory", process.cwd())
      .option("-k, --api-key <key>", "X API key")
      .option("-u, --base-url <url>", "Grok API base URL")
      .option("-m, --model <model>", "AI model to use")
      .option("-p, --prompt <prompt>", "process a single prompt and exit (headless mode)")
      .option("--max-tool-rounds <rounds>", "maximum tool rounds", "400")
      .option("-q, --quiet", "suppress startup banner and messages")
      .action(async (message, options) => {
        log("🎯 Starting main execution...");
        
        if (options.directory) {
          try {
            process.chdir(options.directory);
            log(`📁 Changed to directory: ${options.directory}`);
          } catch (error) {
            log(`❌ Directory change failed: ${error}`);
            process.exit(1);
          }
        }

        if (options.apiKey || options.baseUrl) {
          await saveCommandLineSettings(options.apiKey, options.baseUrl);
        }

        // Headless mode: process prompt and exit
        if (options.prompt) {
          log("🤖 Processing headless prompt...");
          try {
            const confirmationService = ConfirmationService.getInstance();
            confirmationService.setSessionFlag("allOperations", true);

            const chatEntries = await agent.processUserMessage(options.prompt);
            
            // Output assistant responses
            for (const entry of chatEntries) {
              if (entry.type === "assistant" && entry.content) {
                console.log(entry.content);
              }
            }
          } catch (error) {
            log(`❌ Headless processing failed: ${error}`);
            process.exit(1);
          }
          return;
        }

        // Interactive mode: launch UI
        if (!process.stdin.isTTY) {
          console.error("❌ Error: X CLI requires an interactive terminal.");
          process.exit(1);
        }

        // Load .agent/ context for intelligent decision making
        let contextPack;
        let statusMessage;
        try {
          contextPack = loadContext();
          statusMessage = formatContextStatus(contextPack);
          log("📚 Context loaded successfully");
        } catch (error) {
          log(`⚠️ Context loading failed: ${error}`);
        }

        log("🚀 Launching interactive CLI...");
        
        // Print welcome banner
        if (!options.quiet) {
          printWelcomeBanner(options.quiet);
        }

        const app = render(React.createElement(ChatInterface, { 
          agent, 
          initialMessage: Array.isArray(message) ? message.join(" ") : (message || ""),
          quiet: options.quiet,
          contextStatus: statusMessage 
        }));

        // Cleanup on exit
        const cleanup = () => {
          log("👋 Shutting down...");
          app.unmount();
          try {
            agent.abortCurrentOperation?.();
          } catch {
            // Ignore cleanup errors
          }
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => {
          cleanup();
          process.exit(0);
        });
        process.on('SIGTERM', cleanup);
      });

    // Add subcommands
    program.addCommand(createMCPCommand());
    program.addCommand(createSetNameCommand());
    program.addCommand(createToggleConfirmationsCommand());

    log("✅ CLI setup complete");
    program.parse();
    
  } catch (error) {
    log(`💥 Fatal error during initialization: ${error}`);
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }

} catch (error) {
  log(`💥 Failed to load modules: ${error}`);
  console.error("💥 Failed to load modules:", error);
  process.exit(1);
}
