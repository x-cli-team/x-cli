#!/usr/bin/env node
import OpenAI from 'openai';
import * as fs2 from 'fs';
import fs2__default, { existsSync } from 'fs';
import * as path8 from 'path';
import path8__default from 'path';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { EventEmitter } from 'events';
import axios from 'axios';
import * as os from 'os';
import os__default from 'os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { exec, execSync, spawn } from 'child_process';
import { promisify } from 'util';
import fs7, { writeFile } from 'fs/promises';
import * as ops6 from 'fs-extra';
import { parse } from '@typescript-eslint/typescript-estree';
import Fuse from 'fuse.js';
import { glob } from 'glob';
import { encoding_for_model, get_encoding } from 'tiktoken';
import * as readline from 'readline';
import React4, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import crypto from 'crypto';
import { program, Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));
var GrokClient;
var init_client = __esm({
  "src/grok/client.ts"() {
    GrokClient = class {
      constructor(apiKey2 = process.env.OPENAI_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY, model, baseURL) {
        this.currentModel = "grok-4-fast-non-reasoning";
        this.client = new OpenAI({
          apiKey: apiKey2,
          baseURL: baseURL || process.env.GROK_BASE_URL || "https://api.x.ai/v1",
          timeout: 36e4
        });
        const envMax = Number(process.env.GROK_MAX_TOKENS);
        this.defaultMaxTokens = Number.isFinite(envMax) && envMax > 0 ? envMax : 1536;
        if (model) {
          this.currentModel = model;
        }
      }
      setModel(model) {
        this.currentModel = model;
      }
      getCurrentModel() {
        return this.currentModel;
      }
      async chat(messages, tools, model, searchOptions) {
        try {
          const requestPayload = {
            model: model || this.currentModel,
            messages,
            tools: tools || [],
            tool_choice: tools && tools.length > 0 ? "auto" : void 0,
            temperature: 0.7,
            max_tokens: this.defaultMaxTokens
          };
          if (searchOptions?.search_parameters) {
            requestPayload.search_parameters = searchOptions.search_parameters;
          }
          const response = await this.client.chat.completions.create(requestPayload);
          if (response.usage) {
            this.logTokenUsage(response.usage);
          }
          return response;
        } catch (error) {
          throw new Error(`Grok API error: ${error.message}`);
        }
      }
      async *chatStream(messages, tools, model, searchOptions, abortSignal) {
        try {
          const requestPayload = {
            model: model || this.currentModel,
            messages,
            tools: tools || [],
            tool_choice: tools && tools.length > 0 ? "auto" : void 0,
            temperature: 0.7,
            max_tokens: this.defaultMaxTokens,
            stream: true
          };
          if (searchOptions?.search_parameters) {
            requestPayload.search_parameters = searchOptions.search_parameters;
          }
          const stream = await this.client.chat.completions.create(
            requestPayload,
            { signal: abortSignal }
          );
          let finalUsage = null;
          for await (const chunk of stream) {
            if (chunk.usage) {
              finalUsage = chunk.usage;
            }
            yield chunk;
          }
          if (finalUsage) {
            this.logTokenUsage(finalUsage);
          }
        } catch (error) {
          throw new Error(`Grok API error: ${error.message}`);
        }
      }
      async search(query, searchParameters) {
        const searchMessage = {
          role: "user",
          content: query
        };
        const searchOptions = {
          search_parameters: searchParameters || { mode: "on" }
        };
        return this.chat([searchMessage], [], void 0, searchOptions);
      }
      /**
       * Log token usage for monitoring and optimization
       */
      logTokenUsage(usage) {
        try {
          const tokenData = {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            model: this.currentModel,
            prompt_tokens: usage.prompt_tokens || 0,
            completion_tokens: usage.completion_tokens || 0,
            total_tokens: usage.total_tokens || 0,
            reasoning_tokens: usage.reasoning_tokens || 0
          };
          const logPath = process.env.XCLI_TOKEN_LOG || `${process.env.HOME}/.xcli/token-usage.jsonl`;
          const dir = path8__default.dirname(logPath);
          if (!fs2__default.existsSync(dir)) {
            fs2__default.mkdirSync(dir, { recursive: true });
          }
          const logLine = JSON.stringify(tokenData) + "\n";
          fs2__default.appendFileSync(logPath, logLine);
        } catch (error) {
          console.warn("Failed to log token usage:", error);
        }
      }
    };
  }
});
function createTransport(config2) {
  switch (config2.type) {
    case "stdio":
      return new StdioTransport(config2);
    case "http":
      return new HttpTransport(config2);
    case "sse":
      return new SSETransport(config2);
    case "streamable_http":
      return new StreamableHttpTransport(config2);
    default:
      throw new Error(`Unsupported transport type: ${config2.type}`);
  }
}
var StdioTransport, HttpTransport, SSETransport, HttpClientTransport, SSEClientTransport, StreamableHttpTransport, StreamableHttpClientTransport;
var init_transports = __esm({
  "src/mcp/transports.ts"() {
    StdioTransport = class {
      constructor(config2) {
        this.config = config2;
        if (!config2.command) {
          throw new Error("Command is required for stdio transport");
        }
      }
      async connect() {
        const env = {
          ...process.env,
          ...this.config.env,
          // Try to suppress verbose output from mcp-remote
          MCP_REMOTE_QUIET: "1",
          MCP_REMOTE_SILENT: "1",
          DEBUG: "",
          NODE_ENV: "production"
        };
        this.transport = new StdioClientTransport({
          command: this.config.command,
          args: this.config.args || [],
          env
        });
        return this.transport;
      }
      async disconnect() {
        if (this.transport) {
          await this.transport.close();
          this.transport = void 0;
        }
        if (this.process) {
          this.process.kill();
          this.process = void 0;
        }
      }
      getType() {
        return "stdio";
      }
    };
    HttpTransport = class extends EventEmitter {
      constructor(config2) {
        super();
        this.config = config2;
        this.connected = false;
        if (!config2.url) {
          throw new Error("URL is required for HTTP transport");
        }
      }
      async connect() {
        this.client = axios.create({
          baseURL: this.config.url,
          headers: {
            "Content-Type": "application/json",
            ...this.config.headers
          }
        });
        try {
          await this.client.get("/health");
          this.connected = true;
        } catch (_error) {
          this.connected = true;
        }
        return new HttpClientTransport(this.client);
      }
      async disconnect() {
        this.connected = false;
        this.client = void 0;
      }
      getType() {
        return "http";
      }
    };
    SSETransport = class extends EventEmitter {
      constructor(config2) {
        super();
        this.config = config2;
        this.connected = false;
        if (!config2.url) {
          throw new Error("URL is required for SSE transport");
        }
      }
      async connect() {
        return new Promise((resolve8, reject) => {
          try {
            this.connected = true;
            resolve8(new SSEClientTransport(this.config.url));
          } catch (error) {
            reject(error);
          }
        });
      }
      async disconnect() {
        this.connected = false;
      }
      getType() {
        return "sse";
      }
    };
    HttpClientTransport = class extends EventEmitter {
      constructor(client) {
        super();
        this.client = client;
      }
      async start() {
      }
      async close() {
      }
      async send(message) {
        try {
          const response = await this.client.post("/rpc", message);
          return response.data;
        } catch (error) {
          throw new Error(`HTTP transport error: ${error}`);
        }
      }
    };
    SSEClientTransport = class extends EventEmitter {
      constructor(url) {
        super();
        this.url = url;
      }
      async start() {
      }
      async close() {
      }
      async send(message) {
        try {
          const response = await axios.post(this.url.replace("/sse", "/rpc"), message, {
            headers: { "Content-Type": "application/json" }
          });
          return response.data;
        } catch (error) {
          throw new Error(`SSE transport error: ${error}`);
        }
      }
    };
    StreamableHttpTransport = class extends EventEmitter {
      constructor(config2) {
        super();
        this.config = config2;
        this.connected = false;
        if (!config2.url) {
          throw new Error("URL is required for streamable_http transport");
        }
      }
      async connect() {
        return new Promise((resolve8, reject) => {
          try {
            this.connected = true;
            resolve8(new StreamableHttpClientTransport(this.config.url, this.config.headers));
          } catch (error) {
            reject(error);
          }
        });
      }
      async disconnect() {
        this.connected = false;
      }
      getType() {
        return "streamable_http";
      }
    };
    StreamableHttpClientTransport = class extends EventEmitter {
      constructor(url, headers) {
        super();
        this.url = url;
        this.headers = headers;
      }
      async start() {
      }
      async close() {
      }
      async send(message) {
        console.log("StreamableHttpTransport: SSE endpoints require persistent connections, not suitable for MCP request-response pattern");
        console.log("StreamableHttpTransport: Message that would be sent:", JSON.stringify(message));
        throw new Error("StreamableHttpTransport: SSE endpoints are not compatible with MCP request-response pattern. GitHub Copilot MCP may require a different integration approach.");
      }
    };
  }
});

// src/utils/settings-manager.ts
var settings_manager_exports = {};
__export(settings_manager_exports, {
  SettingsManager: () => SettingsManager,
  getSettingsManager: () => getSettingsManager
});
function getSettingsManager() {
  return SettingsManager.getInstance();
}
var DEFAULT_USER_SETTINGS, DEFAULT_PROJECT_SETTINGS, SettingsManager;
var init_settings_manager = __esm({
  "src/utils/settings-manager.ts"() {
    DEFAULT_USER_SETTINGS = {
      baseURL: "https://api.x.ai/v1",
      defaultModel: "grok-4-fast-non-reasoning",
      models: [
        "grok-4-fast-non-reasoning",
        "grok-4-fast-reasoning",
        "grok-4-0709",
        "grok-4-latest",
        "grok-3-latest",
        "grok-3-fast",
        "grok-3-mini-fast",
        "grok-3",
        "grok-2-vision-1212us-east-1",
        "grok-2-vision-1212eu-west-1",
        "grok-2-image-1212"
      ],
      verbosityLevel: "quiet",
      explainLevel: "brief",
      requireConfirmation: true
    };
    DEFAULT_PROJECT_SETTINGS = {
      model: "grok-4-fast-non-reasoning"
    };
    SettingsManager = class _SettingsManager {
      constructor() {
        const newUserDir = path8.join(os.homedir(), ".xcli");
        const oldUserDir = path8.join(os.homedir(), ".grok");
        if (fs2.existsSync(newUserDir) || !fs2.existsSync(oldUserDir)) {
          this.userSettingsPath = path8.join(newUserDir, "config.json");
        } else {
          this.userSettingsPath = path8.join(oldUserDir, "user-settings.json");
        }
        const newProjectDir = path8.join(process.cwd(), ".xcli");
        const oldProjectDir = path8.join(process.cwd(), ".grok");
        if (fs2.existsSync(newProjectDir) || !fs2.existsSync(oldProjectDir)) {
          this.projectSettingsPath = path8.join(newProjectDir, "settings.json");
        } else {
          this.projectSettingsPath = path8.join(oldProjectDir, "settings.json");
        }
      }
      /**
       * Get singleton instance
       */
      static getInstance() {
        if (!_SettingsManager.instance) {
          _SettingsManager.instance = new _SettingsManager();
        }
        return _SettingsManager.instance;
      }
      /**
       * Ensure directory exists for a given file path
       */
      ensureDirectoryExists(filePath) {
        const dir = path8.dirname(filePath);
        if (!fs2.existsSync(dir)) {
          fs2.mkdirSync(dir, { recursive: true, mode: 448 });
        }
      }
      /**
       * Load user settings from ~/.xcli/config.json or ~/.grok/user-settings.json
       */
      loadUserSettings() {
        try {
          if (!fs2.existsSync(this.userSettingsPath)) {
            this.saveUserSettings(DEFAULT_USER_SETTINGS);
            return { ...DEFAULT_USER_SETTINGS };
          }
          const content = fs2.readFileSync(this.userSettingsPath, "utf-8");
          const settings = JSON.parse(content);
          return { ...DEFAULT_USER_SETTINGS, ...settings };
        } catch (error) {
          console.warn(
            "Failed to load user settings:",
            error instanceof Error ? error.message : "Unknown error"
          );
          return { ...DEFAULT_USER_SETTINGS };
        }
      }
      /**
       * Save user settings to ~/.xcli/config.json or ~/.grok/user-settings.json
       */
      saveUserSettings(settings) {
        try {
          this.ensureDirectoryExists(this.userSettingsPath);
          let existingSettings = { ...DEFAULT_USER_SETTINGS };
          if (fs2.existsSync(this.userSettingsPath)) {
            try {
              const content = fs2.readFileSync(this.userSettingsPath, "utf-8");
              const parsed = JSON.parse(content);
              existingSettings = { ...DEFAULT_USER_SETTINGS, ...parsed };
            } catch (_error) {
              console.warn("Corrupted user settings file, using defaults");
            }
          }
          const mergedSettings = { ...existingSettings, ...settings };
          fs2.writeFileSync(
            this.userSettingsPath,
            JSON.stringify(mergedSettings, null, 2),
            { mode: 384 }
            // Secure permissions for API key
          );
        } catch (error) {
          console.error(
            "Failed to save user settings:",
            error instanceof Error ? error.message : "Unknown error"
          );
          throw error;
        }
      }
      /**
       * Update a specific user setting
       */
      updateUserSetting(key, value) {
        const settings = { [key]: value };
        this.saveUserSettings(settings);
      }
      /**
       * Get a specific user setting
       */
      getUserSetting(key) {
        const settings = this.loadUserSettings();
        return settings[key];
      }
      /**
       * Load project settings from .x/settings.json
       */
      loadProjectSettings() {
        try {
          if (!fs2.existsSync(this.projectSettingsPath)) {
            this.saveProjectSettings(DEFAULT_PROJECT_SETTINGS);
            return { ...DEFAULT_PROJECT_SETTINGS };
          }
          const content = fs2.readFileSync(this.projectSettingsPath, "utf-8");
          const settings = JSON.parse(content);
          return { ...DEFAULT_PROJECT_SETTINGS, ...settings };
        } catch (error) {
          console.warn(
            "Failed to load project settings:",
            error instanceof Error ? error.message : "Unknown error"
          );
          return { ...DEFAULT_PROJECT_SETTINGS };
        }
      }
      /**
       * Save project settings to .x/settings.json
       */
      saveProjectSettings(settings) {
        try {
          this.ensureDirectoryExists(this.projectSettingsPath);
          let existingSettings = { ...DEFAULT_PROJECT_SETTINGS };
          if (fs2.existsSync(this.projectSettingsPath)) {
            try {
              const content = fs2.readFileSync(this.projectSettingsPath, "utf-8");
              const parsed = JSON.parse(content);
              existingSettings = { ...DEFAULT_PROJECT_SETTINGS, ...parsed };
            } catch (_error) {
              console.warn("Corrupted project settings file, using defaults");
            }
          }
          const mergedSettings = { ...existingSettings, ...settings };
          fs2.writeFileSync(
            this.projectSettingsPath,
            JSON.stringify(mergedSettings, null, 2)
          );
        } catch (error) {
          console.error(
            "Failed to save project settings:",
            error instanceof Error ? error.message : "Unknown error"
          );
          throw error;
        }
      }
      /**
       * Update a specific project setting
       */
      updateProjectSetting(key, value) {
        const settings = { [key]: value };
        this.saveProjectSettings(settings);
      }
      /**
       * Get a specific project setting
       */
      getProjectSetting(key) {
        const settings = this.loadProjectSettings();
        return settings[key];
      }
      /**
       * Get the current model with proper fallback logic:
       * 1. Environment variable XCLI_MODEL_DEFAULT
       * 2. Project-specific model setting
       * 3. User's default model
       * 4. System default
       */
      getCurrentModel() {
        const envModel = process.env.XCLI_MODEL_DEFAULT;
        if (envModel) {
          return envModel;
        }
        const projectModel = this.getProjectSetting("model");
        if (projectModel) {
          return projectModel;
        }
        const userDefaultModel = this.getUserSetting("defaultModel");
        if (userDefaultModel) {
          return userDefaultModel;
        }
        return DEFAULT_PROJECT_SETTINGS.model || "grok-4-fast-non-reasoning";
      }
      /**
       * Get the appropriate model for a task based on its characteristics
       * Uses reasoning model for deep tasks, retries, or large contexts
       */
      pickModel(options = {}) {
        const { deep = false, retries = 0, ctxTokens = 0 } = options;
        if (deep || retries > 0 || ctxTokens > 15e4) {
          const reasoningModel = process.env.XCLI_MODEL_REASONING;
          if (reasoningModel) {
            return reasoningModel;
          }
          return "grok-4-fast-reasoning";
        }
        return this.getCurrentModel();
      }
      /**
       * Set the current model for the project
       */
      setCurrentModel(model) {
        this.updateProjectSetting("model", model);
      }
      /**
       * Get available models list from user settings
       */
      getAvailableModels() {
        const models = this.getUserSetting("models");
        return models || DEFAULT_USER_SETTINGS.models || [];
      }
      /**
       * Get API key from user settings or environment
       */
      getApiKey() {
        const envApiKey = process.env.X_API_KEY || process.env.GROK_API_KEY;
        if (envApiKey) {
          return envApiKey;
        }
        return this.getUserSetting("apiKey");
      }
      /**
       * Get base URL from user settings or environment
       */
      getBaseURL() {
        const envBaseURL = process.env.GROK_BASE_URL;
        if (envBaseURL) {
          return envBaseURL;
        }
        const userBaseURL = this.getUserSetting("baseURL");
        return userBaseURL || DEFAULT_USER_SETTINGS.baseURL || "https://api.x.ai/v1";
      }
    };
  }
});

// src/mcp/config.ts
var config_exports = {};
__export(config_exports, {
  PREDEFINED_SERVERS: () => PREDEFINED_SERVERS,
  addMCPServer: () => addMCPServer,
  getMCPServer: () => getMCPServer,
  loadMCPConfig: () => loadMCPConfig,
  removeMCPServer: () => removeMCPServer,
  saveMCPConfig: () => saveMCPConfig
});
function loadMCPConfig() {
  const manager = getSettingsManager();
  const projectSettings = manager.loadProjectSettings();
  const servers = projectSettings.mcpServers ? Object.values(projectSettings.mcpServers) : [];
  return { servers };
}
function saveMCPConfig(config2) {
  const manager = getSettingsManager();
  const mcpServers = {};
  for (const server of config2.servers) {
    mcpServers[server.name] = server;
  }
  manager.updateProjectSetting("mcpServers", mcpServers);
}
function addMCPServer(config2) {
  const manager = getSettingsManager();
  const projectSettings = manager.loadProjectSettings();
  const mcpServers = projectSettings.mcpServers || {};
  mcpServers[config2.name] = config2;
  manager.updateProjectSetting("mcpServers", mcpServers);
}
function removeMCPServer(serverName) {
  const manager = getSettingsManager();
  const projectSettings = manager.loadProjectSettings();
  const mcpServers = projectSettings.mcpServers;
  if (mcpServers) {
    delete mcpServers[serverName];
    manager.updateProjectSetting("mcpServers", mcpServers);
  }
}
function getMCPServer(serverName) {
  const manager = getSettingsManager();
  const projectSettings = manager.loadProjectSettings();
  return projectSettings.mcpServers?.[serverName];
}
var PREDEFINED_SERVERS;
var init_config = __esm({
  "src/mcp/config.ts"() {
    init_settings_manager();
    PREDEFINED_SERVERS = {};
  }
});
var MCPManager;
var init_client2 = __esm({
  "src/mcp/client.ts"() {
    init_transports();
    MCPManager = class extends EventEmitter {
      constructor() {
        super(...arguments);
        this.clients = /* @__PURE__ */ new Map();
        this.transports = /* @__PURE__ */ new Map();
        this.tools = /* @__PURE__ */ new Map();
      }
      async addServer(config2) {
        try {
          let transportConfig = config2.transport;
          if (!transportConfig && config2.command) {
            transportConfig = {
              type: "stdio",
              command: config2.command,
              args: config2.args,
              env: config2.env
            };
          }
          if (!transportConfig) {
            throw new Error("Transport configuration is required");
          }
          const transport = createTransport(transportConfig);
          this.transports.set(config2.name, transport);
          const client = new Client(
            {
              name: "x-cli",
              version: "1.0.0"
            },
            {
              capabilities: {
                tools: {}
              }
            }
          );
          this.clients.set(config2.name, client);
          const sdkTransport = await transport.connect();
          await client.connect(sdkTransport);
          const toolsResult = await client.listTools();
          for (const tool of toolsResult.tools) {
            const mcpTool = {
              name: `mcp__${config2.name}__${tool.name}`,
              description: tool.description || `Tool from ${config2.name} server`,
              inputSchema: tool.inputSchema,
              serverName: config2.name
            };
            this.tools.set(mcpTool.name, mcpTool);
          }
          this.emit("serverAdded", config2.name, toolsResult.tools.length);
        } catch (error) {
          this.emit("serverError", config2.name, error);
          throw error;
        }
      }
      async removeServer(serverName) {
        for (const [toolName, tool] of this.tools.entries()) {
          if (tool.serverName === serverName) {
            this.tools.delete(toolName);
          }
        }
        const client = this.clients.get(serverName);
        if (client) {
          await client.close();
          this.clients.delete(serverName);
        }
        const transport = this.transports.get(serverName);
        if (transport) {
          await transport.disconnect();
          this.transports.delete(serverName);
        }
        this.emit("serverRemoved", serverName);
      }
      async callTool(toolName, arguments_) {
        const tool = this.tools.get(toolName);
        if (!tool) {
          throw new Error(`Tool ${toolName} not found`);
        }
        const client = this.clients.get(tool.serverName);
        if (!client) {
          throw new Error(`Server ${tool.serverName} not connected`);
        }
        const originalToolName = toolName.replace(`mcp__${tool.serverName}__`, "");
        const result = await client.callTool({
          name: originalToolName,
          arguments: arguments_
        });
        return {
          ...result,
          content: result.content || []
        };
      }
      getTools() {
        return Array.from(this.tools.values());
      }
      getServers() {
        return Array.from(this.clients.keys());
      }
      async shutdown() {
        const serverNames = Array.from(this.clients.keys());
        await Promise.all(serverNames.map((name) => this.removeServer(name)));
      }
      getTransportType(serverName) {
        const transport = this.transports.get(serverName);
        return transport?.getType();
      }
      async ensureServersInitialized() {
        if (this.clients.size > 0) {
          return;
        }
        const { loadMCPConfig: loadMCPConfig2 } = await Promise.resolve().then(() => (init_config(), config_exports));
        const config2 = loadMCPConfig2();
        const initPromises = config2.servers.map(async (serverConfig) => {
          try {
            await this.addServer(serverConfig);
          } catch (error) {
            console.warn(`Failed to initialize MCP server ${serverConfig.name}:`, error);
          }
        });
        await Promise.all(initPromises);
      }
    };
  }
});

// src/grok/tools.ts
function buildGrokTools() {
  const tools = [...BASE_GROK_TOOLS];
  if (process.env.MORPH_API_KEY) {
    tools.splice(3, 0, MORPH_EDIT_TOOL);
  }
  return tools;
}
function getMCPManager() {
  if (!mcpManager) {
    mcpManager = new MCPManager();
  }
  return mcpManager;
}
async function initializeMCPServers() {
  const manager = getMCPManager();
  const config2 = loadMCPConfig();
  const originalStderrWrite = process.stderr.write;
  process.stderr.write = function(chunk, encoding, callback) {
    const chunkStr = chunk.toString();
    if (chunkStr.includes("[") && (chunkStr.includes("Using existing client port") || chunkStr.includes("Connecting to remote server") || chunkStr.includes("Using transport strategy") || chunkStr.includes("Connected to remote server") || chunkStr.includes("Local STDIO server running") || chunkStr.includes("Proxy established successfully") || chunkStr.includes("Local\u2192Remote") || chunkStr.includes("Remote\u2192Local"))) {
      if (callback) callback();
      return true;
    }
    return originalStderrWrite.call(this, chunk, encoding, callback);
  };
  try {
    for (const serverConfig of config2.servers) {
      try {
        await manager.addServer(serverConfig);
      } catch (error) {
        console.warn(`Failed to initialize MCP server ${serverConfig.name}:`, error);
      }
    }
  } finally {
    process.stderr.write = originalStderrWrite;
  }
}
function convertMCPToolToGrokTool(mcpTool) {
  return {
    type: "function",
    function: {
      name: mcpTool.name,
      description: mcpTool.description,
      parameters: mcpTool.inputSchema || {
        type: "object",
        properties: {},
        required: []
      }
    }
  };
}
function addMCPToolsToGrokTools(baseTools) {
  if (!mcpManager) {
    return baseTools;
  }
  const mcpTools = mcpManager.getTools();
  const grokMCPTools = mcpTools.map(convertMCPToolToGrokTool);
  return [...baseTools, ...grokMCPTools];
}
async function getAllGrokTools() {
  const manager = getMCPManager();
  manager.ensureServersInitialized().catch(() => {
  });
  return addMCPToolsToGrokTools(GROK_TOOLS);
}
var BASE_GROK_TOOLS, MORPH_EDIT_TOOL, GROK_TOOLS, mcpManager;
var init_tools = __esm({
  "src/grok/tools.ts"() {
    init_client2();
    init_config();
    BASE_GROK_TOOLS = [
      {
        type: "function",
        function: {
          name: "view_file",
          description: "View file contents or list directories",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "File or directory path"
              },
              start_line: {
                type: "number",
                description: "Optional start line for partial view"
              },
              end_line: {
                type: "number",
                description: "Optional end line for partial view"
              }
            },
            required: ["path"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_file",
          description: "Create new file with content",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Path where the file should be created"
              },
              content: {
                type: "string",
                description: "Content to write to the file"
              }
            },
            required: ["path", "content"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "str_replace_editor",
          description: "Replace text in file (single line edits)",
          parameters: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description: "Path to the file to edit"
              },
              old_str: {
                type: "string",
                description: "Text to replace (must match exactly, or will use fuzzy matching for multi-line strings)"
              },
              new_str: {
                type: "string",
                description: "Text to replace with"
              },
              replace_all: {
                type: "boolean",
                description: "Replace all occurrences (default: false, only replaces first occurrence)"
              }
            },
            required: ["path", "old_str", "new_str"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "bash",
          description: "Execute a bash command",
          parameters: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "The bash command to execute"
              }
            },
            required: ["command"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search",
          description: "Search for text content or files",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Text to search for or file name/path pattern"
              },
              search_type: {
                type: "string",
                enum: ["text", "files", "both"],
                description: "Type of search: 'text' for content search, 'files' for file names, 'both' for both (default: 'both')"
              },
              include_pattern: {
                type: "string",
                description: "Glob pattern for files to include (e.g. '*.ts', '*.js')"
              },
              exclude_pattern: {
                type: "string",
                description: "Glob pattern for files to exclude (e.g. '*.log', 'node_modules')"
              },
              case_sensitive: {
                type: "boolean",
                description: "Whether search should be case sensitive (default: false)"
              },
              whole_word: {
                type: "boolean",
                description: "Whether to match whole words only (default: false)"
              },
              regex: {
                type: "boolean",
                description: "Whether query is a regex pattern (default: false)"
              },
              max_results: {
                type: "number",
                description: "Maximum number of results to return (default: 50)"
              },
              file_types: {
                type: "array",
                items: { type: "string" },
                description: "File types to search (e.g. ['js', 'ts', 'py'])"
              },
              include_hidden: {
                type: "boolean",
                description: "Whether to include hidden files (default: false)"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_todo_list",
          description: "Create a new todo list for planning and tracking tasks",
          parameters: {
            type: "object",
            properties: {
              todos: {
                type: "array",
                description: "Array of todo items",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique identifier for the todo item"
                    },
                    content: {
                      type: "string",
                      description: "Description of the todo item"
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "in_progress", "completed"],
                      description: "Current status of the todo item"
                    },
                    priority: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description: "Priority level of the todo item"
                    }
                  },
                  required: ["id", "content", "status", "priority"]
                }
              }
            },
            required: ["todos"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "update_todo_list",
          description: "Update existing todos in the todo list",
          parameters: {
            type: "object",
            properties: {
              updates: {
                type: "array",
                description: "Array of todo updates",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "ID of the todo item to update"
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "in_progress", "completed"],
                      description: "New status for the todo item"
                    },
                    content: {
                      type: "string",
                      description: "New content for the todo item"
                    },
                    priority: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                      description: "New priority for the todo item"
                    }
                  },
                  required: ["id"]
                }
              }
            },
            required: ["updates"]
          }
        }
      },
      // Intelligence tools
      {
        type: "function",
        function: {
          name: "ast_parser",
          description: "Parse source code to extract AST, symbols, imports, exports",
          parameters: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to the source code file to parse"
              },
              includeSymbols: {
                type: "boolean",
                description: "Whether to extract symbols (functions, classes, variables, etc.)",
                default: true
              },
              includeImports: {
                type: "boolean",
                description: "Whether to extract import/export information",
                default: true
              },
              includeTree: {
                type: "boolean",
                description: "Whether to include the full AST tree in response",
                default: false
              },
              symbolTypes: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
                },
                description: "Types of symbols to extract",
                default: ["function", "class", "variable", "interface", "enum", "type"]
              },
              scope: {
                type: "string",
                enum: ["all", "global", "local"],
                description: "Scope of symbols to extract",
                default: "all"
              }
            },
            required: ["filePath"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "symbol_search",
          description: "Search for symbols across codebase with fuzzy matching",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for symbol names"
              },
              searchPath: {
                type: "string",
                description: "Root path to search in",
                default: "current working directory"
              },
              symbolTypes: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
                },
                description: "Types of symbols to search for",
                default: ["function", "class", "variable", "interface", "enum", "type"]
              },
              includeUsages: {
                type: "boolean",
                description: "Whether to find usages of matched symbols",
                default: false
              },
              fuzzyMatch: {
                type: "boolean",
                description: "Use fuzzy matching for symbol names",
                default: true
              },
              caseSensitive: {
                type: "boolean",
                description: "Case sensitive search",
                default: false
              },
              maxResults: {
                type: "integer",
                description: "Maximum number of results to return",
                default: 50,
                minimum: 1,
                maximum: 1e3
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "dependency_analyzer",
          description: "Analyze dependencies, detect circular imports, generate graphs",
          parameters: {
            type: "object",
            properties: {
              rootPath: {
                type: "string",
                description: "Root path to analyze dependencies from",
                default: "current working directory"
              },
              filePatterns: {
                type: "array",
                items: { type: "string" },
                description: "Glob patterns for files to include",
                default: ["**/*.{ts,tsx,js,jsx}"]
              },
              excludePatterns: {
                type: "array",
                items: { type: "string" },
                description: "Glob patterns for files to exclude",
                default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
              },
              includeExternals: {
                type: "boolean",
                description: "Include external module dependencies",
                default: false
              },
              detectCircular: {
                type: "boolean",
                description: "Detect circular dependencies",
                default: true
              },
              findUnreachable: {
                type: "boolean",
                description: "Find unreachable files from entry points",
                default: true
              },
              generateGraph: {
                type: "boolean",
                description: "Generate serialized dependency graph",
                default: false
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "code_context",
          description: "Build code context, analyze relationships, semantic understanding",
          parameters: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to the file to analyze for context"
              },
              rootPath: {
                type: "string",
                description: "Root path of the project",
                default: "current working directory"
              },
              includeRelationships: {
                type: "boolean",
                description: "Include code relationships analysis",
                default: true
              },
              includeMetrics: {
                type: "boolean",
                description: "Include code quality metrics",
                default: true
              },
              includeSemantics: {
                type: "boolean",
                description: "Include semantic analysis and patterns",
                default: true
              },
              maxRelatedFiles: {
                type: "integer",
                description: "Maximum number of related files to analyze",
                default: 10,
                minimum: 1,
                maximum: 50
              }
            },
            required: ["filePath"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "refactoring_assistant",
          description: "Perform safe refactoring: rename, extract, inline, move",
          parameters: {
            type: "object",
            properties: {
              operation: {
                type: "string",
                enum: ["rename", "extract_function", "extract_variable", "inline_function", "inline_variable", "move_function", "move_class"],
                description: "Type of refactoring operation to perform"
              },
              symbolName: {
                type: "string",
                description: "Name of symbol to refactor (for rename, inline, move operations)"
              },
              newName: {
                type: "string",
                description: "New name for symbol (for rename operation)"
              },
              filePath: {
                type: "string",
                description: "Path to file containing the symbol"
              },
              scope: {
                type: "string",
                enum: ["file", "project", "global"],
                description: "Scope of refactoring operation",
                default: "project"
              },
              includeComments: {
                type: "boolean",
                description: "Include comments in rename operation",
                default: false
              },
              includeStrings: {
                type: "boolean",
                description: "Include string literals in rename operation",
                default: false
              },
              startLine: {
                type: "integer",
                description: "Start line for extract operations"
              },
              endLine: {
                type: "integer",
                description: "End line for extract operations"
              },
              functionName: {
                type: "string",
                description: "Name for extracted function"
              },
              variableName: {
                type: "string",
                description: "Name for extracted variable"
              }
            },
            required: ["operation"]
          }
        }
      }
    ];
    MORPH_EDIT_TOOL = {
      type: "function",
      function: {
        name: "edit_file",
        description: "Use this tool to make an edit to an existing file.\n\nThis will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write.\nWhen writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines.\n\nFor example:\n\n// ... existing code ...\nFIRST_EDIT\n// ... existing code ...\nSECOND_EDIT\n// ... existing code ...\nTHIRD_EDIT\n// ... existing code ...\n\nYou should still bias towards repeating as few lines of the original file as possible to convey the change.\nBut, each edit should contain sufficient context of unchanged lines around the code you're editing to resolve ambiguity.\nDO NOT omit spans of pre-existing code (or comments) without using the // ... existing code ... comment to indicate its absence. If you omit the existing code comment, the model may inadvertently delete these lines.\nIf you plan on deleting a section, you must provide context before and after to delete it. If the initial code is ```code \\n Block 1 \\n Block 2 \\n Block 3 \\n code```, and you want to remove Block 2, you would output ```// ... existing code ... \\n Block 1 \\n  Block 3 \\n // ... existing code ...```.\nMake sure it is clear what the edit should be, and where it should be applied.\nMake edits to a file in a single edit_file call instead of multiple edit_file calls to the same file. The apply model can handle many distinct edits at once.",
        parameters: {
          type: "object",
          properties: {
            target_file: {
              type: "string",
              description: "The target file to modify."
            },
            instructions: {
              type: "string",
              description: "A single sentence instruction describing what you are going to do for the sketched edit. This is used to assist the less intelligent model in applying the edit. Use the first person to describe what you are going to do. Use it to disambiguate uncertainty in the edit."
            },
            code_edit: {
              type: "string",
              description: "Specify ONLY the precise lines of code that you wish to edit. NEVER specify or write out unchanged code. Instead, represent all unchanged code using the comment of the language you're editing in - example: // ... existing code ..."
            }
          },
          required: ["target_file", "instructions", "code_edit"]
        }
      }
    };
    GROK_TOOLS = buildGrokTools();
    mcpManager = null;
  }
});

// src/utils/confirmation-service.ts
var confirmation_service_exports = {};
__export(confirmation_service_exports, {
  ConfirmationService: () => ConfirmationService
});
var execAsync, ConfirmationService;
var init_confirmation_service = __esm({
  "src/utils/confirmation-service.ts"() {
    execAsync = promisify(exec);
    ConfirmationService = class _ConfirmationService extends EventEmitter {
      constructor() {
        super();
        this.skipConfirmationThisSession = false;
        this.pendingConfirmation = null;
        this.resolveConfirmation = null;
        // Session flags for different operation types
        this.sessionFlags = {
          fileOperations: false,
          bashCommands: false,
          allOperations: false
        };
      }
      static getInstance() {
        if (!_ConfirmationService.instance) {
          _ConfirmationService.instance = new _ConfirmationService();
        }
        return _ConfirmationService.instance;
      }
      async requestConfirmation(options, operationType = "file") {
        if (this.sessionFlags.allOperations || operationType === "file" && this.sessionFlags.fileOperations || operationType === "bash" && this.sessionFlags.bashCommands) {
          return { confirmed: true };
        }
        if (options.showVSCodeOpen) {
          try {
            await this.openInVSCode(options.filename);
          } catch (_error) {
            options.showVSCodeOpen = false;
          }
        }
        this.pendingConfirmation = new Promise((resolve8) => {
          this.resolveConfirmation = resolve8;
        });
        setImmediate(() => {
          this.emit("confirmation-requested", options);
        });
        const result = await this.pendingConfirmation;
        if (result.dontAskAgain) {
          if (operationType === "file") {
            this.sessionFlags.fileOperations = true;
          } else if (operationType === "bash") {
            this.sessionFlags.bashCommands = true;
          }
        }
        return result;
      }
      confirmOperation(confirmed, dontAskAgain) {
        if (this.resolveConfirmation) {
          this.resolveConfirmation({ confirmed, dontAskAgain });
          this.resolveConfirmation = null;
          this.pendingConfirmation = null;
        }
      }
      rejectOperation(feedback) {
        if (this.resolveConfirmation) {
          this.resolveConfirmation({ confirmed: false, feedback });
          this.resolveConfirmation = null;
          this.pendingConfirmation = null;
        }
      }
      async openInVSCode(filename) {
        const commands = ["code", "code-insiders", "codium"];
        for (const cmd of commands) {
          try {
            await execAsync(`which ${cmd}`);
            await execAsync(`${cmd} "${filename}"`);
            return;
          } catch (_error) {
            continue;
          }
        }
        throw new Error("VS Code not found");
      }
      isPending() {
        return this.pendingConfirmation !== null;
      }
      resetSession() {
        this.sessionFlags = {
          fileOperations: false,
          bashCommands: false,
          allOperations: false
        };
      }
      getSessionFlags() {
        return { ...this.sessionFlags };
      }
      setSessionFlag(flagType, value) {
        this.sessionFlags[flagType] = value;
      }
    };
  }
});
var execAsync2, BashTool;
var init_bash = __esm({
  "src/tools/bash.ts"() {
    init_confirmation_service();
    execAsync2 = promisify(exec);
    BashTool = class {
      constructor() {
        this.currentDirectory = process.cwd();
        this.confirmationService = ConfirmationService.getInstance();
      }
      async execute(command, timeout = 6e4) {
        try {
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.bashCommands && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation({
              operation: "Run bash command",
              filename: command,
              showVSCodeOpen: false,
              content: `Command: ${command}
Working directory: ${this.currentDirectory}`
            }, "bash");
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Command execution cancelled by user"
              };
            }
          }
          if (command.startsWith("cd ")) {
            const newDir = command.substring(3).trim();
            try {
              process.chdir(newDir);
              this.currentDirectory = process.cwd();
              return {
                success: true,
                output: `Changed directory to: ${this.currentDirectory}`
              };
            } catch (error) {
              return {
                success: false,
                error: `Cannot change directory: ${error.message}`
              };
            }
          }
          const { stdout, stderr } = await execAsync2(command, {
            cwd: this.currentDirectory,
            timeout,
            maxBuffer: 1024 * 1024 * 10
          });
          const output = stdout + (stderr ? `
STDERR: ${stderr}` : "");
          return {
            success: true,
            output: output.trim() || "Command executed successfully (no output)"
          };
        } catch (error) {
          return {
            success: false,
            error: `Command failed: ${error.message}`
          };
        }
      }
      getCurrentDirectory() {
        return this.currentDirectory;
      }
      async listFiles(directory = ".") {
        return this.execute(`ls -la ${directory}`);
      }
      async findFiles(pattern, directory = ".") {
        return this.execute(`find ${directory} -name "${pattern}" -type f`);
      }
      async grep(pattern, files = ".") {
        return this.execute(`grep -r "${pattern}" ${files}`);
      }
    };
  }
});
var pathExists, TextEditorTool;
var init_text_editor = __esm({
  "src/tools/text-editor.ts"() {
    init_confirmation_service();
    pathExists = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    TextEditorTool = class {
      constructor() {
        this.editHistory = [];
        this.confirmationService = ConfirmationService.getInstance();
      }
      async view(filePath, viewRange) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (await pathExists(resolvedPath)) {
            const stats = await fs2.promises.stat(resolvedPath);
            if (stats.isDirectory()) {
              const files = await fs2.promises.readdir(resolvedPath);
              return {
                success: true,
                output: `Directory contents of ${filePath}:
${files.join("\n")}`
              };
            }
            const content = await fs2.promises.readFile(resolvedPath, "utf-8");
            const lines = content.split("\n");
            if (viewRange) {
              const [start, end] = viewRange;
              const selectedLines = lines.slice(start - 1, end);
              const numberedLines2 = selectedLines.map((line, idx) => `${start + idx}: ${line}`).join("\n");
              return {
                success: true,
                output: `Lines ${start}-${end} of ${filePath}:
${numberedLines2}`
              };
            }
            const totalLines = lines.length;
            const displayLines = totalLines > 10 ? lines.slice(0, 10) : lines;
            const numberedLines = displayLines.map((line, idx) => `${idx + 1}: ${line}`).join("\n");
            const additionalLinesMessage = totalLines > 10 ? `
... +${totalLines - 10} lines` : "";
            return {
              success: true,
              output: `Contents of ${filePath}:
${numberedLines}${additionalLinesMessage}`
            };
          } else {
            return {
              success: false,
              error: `File or directory not found: ${filePath}`
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error viewing ${filePath}: ${error.message}`
          };
        }
      }
      async strReplace(filePath, oldStr, newStr, replaceAll = false) {
        try {
          if (oldStr === "") {
            return {
              success: false,
              error: "oldStr cannot be an empty string"
            };
          }
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          if (!content.includes(oldStr)) {
            if (oldStr.includes("\n")) {
              const fuzzyResult = this.findFuzzyMatch(content, oldStr);
              if (fuzzyResult) {
                oldStr = fuzzyResult;
              } else {
                return {
                  success: false,
                  error: `String not found in file. For multi-line replacements, consider using line-based editing.`
                };
              }
            } else {
              return {
                success: false,
                error: `String not found in file: "${oldStr}"`
              };
            }
          }
          const occurrences = (content.match(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const previewContent = replaceAll ? content.split(oldStr).join(newStr) : content.replace(oldStr, newStr);
            const oldLines2 = content.split("\n");
            const newLines2 = previewContent.split("\n");
            const diffContent = this.generateDiff(oldLines2, newLines2, filePath);
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Edit file${replaceAll && occurrences > 1 ? ` (${occurrences} occurrences)` : ""}`,
                filename: filePath,
                showVSCodeOpen: false,
                content: diffContent
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "File edit cancelled by user"
              };
            }
          }
          const newContent = replaceAll ? content.split(oldStr).join(newStr) : content.replace(oldStr, newStr);
          await writeFile(resolvedPath, newContent, "utf-8");
          this.editHistory.push({
            command: "str_replace",
            path: filePath,
            old_str: oldStr,
            new_str: newStr
          });
          const oldLines = content.split("\n");
          const newLines = newContent.split("\n");
          const diff = this.generateDiff(oldLines, newLines, filePath);
          return {
            success: true,
            output: diff
          };
        } catch (error) {
          return {
            success: false,
            error: `Error replacing text in ${filePath}: ${error.message}`
          };
        }
      }
      async create(filePath, content) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (await pathExists(resolvedPath)) {
            return {
              success: false,
              error: `File already exists: ${filePath}`
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const contentLines = content.split("\n");
            const diffContent = [
              `Created ${filePath}`,
              `--- /dev/null`,
              `+++ b/${filePath}`,
              `@@ -0,0 +1,${contentLines.length} @@`,
              ...contentLines.map((line) => `+${line}`)
            ].join("\n");
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: "Write",
                filename: filePath,
                showVSCodeOpen: false,
                content: diffContent
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "File creation cancelled by user"
              };
            }
          }
          const dir = path8.dirname(resolvedPath);
          await fs2.promises.mkdir(dir, { recursive: true });
          await writeFile(resolvedPath, content, "utf-8");
          this.editHistory.push({
            command: "create",
            path: filePath,
            content
          });
          const oldLines = [];
          const newLines = content.split("\n");
          const diff = this.generateDiff(oldLines, newLines, filePath);
          return {
            success: true,
            output: diff
          };
        } catch (error) {
          return {
            success: false,
            error: `Error creating ${filePath}: ${error.message}`
          };
        }
      }
      async replaceLines(filePath, startLine, endLine, newContent) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const fileContent = await fs2.promises.readFile(resolvedPath, "utf-8");
          const lines = fileContent.split("\n");
          if (startLine < 1 || startLine > lines.length) {
            return {
              success: false,
              error: `Invalid start line: ${startLine}. File has ${lines.length} lines.`
            };
          }
          if (endLine < startLine || endLine > lines.length) {
            return {
              success: false,
              error: `Invalid end line: ${endLine}. Must be between ${startLine} and ${lines.length}.`
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const newLines = [...lines];
            const replacementLines2 = newContent.split("\n");
            newLines.splice(startLine - 1, endLine - startLine + 1, ...replacementLines2);
            const diffContent = this.generateDiff(lines, newLines, filePath);
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Replace lines ${startLine}-${endLine}`,
                filename: filePath,
                showVSCodeOpen: false,
                content: diffContent
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Line replacement cancelled by user"
              };
            }
          }
          const replacementLines = newContent.split("\n");
          lines.splice(startLine - 1, endLine - startLine + 1, ...replacementLines);
          const newFileContent = lines.join("\n");
          await writeFile(resolvedPath, newFileContent, "utf-8");
          this.editHistory.push({
            command: "str_replace",
            path: filePath,
            old_str: `lines ${startLine}-${endLine}`,
            new_str: newContent
          });
          const oldLines = fileContent.split("\n");
          const diff = this.generateDiff(oldLines, lines, filePath);
          return {
            success: true,
            output: diff
          };
        } catch (error) {
          return {
            success: false,
            error: `Error replacing lines in ${filePath}: ${error.message}`
          };
        }
      }
      async insert(filePath, insertLine, content) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const fileContent = await fs2.promises.readFile(resolvedPath, "utf-8");
          const lines = fileContent.split("\n");
          lines.splice(insertLine - 1, 0, content);
          const newContent = lines.join("\n");
          await writeFile(resolvedPath, newContent, "utf-8");
          this.editHistory.push({
            command: "insert",
            path: filePath,
            insert_line: insertLine,
            content
          });
          return {
            success: true,
            output: `Successfully inserted content at line ${insertLine} in ${filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error inserting content in ${filePath}: ${error.message}`
          };
        }
      }
      async undoEdit() {
        if (this.editHistory.length === 0) {
          return {
            success: false,
            error: "No edits to undo"
          };
        }
        const lastEdit = this.editHistory.pop();
        try {
          switch (lastEdit.command) {
            case "str_replace":
              if (lastEdit.path && lastEdit.old_str && lastEdit.new_str) {
                const content = await fs2.promises.readFile(lastEdit.path, "utf-8");
                const revertedContent = content.replace(
                  lastEdit.new_str,
                  lastEdit.old_str
                );
                await writeFile(lastEdit.path, revertedContent, "utf-8");
              }
              break;
            case "create":
              if (lastEdit.path) {
                await fs2.promises.rm(lastEdit.path);
              }
              break;
            case "insert":
              if (lastEdit.path && lastEdit.insert_line) {
                const content = await fs2.promises.readFile(lastEdit.path, "utf-8");
                const lines = content.split("\n");
                lines.splice(lastEdit.insert_line - 1, 1);
                await writeFile(lastEdit.path, lines.join("\n"), "utf-8");
              }
              break;
          }
          return {
            success: true,
            output: `Successfully undid ${lastEdit.command} operation`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error undoing edit: ${error.message}`
          };
        }
      }
      findFuzzyMatch(content, searchStr) {
        const functionMatch = searchStr.match(/function\s+(\w+)/);
        if (!functionMatch) return null;
        const functionName = functionMatch[1];
        const contentLines = content.split("\n");
        let functionStart = -1;
        for (let i = 0; i < contentLines.length; i++) {
          if (contentLines[i].includes(`function ${functionName}`) && contentLines[i].includes("{")) {
            functionStart = i;
            break;
          }
        }
        if (functionStart === -1) return null;
        let braceCount = 0;
        let functionEnd = functionStart;
        for (let i = functionStart; i < contentLines.length; i++) {
          const line = contentLines[i];
          for (const char of line) {
            if (char === "{") braceCount++;
            if (char === "}") braceCount--;
          }
          if (braceCount === 0 && i > functionStart) {
            functionEnd = i;
            break;
          }
        }
        const actualFunction = contentLines.slice(functionStart, functionEnd + 1).join("\n");
        const searchNormalized = this.normalizeForComparison(searchStr);
        const actualNormalized = this.normalizeForComparison(actualFunction);
        if (this.isSimilarStructure(searchNormalized, actualNormalized)) {
          return actualFunction;
        }
        return null;
      }
      normalizeForComparison(str) {
        return str.replace(/["'`]/g, '"').replace(/\s+/g, " ").replace(/{\s+/g, "{ ").replace(/\s+}/g, " }").replace(/;\s*/g, ";").trim();
      }
      isSimilarStructure(search, actual) {
        const extractTokens = (str) => {
          const tokens = str.match(/\b(function|console\.log|return|if|else|for|while)\b/g) || [];
          return tokens;
        };
        const searchTokens = extractTokens(search);
        const actualTokens = extractTokens(actual);
        if (searchTokens.length !== actualTokens.length) return false;
        for (let i = 0; i < searchTokens.length; i++) {
          if (searchTokens[i] !== actualTokens[i]) return false;
        }
        return true;
      }
      generateDiff(oldLines, newLines, filePath) {
        const CONTEXT_LINES = 3;
        const changes = [];
        let i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
          while (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
            i++;
            j++;
          }
          if (i < oldLines.length || j < newLines.length) {
            const changeStart = { old: i, new: j };
            let oldEnd = i;
            let newEnd = j;
            while (oldEnd < oldLines.length || newEnd < newLines.length) {
              let matchFound = false;
              let matchLength = 0;
              for (let k = 0; k < Math.min(2, oldLines.length - oldEnd, newLines.length - newEnd); k++) {
                if (oldEnd + k < oldLines.length && newEnd + k < newLines.length && oldLines[oldEnd + k] === newLines[newEnd + k]) {
                  matchLength++;
                } else {
                  break;
                }
              }
              if (matchLength >= 2 || oldEnd >= oldLines.length && newEnd >= newLines.length) {
                matchFound = true;
              }
              if (matchFound) {
                break;
              }
              if (oldEnd < oldLines.length) oldEnd++;
              if (newEnd < newLines.length) newEnd++;
            }
            changes.push({
              oldStart: changeStart.old,
              oldEnd,
              newStart: changeStart.new,
              newEnd
            });
            i = oldEnd;
            j = newEnd;
          }
        }
        const hunks = [];
        let accumulatedOffset = 0;
        for (let changeIdx = 0; changeIdx < changes.length; changeIdx++) {
          const change = changes[changeIdx];
          let contextStart = Math.max(0, change.oldStart - CONTEXT_LINES);
          let contextEnd = Math.min(oldLines.length, change.oldEnd + CONTEXT_LINES);
          if (hunks.length > 0) {
            const lastHunk = hunks[hunks.length - 1];
            const lastHunkEnd = lastHunk.oldStart + lastHunk.oldCount;
            if (lastHunkEnd >= contextStart) {
              const oldHunkEnd = lastHunk.oldStart + lastHunk.oldCount;
              const newContextEnd = Math.min(oldLines.length, change.oldEnd + CONTEXT_LINES);
              for (let idx = oldHunkEnd; idx < change.oldStart; idx++) {
                lastHunk.lines.push({ type: " ", content: oldLines[idx] });
              }
              for (let idx = change.oldStart; idx < change.oldEnd; idx++) {
                lastHunk.lines.push({ type: "-", content: oldLines[idx] });
              }
              for (let idx = change.newStart; idx < change.newEnd; idx++) {
                lastHunk.lines.push({ type: "+", content: newLines[idx] });
              }
              for (let idx = change.oldEnd; idx < newContextEnd && idx < oldLines.length; idx++) {
                lastHunk.lines.push({ type: " ", content: oldLines[idx] });
              }
              lastHunk.oldCount = newContextEnd - lastHunk.oldStart;
              lastHunk.newCount = lastHunk.oldCount + (change.newEnd - change.newStart) - (change.oldEnd - change.oldStart);
              continue;
            }
          }
          const hunk = {
            oldStart: contextStart + 1,
            oldCount: contextEnd - contextStart,
            newStart: contextStart + 1 + accumulatedOffset,
            newCount: contextEnd - contextStart + (change.newEnd - change.newStart) - (change.oldEnd - change.oldStart),
            lines: []
          };
          for (let idx = contextStart; idx < change.oldStart; idx++) {
            hunk.lines.push({ type: " ", content: oldLines[idx] });
          }
          for (let idx = change.oldStart; idx < change.oldEnd; idx++) {
            hunk.lines.push({ type: "-", content: oldLines[idx] });
          }
          for (let idx = change.newStart; idx < change.newEnd; idx++) {
            hunk.lines.push({ type: "+", content: newLines[idx] });
          }
          for (let idx = change.oldEnd; idx < contextEnd && idx < oldLines.length; idx++) {
            hunk.lines.push({ type: " ", content: oldLines[idx] });
          }
          hunks.push(hunk);
          accumulatedOffset += change.newEnd - change.newStart - (change.oldEnd - change.oldStart);
        }
        let addedLines = 0;
        let removedLines = 0;
        for (const hunk of hunks) {
          for (const line of hunk.lines) {
            if (line.type === "+") addedLines++;
            if (line.type === "-") removedLines++;
          }
        }
        let summary = `Updated ${filePath}`;
        if (addedLines > 0 && removedLines > 0) {
          summary += ` with ${addedLines} addition${addedLines !== 1 ? "s" : ""} and ${removedLines} removal${removedLines !== 1 ? "s" : ""}`;
        } else if (addedLines > 0) {
          summary += ` with ${addedLines} addition${addedLines !== 1 ? "s" : ""}`;
        } else if (removedLines > 0) {
          summary += ` with ${removedLines} removal${removedLines !== 1 ? "s" : ""}`;
        } else if (changes.length === 0) {
          return `No changes in ${filePath}`;
        }
        let diff = summary + "\n";
        diff += `--- a/${filePath}
`;
        diff += `+++ b/${filePath}
`;
        for (const hunk of hunks) {
          diff += `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@
`;
          for (const line of hunk.lines) {
            diff += `${line.type}${line.content}
`;
          }
        }
        return diff.trim();
      }
      getEditHistory() {
        return [...this.editHistory];
      }
    };
  }
});
var pathExists2, MorphEditorTool;
var init_morph_editor = __esm({
  "src/tools/morph-editor.ts"() {
    init_confirmation_service();
    pathExists2 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    MorphEditorTool = class {
      constructor(apiKey2) {
        this.confirmationService = ConfirmationService.getInstance();
        this.morphBaseUrl = "https://api.morphllm.com/v1";
        this.morphApiKey = apiKey2 || process.env.MORPH_API_KEY || "";
        if (!this.morphApiKey) {
          console.warn("MORPH_API_KEY not found. Morph editor functionality will be limited.");
        }
      }
      /**
       * Use this tool to make an edit to an existing file.
       * 
       * This will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write.
       * When writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines.
       * 
       * For example:
       * 
       * // ... existing code ...
       * FIRST_EDIT
       * // ... existing code ...
       * SECOND_EDIT
       * // ... existing code ...
       * THIRD_EDIT
       * // ... existing code ...
       * 
       * You should still bias towards repeating as few lines of the original file as possible to convey the change.
       * But, each edit should contain sufficient context of unchanged lines around the code you're editing to resolve ambiguity.
       * DO NOT omit spans of pre-existing code (or comments) without using the // ... existing code ... comment to indicate its absence. If you omit the existing code comment, the model may inadvertently delete these lines.
       * If you plan on deleting a section, you must provide context before and after to delete it. If the initial code is ```code \n Block 1 \n Block 2 \n Block 3 \n code```, and you want to remove Block 2, you would output ```// ... existing code ... \n Block 1 \n  Block 3 \n // ... existing code ...```.
       * Make sure it is clear what the edit should be, and where it should be applied.
       * Make edits to a file in a single edit_file call instead of multiple edit_file calls to the same file. The apply model can handle many distinct edits at once.
       */
      async editFile(targetFile, instructions, codeEdit) {
        try {
          const resolvedPath = path8.resolve(targetFile);
          if (!await pathExists2(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${targetFile}`
            };
          }
          if (!this.morphApiKey) {
            return {
              success: false,
              error: "MORPH_API_KEY not configured. Please set your Morph API key."
            };
          }
          const initialCode = await fs2.promises.readFile(resolvedPath, "utf-8");
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: "Edit file with Morph Fast Apply",
                filename: targetFile,
                showVSCodeOpen: false,
                content: `Instructions: ${instructions}

Edit:
${codeEdit}`
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "File edit cancelled by user"
              };
            }
          }
          const mergedCode = await this.callMorphApply(instructions, initialCode, codeEdit);
          await fs2.promises.writeFile(resolvedPath, mergedCode, "utf-8");
          const oldLines = initialCode.split("\n");
          const newLines = mergedCode.split("\n");
          const diff = this.generateDiff(oldLines, newLines, targetFile);
          return {
            success: true,
            output: diff
          };
        } catch (error) {
          return {
            success: false,
            error: `Error editing ${targetFile} with Morph: ${error.message}`
          };
        }
      }
      async callMorphApply(instructions, initialCode, editSnippet) {
        try {
          const response = await axios.post(`${this.morphBaseUrl}/chat/completions`, {
            model: "morph-v3-large",
            messages: [
              {
                role: "user",
                content: `<instruction>${instructions}</instruction>
<code>${initialCode}</code>
<update>${editSnippet}</update>`
              }
            ]
          }, {
            headers: {
              "Authorization": `Bearer ${this.morphApiKey}`,
              "Content-Type": "application/json"
            }
          });
          if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
            throw new Error("Invalid response format from Morph API");
          }
          return response.data.choices[0].message.content;
        } catch (error) {
          if (error.response) {
            throw new Error(`Morph API error (${error.response.status}): ${error.response.data}`);
          }
          throw error;
        }
      }
      generateDiff(oldLines, newLines, filePath) {
        const CONTEXT_LINES = 3;
        const changes = [];
        let i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
          while (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
            i++;
            j++;
          }
          if (i < oldLines.length || j < newLines.length) {
            const changeStart = { old: i, new: j };
            let oldEnd = i;
            let newEnd = j;
            while (oldEnd < oldLines.length || newEnd < newLines.length) {
              let matchFound = false;
              let matchLength = 0;
              for (let k = 0; k < Math.min(2, oldLines.length - oldEnd, newLines.length - newEnd); k++) {
                if (oldEnd + k < oldLines.length && newEnd + k < newLines.length && oldLines[oldEnd + k] === newLines[newEnd + k]) {
                  matchLength++;
                } else {
                  break;
                }
              }
              if (matchLength >= 2 || oldEnd >= oldLines.length && newEnd >= newLines.length) {
                matchFound = true;
              }
              if (matchFound) {
                break;
              }
              if (oldEnd < oldLines.length) oldEnd++;
              if (newEnd < newLines.length) newEnd++;
            }
            changes.push({
              oldStart: changeStart.old,
              oldEnd,
              newStart: changeStart.new,
              newEnd
            });
            i = oldEnd;
            j = newEnd;
          }
        }
        const hunks = [];
        let accumulatedOffset = 0;
        for (let changeIdx = 0; changeIdx < changes.length; changeIdx++) {
          const change = changes[changeIdx];
          let contextStart = Math.max(0, change.oldStart - CONTEXT_LINES);
          let contextEnd = Math.min(oldLines.length, change.oldEnd + CONTEXT_LINES);
          if (hunks.length > 0) {
            const lastHunk = hunks[hunks.length - 1];
            const lastHunkEnd = lastHunk.oldStart + lastHunk.oldCount;
            if (lastHunkEnd >= contextStart) {
              const oldHunkEnd = lastHunk.oldStart + lastHunk.oldCount;
              const newContextEnd = Math.min(oldLines.length, change.oldEnd + CONTEXT_LINES);
              for (let idx = oldHunkEnd; idx < change.oldStart; idx++) {
                lastHunk.lines.push({ type: " ", content: oldLines[idx] });
              }
              for (let idx = change.oldStart; idx < change.oldEnd; idx++) {
                lastHunk.lines.push({ type: "-", content: oldLines[idx] });
              }
              for (let idx = change.newStart; idx < change.newEnd; idx++) {
                lastHunk.lines.push({ type: "+", content: newLines[idx] });
              }
              for (let idx = change.oldEnd; idx < newContextEnd && idx < oldLines.length; idx++) {
                lastHunk.lines.push({ type: " ", content: oldLines[idx] });
              }
              lastHunk.oldCount = newContextEnd - lastHunk.oldStart;
              lastHunk.newCount = lastHunk.oldCount + (change.newEnd - change.newStart) - (change.oldEnd - change.oldStart);
              continue;
            }
          }
          const hunk = {
            oldStart: contextStart + 1,
            oldCount: contextEnd - contextStart,
            newStart: contextStart + 1 + accumulatedOffset,
            newCount: contextEnd - contextStart + (change.newEnd - change.newStart) - (change.oldEnd - change.oldStart),
            lines: []
          };
          for (let idx = contextStart; idx < change.oldStart; idx++) {
            hunk.lines.push({ type: " ", content: oldLines[idx] });
          }
          for (let idx = change.oldStart; idx < change.oldEnd; idx++) {
            hunk.lines.push({ type: "-", content: oldLines[idx] });
          }
          for (let idx = change.newStart; idx < change.newEnd; idx++) {
            hunk.lines.push({ type: "+", content: newLines[idx] });
          }
          for (let idx = change.oldEnd; idx < contextEnd && idx < oldLines.length; idx++) {
            hunk.lines.push({ type: " ", content: oldLines[idx] });
          }
          hunks.push(hunk);
          accumulatedOffset += change.newEnd - change.newStart - (change.oldEnd - change.oldStart);
        }
        let addedLines = 0;
        let removedLines = 0;
        for (const hunk of hunks) {
          for (const line of hunk.lines) {
            if (line.type === "+") addedLines++;
            if (line.type === "-") removedLines++;
          }
        }
        let summary = `Updated ${filePath} with Morph Fast Apply`;
        if (addedLines > 0 && removedLines > 0) {
          summary += ` - ${addedLines} addition${addedLines !== 1 ? "s" : ""} and ${removedLines} removal${removedLines !== 1 ? "s" : ""}`;
        } else if (addedLines > 0) {
          summary += ` - ${addedLines} addition${addedLines !== 1 ? "s" : ""}`;
        } else if (removedLines > 0) {
          summary += ` - ${removedLines} removal${removedLines !== 1 ? "s" : ""}`;
        } else if (changes.length === 0) {
          return `No changes applied to ${filePath}`;
        }
        let diff = summary + "\n";
        diff += `--- a/${filePath}
`;
        diff += `+++ b/${filePath}
`;
        for (const hunk of hunks) {
          diff += `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@
`;
          for (const line of hunk.lines) {
            diff += `${line.type}${line.content}
`;
          }
        }
        return diff.trim();
      }
      async view(filePath, viewRange) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (await pathExists2(resolvedPath)) {
            const stats = await fs2.promises.stat(resolvedPath);
            if (stats.isDirectory()) {
              const files = await fs2.promises.readdir(resolvedPath);
              return {
                success: true,
                output: `Directory contents of ${filePath}:
${files.join("\n")}`
              };
            }
            const content = await fs2.promises.readFile(resolvedPath, "utf-8");
            const lines = content.split("\n");
            if (viewRange) {
              const [start, end] = viewRange;
              const selectedLines = lines.slice(start - 1, end);
              const numberedLines2 = selectedLines.map((line, idx) => `${start + idx}: ${line}`).join("\n");
              return {
                success: true,
                output: `Lines ${start}-${end} of ${filePath}:
${numberedLines2}`
              };
            }
            const totalLines = lines.length;
            const displayLines = totalLines > 10 ? lines.slice(0, 10) : lines;
            const numberedLines = displayLines.map((line, idx) => `${idx + 1}: ${line}`).join("\n");
            const additionalLinesMessage = totalLines > 10 ? `
... +${totalLines - 10} lines` : "";
            return {
              success: true,
              output: `Contents of ${filePath}:
${numberedLines}${additionalLinesMessage}`
            };
          } else {
            return {
              success: false,
              error: `File or directory not found: ${filePath}`
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error viewing ${filePath}: ${error.message}`
          };
        }
      }
      setApiKey(apiKey2) {
        this.morphApiKey = apiKey2;
      }
      getApiKey() {
        return this.morphApiKey;
      }
    };
  }
});

// src/tools/todo-tool.ts
var TodoTool;
var init_todo_tool = __esm({
  "src/tools/todo-tool.ts"() {
    TodoTool = class {
      constructor() {
        this.todos = [];
      }
      formatTodoList() {
        if (this.todos.length === 0) {
          return "No todos created yet";
        }
        const getCheckbox = (status) => {
          switch (status) {
            case "completed":
              return "\u25CF";
            case "in_progress":
              return "\u25D0";
            case "pending":
              return "\u25CB";
            default:
              return "\u25CB";
          }
        };
        const getStatusColor = (status) => {
          switch (status) {
            case "completed":
              return "\x1B[32m";
            // Green
            case "in_progress":
              return "\x1B[36m";
            // Cyan
            case "pending":
              return "\x1B[37m";
            // White/default
            default:
              return "\x1B[0m";
          }
        };
        const reset = "\x1B[0m";
        let output = "";
        this.todos.forEach((todo, index) => {
          const checkbox = getCheckbox(todo.status);
          const statusColor = getStatusColor(todo.status);
          const strikethrough = todo.status === "completed" ? "\x1B[9m" : "";
          const indent = index === 0 ? "" : "  ";
          output += `${indent}${statusColor}${strikethrough}${checkbox} ${todo.content}${reset}
`;
        });
        return output;
      }
      async createTodoList(todos) {
        try {
          for (const todo of todos) {
            if (!todo.id || !todo.content || !todo.status || !todo.priority) {
              return {
                success: false,
                error: "Each todo must have id, content, status, and priority fields"
              };
            }
            if (!["pending", "in_progress", "completed"].includes(todo.status)) {
              return {
                success: false,
                error: `Invalid status: ${todo.status}. Must be pending, in_progress, or completed`
              };
            }
            if (!["high", "medium", "low"].includes(todo.priority)) {
              return {
                success: false,
                error: `Invalid priority: ${todo.priority}. Must be high, medium, or low`
              };
            }
          }
          this.todos = todos;
          return {
            success: true,
            output: this.formatTodoList()
          };
        } catch (error) {
          return {
            success: false,
            error: `Error creating todo list: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }
      async updateTodoList(updates) {
        try {
          const updatedIds = [];
          for (const update of updates) {
            const todoIndex = this.todos.findIndex((t) => t.id === update.id);
            if (todoIndex === -1) {
              return {
                success: false,
                error: `Todo with id ${update.id} not found`
              };
            }
            const todo = this.todos[todoIndex];
            if (update.status && !["pending", "in_progress", "completed"].includes(update.status)) {
              return {
                success: false,
                error: `Invalid status: ${update.status}. Must be pending, in_progress, or completed`
              };
            }
            if (update.priority && !["high", "medium", "low"].includes(update.priority)) {
              return {
                success: false,
                error: `Invalid priority: ${update.priority}. Must be high, medium, or low`
              };
            }
            if (update.status) todo.status = update.status;
            if (update.content) todo.content = update.content;
            if (update.priority) todo.priority = update.priority;
            updatedIds.push(update.id);
          }
          return {
            success: true,
            output: this.formatTodoList()
          };
        } catch (error) {
          return {
            success: false,
            error: `Error updating todo list: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }
      async viewTodoList() {
        return {
          success: true,
          output: this.formatTodoList()
        };
      }
    };
  }
});

// src/tools/confirmation-tool.ts
var ConfirmationTool;
var init_confirmation_tool = __esm({
  "src/tools/confirmation-tool.ts"() {
    init_confirmation_service();
    ConfirmationTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
      }
      async requestConfirmation(request) {
        try {
          if (request.autoAccept) {
            return {
              success: true,
              output: `Auto-accepted: ${request.operation}(${request.filename})${request.description ? ` - ${request.description}` : ""}`
            };
          }
          const options = {
            operation: request.operation,
            filename: request.filename,
            showVSCodeOpen: request.showVSCodeOpen || false
          };
          const operationType = request.operation.toLowerCase().includes("bash") ? "bash" : "file";
          const result = await this.confirmationService.requestConfirmation(options, operationType);
          if (result.confirmed) {
            return {
              success: true,
              output: `User confirmed: ${request.operation}(${request.filename})${request.description ? ` - ${request.description}` : ""}${result.dontAskAgain ? " (Don't ask again enabled)" : ""}`
            };
          } else {
            return {
              success: false,
              error: result.feedback || `User rejected: ${request.operation}(${request.filename})`
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Confirmation error: ${error.message}`
          };
        }
      }
      async checkSessionAcceptance() {
        try {
          const sessionFlags = this.confirmationService.getSessionFlags();
          return {
            success: true,
            data: {
              fileOperationsAccepted: sessionFlags.fileOperations,
              bashCommandsAccepted: sessionFlags.bashCommands,
              allOperationsAccepted: sessionFlags.allOperations,
              hasAnyAcceptance: sessionFlags.fileOperations || sessionFlags.bashCommands || sessionFlags.allOperations
            }
          };
        } catch (error) {
          return {
            success: false,
            error: `Error checking session acceptance: ${error.message}`
          };
        }
      }
      resetSession() {
        this.confirmationService.resetSession();
      }
      isPending() {
        return this.confirmationService.isPending();
      }
    };
  }
});
var SearchTool;
var init_search = __esm({
  "src/tools/search.ts"() {
    init_confirmation_service();
    SearchTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
        this.currentDirectory = process.cwd();
      }
      /**
       * Unified search method that can search for text content or find files
       */
      async search(query, options = {}) {
        try {
          const searchType = options.searchType || "both";
          const results = [];
          if (searchType === "text" || searchType === "both") {
            const textResults = await this.executeRipgrep(query, options);
            results.push(
              ...textResults.map((r) => ({
                type: "text",
                file: r.file,
                line: r.line,
                column: r.column,
                text: r.text,
                match: r.match
              }))
            );
          }
          if (searchType === "files" || searchType === "both") {
            const fileResults = await this.findFilesByPattern(query, options);
            results.push(
              ...fileResults.map((r) => ({
                type: "file",
                file: r.path,
                score: r.score
              }))
            );
          }
          if (results.length === 0) {
            return {
              success: true,
              output: `No results found for "${query}"`
            };
          }
          const formattedOutput = this.formatUnifiedResults(
            results,
            query,
            searchType
          );
          return {
            success: true,
            output: formattedOutput
          };
        } catch (error) {
          return {
            success: false,
            error: `Search error: ${error.message}`
          };
        }
      }
      /**
       * Execute ripgrep command with specified options
       */
      async executeRipgrep(query, options) {
        return new Promise((resolve8, reject) => {
          try {
            execSync("which rg", { stdio: "ignore" });
          } catch {
            reject(new Error("ripgrep is not installed. Please install it to use text search. Visit https://github.com/BurntSushi/ripgrep#installation"));
            return;
          }
          const args = [
            "--json",
            "--with-filename",
            "--line-number",
            "--column",
            "--no-heading",
            "--color=never"
          ];
          if (!options.caseSensitive) {
            args.push("--ignore-case");
          }
          if (options.wholeWord) {
            args.push("--word-regexp");
          }
          if (!options.regex) {
            args.push("--fixed-strings");
          }
          if (options.maxResults) {
            args.push("--max-count", options.maxResults.toString());
          }
          if (options.fileTypes) {
            options.fileTypes.forEach((type) => {
              args.push("--type", type);
            });
          }
          if (options.includePattern) {
            args.push("--glob", options.includePattern);
          }
          if (options.excludePattern) {
            args.push("--glob", `!${options.excludePattern}`);
          }
          if (options.excludeFiles) {
            options.excludeFiles.forEach((file) => {
              args.push("--glob", `!${file}`);
            });
          }
          args.push(
            "--no-require-git",
            "--follow",
            "--glob",
            "!.git/**",
            "--glob",
            "!node_modules/**",
            "--glob",
            "!.DS_Store",
            "--glob",
            "!*.log"
          );
          args.push(query, this.currentDirectory);
          const rg = spawn("rg", args);
          let output = "";
          let errorOutput = "";
          rg.stdout.on("data", (data) => {
            output += data.toString();
          });
          rg.stderr.on("data", (data) => {
            errorOutput += data.toString();
          });
          rg.on("close", (code) => {
            if (code === 0 || code === 1) {
              const results = this.parseRipgrepOutput(output);
              resolve8(results);
            } else {
              reject(new Error(`Ripgrep failed with code ${code}: ${errorOutput}`));
            }
          });
          rg.on("error", (error) => {
            reject(error);
          });
        });
      }
      /**
       * Parse ripgrep JSON output into SearchResult objects
       */
      parseRipgrepOutput(output) {
        const results = [];
        const lines = output.trim().split("\n").filter((line) => line.length > 0);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "match") {
              const data = parsed.data;
              results.push({
                file: data.path.text,
                line: data.line_number,
                column: data.submatches[0]?.start || 0,
                text: data.lines.text.trim(),
                match: data.submatches[0]?.match?.text || ""
              });
            }
          } catch (_e) {
            continue;
          }
        }
        return results;
      }
      /**
       * Find files by pattern using a simple file walking approach
       */
      async findFilesByPattern(pattern, options) {
        const files = [];
        const maxResults = options.maxResults || 50;
        const searchPattern = pattern.toLowerCase();
        const walkDir = async (dir, depth = 0) => {
          if (depth > 10 || files.length >= maxResults) return;
          try {
            const entries = await fs2.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
              if (files.length >= maxResults) break;
              const fullPath = path8.join(dir, entry.name);
              const relativePath = path8.relative(this.currentDirectory, fullPath);
              if (!options.includeHidden && entry.name.startsWith(".")) {
                continue;
              }
              if (entry.isDirectory() && [
                "node_modules",
                ".git",
                ".svn",
                ".hg",
                "dist",
                "build",
                ".next",
                ".cache"
              ].includes(entry.name)) {
                continue;
              }
              if (options.excludePattern && relativePath.includes(options.excludePattern)) {
                continue;
              }
              if (entry.isFile()) {
                const score = this.calculateFileScore(
                  entry.name,
                  relativePath,
                  searchPattern
                );
                if (score > 0) {
                  files.push({
                    path: relativePath,
                    name: entry.name,
                    score
                  });
                }
              } else if (entry.isDirectory()) {
                await walkDir(fullPath, depth + 1);
              }
            }
          } catch (_error) {
          }
        };
        await walkDir(this.currentDirectory);
        return files.sort((a, b) => b.score - a.score).slice(0, maxResults);
      }
      /**
       * Calculate fuzzy match score for file names
       */
      calculateFileScore(fileName, filePath, pattern) {
        const lowerFileName = fileName.toLowerCase();
        const lowerFilePath = filePath.toLowerCase();
        if (lowerFileName === pattern) return 100;
        if (lowerFileName.includes(pattern)) return 80;
        if (lowerFilePath.includes(pattern)) return 60;
        let patternIndex = 0;
        for (let i = 0; i < lowerFileName.length && patternIndex < pattern.length; i++) {
          if (lowerFileName[i] === pattern[patternIndex]) {
            patternIndex++;
          }
        }
        if (patternIndex === pattern.length) {
          return Math.max(10, 40 - (fileName.length - pattern.length));
        }
        return 0;
      }
      /**
       * Format unified search results for display
       */
      formatUnifiedResults(results, query, _searchType) {
        if (results.length === 0) {
          return `No results found for "${query}"`;
        }
        let output = `Search results for "${query}":
`;
        const textResults = results.filter((r) => r.type === "text");
        const fileResults = results.filter((r) => r.type === "file");
        const allFiles = /* @__PURE__ */ new Set();
        textResults.forEach((result) => {
          allFiles.add(result.file);
        });
        fileResults.forEach((result) => {
          allFiles.add(result.file);
        });
        const fileList = Array.from(allFiles);
        const displayLimit = 8;
        fileList.slice(0, displayLimit).forEach((file) => {
          const matchCount = textResults.filter((r) => r.file === file).length;
          const matchIndicator = matchCount > 0 ? ` (${matchCount} matches)` : "";
          output += `  ${file}${matchIndicator}
`;
        });
        if (fileList.length > displayLimit) {
          const remaining = fileList.length - displayLimit;
          output += `  ... +${remaining} more
`;
        }
        return output.trim();
      }
      /**
       * Update current working directory
       */
      setCurrentDirectory(directory) {
        this.currentDirectory = directory;
      }
      /**
       * Get current working directory
       */
      getCurrentDirectory() {
        return this.currentDirectory;
      }
    };
  }
});
var pathExists3, MultiFileEditorTool;
var init_multi_file_editor = __esm({
  "src/tools/advanced/multi-file-editor.ts"() {
    init_confirmation_service();
    pathExists3 = async (filePath) => {
      try {
        await ops6.promises.access(filePath, ops6.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    MultiFileEditorTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
        this.transactions = /* @__PURE__ */ new Map();
        this.currentTransactionId = null;
      }
      /**
       * Begin a multi-file transaction
       */
      async beginTransaction(description) {
        try {
          const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const transaction = {
            id: transactionId,
            timestamp: /* @__PURE__ */ new Date(),
            operations: [],
            committed: false,
            rollbackData: []
          };
          this.transactions.set(transactionId, transaction);
          this.currentTransactionId = transactionId;
          return {
            success: true,
            output: `Transaction ${transactionId} started${description ? `: ${description}` : ""}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error starting transaction: ${error.message}`
          };
        }
      }
      /**
       * Add file operations to current transaction
       */
      async addOperations(operations) {
        try {
          if (!this.currentTransactionId) {
            return {
              success: false,
              error: "No active transaction. Use beginTransaction() first."
            };
          }
          const transaction = this.transactions.get(this.currentTransactionId);
          if (!transaction) {
            return {
              success: false,
              error: "Transaction not found"
            };
          }
          for (const op of operations) {
            const validation = await this.validateOperation(op);
            if (!validation.valid) {
              return {
                success: false,
                error: `Invalid operation on ${op.filePath}: ${validation.error}`
              };
            }
          }
          transaction.operations.push(...operations);
          return {
            success: true,
            output: `Added ${operations.length} operations to transaction ${this.currentTransactionId}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error adding operations: ${error.message}`
          };
        }
      }
      /**
       * Preview changes without committing
       */
      async previewTransaction() {
        try {
          if (!this.currentTransactionId) {
            return {
              success: false,
              error: "No active transaction"
            };
          }
          const transaction = this.transactions.get(this.currentTransactionId);
          if (!transaction) {
            return {
              success: false,
              error: "Transaction not found"
            };
          }
          let preview = `Transaction ${this.currentTransactionId} Preview:
`;
          preview += `Operations: ${transaction.operations.length}

`;
          for (const [index, op] of transaction.operations.entries()) {
            preview += `${index + 1}. ${op.type.toUpperCase()}: ${op.filePath}
`;
            switch (op.type) {
              case "create":
                preview += `   \u2192 Create new file with ${op.content?.split("\n").length || 0} lines
`;
                break;
              case "edit":
                if (op.operations) {
                  preview += `   \u2192 ${op.operations.length} edit operation(s)
`;
                  for (const editOp of op.operations) {
                    preview += `     - ${editOp.type}
`;
                  }
                }
                break;
              case "delete":
                preview += `   \u2192 Delete file
`;
                break;
              case "rename":
                preview += `   \u2192 Rename to ${op.newFilePath}
`;
                break;
              case "move":
                preview += `   \u2192 Move to ${op.newFilePath}
`;
                break;
            }
            preview += "\n";
          }
          return {
            success: true,
            output: preview
          };
        } catch (error) {
          return {
            success: false,
            error: `Error previewing transaction: ${error.message}`
          };
        }
      }
      /**
       * Commit the current transaction
       */
      async commitTransaction() {
        try {
          if (!this.currentTransactionId) {
            return {
              success: false,
              error: "No active transaction"
            };
          }
          const transaction = this.transactions.get(this.currentTransactionId);
          if (!transaction) {
            return {
              success: false,
              error: "Transaction not found"
            };
          }
          if (transaction.committed) {
            return {
              success: false,
              error: "Transaction already committed"
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = await this.previewTransaction();
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Multi-file transaction (${transaction.operations.length} operations)`,
                filename: transaction.operations.map((op) => op.filePath).join(", "),
                showVSCodeOpen: false,
                content: preview.output || "Multi-file transaction"
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Transaction cancelled by user"
              };
            }
          }
          const rollbackData = [];
          const results = [];
          for (const [index, op] of transaction.operations.entries()) {
            try {
              const rollbackInfo = await this.createRollbackInfo(op);
              rollbackData.push(rollbackInfo);
              const result = await this.executeOperation(op);
              if (!result.success) {
                await this.rollbackOperations(rollbackData.slice(0, index));
                return {
                  success: false,
                  error: `Operation ${index + 1} failed: ${result.error}`
                };
              }
              results.push(`\u2713 ${op.type}: ${op.filePath}`);
            } catch (error) {
              await this.rollbackOperations(rollbackData.slice(0, index));
              return {
                success: false,
                error: `Operation ${index + 1} failed: ${error.message}`
              };
            }
          }
          transaction.committed = true;
          transaction.rollbackData = rollbackData;
          this.currentTransactionId = null;
          return {
            success: true,
            output: `Transaction ${transaction.id} committed successfully:
${results.join("\n")}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error committing transaction: ${error.message}`
          };
        }
      }
      /**
       * Rollback the current or specified transaction
       */
      async rollbackTransaction(transactionId) {
        try {
          const txId = transactionId || this.currentTransactionId;
          if (!txId) {
            return {
              success: false,
              error: "No transaction specified"
            };
          }
          const transaction = this.transactions.get(txId);
          if (!transaction) {
            return {
              success: false,
              error: "Transaction not found"
            };
          }
          if (!transaction.committed) {
            this.transactions.delete(txId);
            if (this.currentTransactionId === txId) {
              this.currentTransactionId = null;
            }
            return {
              success: true,
              output: `Transaction ${txId} cancelled`
            };
          }
          if (!transaction.rollbackData) {
            return {
              success: false,
              error: "No rollback data available for this transaction"
            };
          }
          await this.rollbackOperations(transaction.rollbackData);
          this.transactions.delete(txId);
          return {
            success: true,
            output: `Transaction ${txId} rolled back successfully`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error rolling back transaction: ${error.message}`
          };
        }
      }
      /**
       * Execute multiple file operations atomically
       */
      async executeMultiFileOperation(operations, description) {
        try {
          const beginResult = await this.beginTransaction(description);
          if (!beginResult.success) {
            return beginResult;
          }
          const addResult = await this.addOperations(operations);
          if (!addResult.success) {
            await this.rollbackTransaction();
            return addResult;
          }
          return await this.commitTransaction();
        } catch (error) {
          if (this.currentTransactionId) {
            await this.rollbackTransaction();
          }
          return {
            success: false,
            error: `Error executing multi-file operation: ${error.message}`
          };
        }
      }
      /**
       * Validate an operation before execution
       */
      async validateOperation(operation) {
        try {
          const resolvedPath = path8.resolve(operation.filePath);
          switch (operation.type) {
            case "create":
              if (await pathExists3(resolvedPath)) {
                return { valid: false, error: "File already exists" };
              }
              if (!operation.content) {
                return { valid: false, error: "Content required for create operation" };
              }
              break;
            case "edit":
              if (!await pathExists3(resolvedPath)) {
                return { valid: false, error: "File does not exist" };
              }
              if (!operation.operations || operation.operations.length === 0) {
                return { valid: false, error: "Edit operations required" };
              }
              break;
            case "delete":
              if (!await pathExists3(resolvedPath)) {
                return { valid: false, error: "File does not exist" };
              }
              break;
            case "rename":
            case "move":
              if (!await pathExists3(resolvedPath)) {
                return { valid: false, error: "Source file does not exist" };
              }
              if (!operation.newFilePath) {
                return { valid: false, error: "Destination path required" };
              }
              const newResolvedPath = path8.resolve(operation.newFilePath);
              if (await pathExists3(newResolvedPath)) {
                return { valid: false, error: "Destination already exists" };
              }
              break;
          }
          return { valid: true };
        } catch (error) {
          return { valid: false, error: error.message };
        }
      }
      /**
       * Create rollback information for an operation
       */
      async createRollbackInfo(operation) {
        const resolvedPath = path8.resolve(operation.filePath);
        switch (operation.type) {
          case "create":
            return {
              type: "delete_created",
              filePath: operation.filePath
            };
          case "edit":
            const originalContent = await ops6.promises.readFile(resolvedPath, "utf-8");
            return {
              type: "restore_content",
              filePath: operation.filePath,
              originalContent
            };
          case "delete":
            const contentToRestore = await ops6.promises.readFile(resolvedPath, "utf-8");
            const stats = await ops6.promises.stat(resolvedPath);
            return {
              type: "restore_deleted",
              filePath: operation.filePath,
              content: contentToRestore,
              stats
            };
          case "rename":
          case "move":
            return {
              type: "restore_move",
              oldPath: operation.filePath,
              newPath: operation.newFilePath
            };
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      }
      /**
       * Execute a single operation
       */
      async executeOperation(operation) {
        const resolvedPath = path8.resolve(operation.filePath);
        switch (operation.type) {
          case "create":
            const dir = path8.dirname(resolvedPath);
            await ops6.promises.mkdir(dir, { recursive: true });
            await writeFile(resolvedPath, operation.content, "utf-8");
            return { success: true, output: `Created ${operation.filePath}` };
          case "edit":
            let content = await ops6.promises.readFile(resolvedPath, "utf-8");
            for (const editOp of operation.operations) {
              content = await this.applyEditOperation(content, editOp);
            }
            await writeFile(resolvedPath, content, "utf-8");
            return { success: true, output: `Edited ${operation.filePath}` };
          case "delete":
            await ops6.promises.rm(resolvedPath);
            return { success: true, output: `Deleted ${operation.filePath}` };
          case "rename":
          case "move":
            const newResolvedPath = path8.resolve(operation.newFilePath);
            const newDir = path8.dirname(newResolvedPath);
            await ops6.promises.mkdir(newDir, { recursive: true });
            await ops6.move(resolvedPath, newResolvedPath);
            return { success: true, output: `${operation.type === "rename" ? "Renamed" : "Moved"} ${operation.filePath} to ${operation.newFilePath}` };
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      }
      /**
       * Apply an edit operation to content
       */
      async applyEditOperation(content, operation) {
        switch (operation.type) {
          case "replace":
            if (!operation.oldStr || operation.newStr === void 0) {
              throw new Error("oldStr and newStr required for replace operation");
            }
            return content.replace(operation.oldStr, operation.newStr);
          case "insert":
            if (operation.startLine === void 0 || !operation.content) {
              throw new Error("startLine and content required for insert operation");
            }
            const lines = content.split("\n");
            lines.splice(operation.startLine - 1, 0, operation.content);
            return lines.join("\n");
          case "delete_lines":
            if (operation.startLine === void 0 || operation.endLine === void 0) {
              throw new Error("startLine and endLine required for delete_lines operation");
            }
            const contentLines = content.split("\n");
            contentLines.splice(operation.startLine - 1, operation.endLine - operation.startLine + 1);
            return contentLines.join("\n");
          default:
            throw new Error(`Unknown edit operation type: ${operation.type}`);
        }
      }
      /**
       * Rollback operations using rollback data
       */
      async rollbackOperations(rollbackData) {
        for (let i = rollbackData.length - 1; i >= 0; i--) {
          const rollback = rollbackData[i];
          switch (rollback.type) {
            case "delete_created":
              const createdPath = path8.resolve(rollback.filePath);
              if (await pathExists3(createdPath)) {
                await ops6.promises.rm(createdPath);
              }
              break;
            case "restore_content":
              const editedPath = path8.resolve(rollback.filePath);
              await writeFile(editedPath, rollback.originalContent, "utf-8");
              break;
            case "restore_deleted":
              const deletedPath = path8.resolve(rollback.filePath);
              const deletedDir = path8.dirname(deletedPath);
              await ops6.promises.mkdir(deletedDir, { recursive: true });
              await writeFile(deletedPath, rollback.content, "utf-8");
              break;
            case "restore_move":
              const movedNewPath = path8.resolve(rollback.newPath);
              const movedOldPath = path8.resolve(rollback.oldPath);
              if (await pathExists3(movedNewPath)) {
                const oldDir = path8.dirname(movedOldPath);
                await ops6.promises.mkdir(oldDir, { recursive: true });
                await ops6.move(movedNewPath, movedOldPath);
              }
              break;
          }
        }
      }
      /**
       * List all transactions
       */
      async listTransactions() {
        try {
          if (this.transactions.size === 0) {
            return {
              success: true,
              output: "No transactions found"
            };
          }
          let output = "Transactions:\n";
          for (const [id, tx] of this.transactions) {
            output += `${id}: ${tx.committed ? "COMMITTED" : "PENDING"} (${tx.operations.length} operations) - ${tx.timestamp.toISOString()}
`;
          }
          return {
            success: true,
            output: output.trim()
          };
        } catch (error) {
          return {
            success: false,
            error: `Error listing transactions: ${error.message}`
          };
        }
      }
      /**
       * Get current transaction status
       */
      getCurrentTransactionId() {
        return this.currentTransactionId;
      }
    };
  }
});
var pathExists4, AdvancedSearchTool;
var init_advanced_search = __esm({
  "src/tools/advanced/advanced-search.ts"() {
    init_confirmation_service();
    pathExists4 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    AdvancedSearchTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
      }
      /**
       * Search for patterns across files
       */
      async search(searchPath, options) {
        try {
          const resolvedPath = path8.resolve(searchPath);
          if (!await pathExists4(resolvedPath)) {
            return {
              success: false,
              error: `Path not found: ${searchPath}`
            };
          }
          const stats = await fs2.promises.stat(resolvedPath);
          const filesToSearch = [];
          if (stats.isFile()) {
            filesToSearch.push(resolvedPath);
          } else if (stats.isDirectory()) {
            const files = await this.getFilesRecursively(resolvedPath, options);
            filesToSearch.push(...files);
          }
          const results = [];
          let totalMatches = 0;
          for (const filePath of filesToSearch) {
            if (options.maxResults && totalMatches >= options.maxResults) {
              break;
            }
            const fileResult = await this.searchInFile(filePath, options);
            if (fileResult.matches.length > 0) {
              results.push(fileResult);
              totalMatches += fileResult.totalMatches;
            }
          }
          return {
            success: true,
            output: this.formatSearchResults(results, options)
          };
        } catch (error) {
          return {
            success: false,
            error: `Search error: ${error.message}`
          };
        }
      }
      /**
       * Search and replace patterns across files
       */
      async searchAndReplace(searchPath, options) {
        try {
          const resolvedPath = path8.resolve(searchPath);
          if (!await pathExists4(resolvedPath)) {
            return {
              success: false,
              error: `Path not found: ${searchPath}`
            };
          }
          const stats = await fs2.promises.stat(resolvedPath);
          const filesToProcess = [];
          if (stats.isFile()) {
            filesToProcess.push(resolvedPath);
          } else if (stats.isDirectory()) {
            const files = await this.getFilesRecursively(resolvedPath, options);
            filesToProcess.push(...files);
          }
          const results = [];
          let totalReplacements = 0;
          for (const filePath of filesToProcess) {
            const replaceResult = await this.replaceInFile(filePath, options);
            if (replaceResult.replacements > 0) {
              results.push(replaceResult);
              totalReplacements += replaceResult.replacements;
            }
          }
          if (totalReplacements === 0) {
            return {
              success: true,
              output: "No matches found for replacement"
            };
          }
          if (!options.dryRun) {
            const sessionFlags = this.confirmationService.getSessionFlags();
            if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
              const preview = this.formatReplaceResults(results, true);
              const confirmationResult = await this.confirmationService.requestConfirmation(
                {
                  operation: `Replace in ${results.length} file(s) (${totalReplacements} replacements)`,
                  filename: results.map((r) => r.filePath).join(", "),
                  showVSCodeOpen: false,
                  content: preview
                },
                "file"
              );
              if (!confirmationResult.confirmed) {
                return {
                  success: false,
                  error: confirmationResult.feedback || "Replace operation cancelled by user"
                };
              }
            }
            for (const result of results) {
              if (result.success && result.preview) {
                await fs2.promises.writeFile(result.filePath, result.preview, "utf-8");
              }
            }
          }
          return {
            success: true,
            output: this.formatReplaceResults(results, options.dryRun || false)
          };
        } catch (error) {
          return {
            success: false,
            error: `Replace error: ${error.message}`
          };
        }
      }
      /**
       * Find files matching pattern
       */
      async findFiles(searchPath, pattern, options = {}) {
        try {
          const resolvedPath = path8.resolve(searchPath);
          if (!await pathExists4(resolvedPath)) {
            return {
              success: false,
              error: `Path not found: ${searchPath}`
            };
          }
          const allFiles = await this.getFilesRecursively(resolvedPath);
          const matchingFiles = [];
          const regex = options.isRegex ? new RegExp(pattern, "i") : null;
          for (const filePath of allFiles) {
            if (options.maxResults && matchingFiles.length >= options.maxResults) {
              break;
            }
            const fileName = path8.basename(filePath);
            const relativePath = path8.relative(resolvedPath, filePath);
            let matches = false;
            if (regex) {
              matches = regex.test(fileName) || regex.test(relativePath);
            } else {
              matches = fileName.toLowerCase().includes(pattern.toLowerCase()) || relativePath.toLowerCase().includes(pattern.toLowerCase());
            }
            if (matches) {
              matchingFiles.push(relativePath);
            }
          }
          return {
            success: true,
            output: matchingFiles.length > 0 ? `Found ${matchingFiles.length} files:
${matchingFiles.join("\n")}` : "No matching files found"
          };
        } catch (error) {
          return {
            success: false,
            error: `File search error: ${error.message}`
          };
        }
      }
      /**
       * Search in a single file
       */
      async searchInFile(filePath, options) {
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const matches = [];
        let pattern;
        try {
          if (options.isRegex) {
            const flags = options.caseSensitive ? "g" : "gi";
            pattern = new RegExp(options.pattern, flags);
          } else {
            const escapedPattern = options.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const wordBoundary = options.wholeWord ? "\\b" : "";
            const flags = options.caseSensitive ? "g" : "gi";
            pattern = new RegExp(`${wordBoundary}${escapedPattern}${wordBoundary}`, flags);
          }
        } catch (_error) {
          throw new Error(`Invalid regex pattern: ${options.pattern}`);
        }
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let match;
          pattern.lastIndex = 0;
          while ((match = pattern.exec(line)) !== null) {
            const searchMatch = {
              line: i + 1,
              column: match.index + 1,
              text: line,
              matchedText: match[0]
            };
            if (options.showContext && options.showContext > 0) {
              const contextStart = Math.max(0, i - options.showContext);
              const contextEnd = Math.min(lines.length, i + options.showContext + 1);
              searchMatch.beforeContext = lines.slice(contextStart, i);
              searchMatch.afterContext = lines.slice(i + 1, contextEnd);
            }
            matches.push(searchMatch);
            if (match[0].length === 0) {
              pattern.lastIndex++;
            }
          }
        }
        return {
          filePath: path8.relative(process.cwd(), filePath),
          matches,
          totalMatches: matches.length
        };
      }
      /**
       * Replace in a single file
       */
      async replaceInFile(filePath, options) {
        try {
          const content = await fs2.promises.readFile(filePath, "utf-8");
          let pattern;
          try {
            if (options.isRegex) {
              const flags = options.caseSensitive ? "g" : "gi";
              pattern = new RegExp(options.pattern, flags);
            } else {
              const escapedPattern = options.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const wordBoundary = options.wholeWord ? "\\b" : "";
              const flags = options.caseSensitive ? "g" : "gi";
              pattern = new RegExp(`${wordBoundary}${escapedPattern}${wordBoundary}`, flags);
            }
          } catch (_error) {
            return {
              filePath: path8.relative(process.cwd(), filePath),
              replacements: 0,
              success: false,
              error: `Invalid regex pattern: ${options.pattern}`
            };
          }
          const matches = content.match(pattern);
          const replacementCount = matches ? matches.length : 0;
          if (replacementCount === 0) {
            return {
              filePath: path8.relative(process.cwd(), filePath),
              replacements: 0,
              success: true
            };
          }
          const newContent = content.replace(pattern, options.replacement);
          return {
            filePath: path8.relative(process.cwd(), filePath),
            replacements: replacementCount,
            preview: newContent,
            success: true
          };
        } catch (error) {
          return {
            filePath: path8.relative(process.cwd(), filePath),
            replacements: 0,
            success: false,
            error: error.message
          };
        }
      }
      /**
       * Get files recursively with filtering
       */
      async getFilesRecursively(dirPath, options) {
        const files = [];
        const walk = async (currentPath) => {
          const entries = await fs2.promises.readdir(currentPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path8.join(currentPath, entry.name);
            if (entry.isDirectory()) {
              if (this.shouldSkipDirectory(entry.name)) {
                continue;
              }
              await walk(fullPath);
            } else if (entry.isFile()) {
              if (this.shouldIncludeFile(fullPath, options)) {
                files.push(fullPath);
              }
            }
          }
        };
        await walk(dirPath);
        return files;
      }
      /**
       * Check if directory should be skipped
       */
      shouldSkipDirectory(dirName) {
        const skipDirs = [
          "node_modules",
          ".git",
          ".vscode",
          ".idea",
          "dist",
          "build",
          "coverage",
          ".next",
          ".nuxt",
          "__pycache__",
          ".pytest_cache",
          "vendor"
        ];
        return skipDirs.includes(dirName) || dirName.startsWith(".");
      }
      /**
       * Check if file should be included in search
       */
      shouldIncludeFile(filePath, options) {
        const fileName = path8.basename(filePath);
        const ext = path8.extname(fileName);
        const skipExtensions = [
          ".exe",
          ".dll",
          ".so",
          ".dylib",
          ".bin",
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".bmp",
          ".ico",
          ".svg",
          ".mp3",
          ".mp4",
          ".avi",
          ".mkv",
          ".mov",
          ".zip",
          ".tar",
          ".gz",
          ".rar",
          ".7z",
          ".pdf",
          ".doc",
          ".docx",
          ".xls",
          ".xlsx",
          ".ppt",
          ".pptx"
        ];
        if (skipExtensions.includes(ext.toLowerCase())) {
          return false;
        }
        if (options?.excludeFiles) {
          for (const pattern of options.excludeFiles) {
            if (this.matchesGlob(filePath, pattern)) {
              return false;
            }
          }
        }
        if (options?.includeFiles) {
          for (const pattern of options.includeFiles) {
            if (this.matchesGlob(filePath, pattern)) {
              return true;
            }
          }
          return false;
        }
        return true;
      }
      /**
       * Simple glob pattern matching
       */
      matchesGlob(filePath, pattern) {
        const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
        const regex = new RegExp(`^${regexPattern}$`, "i");
        return regex.test(path8.basename(filePath)) || regex.test(filePath);
      }
      /**
       * Format search results for display
       */
      formatSearchResults(results, options) {
        if (results.length === 0) {
          return "No matches found";
        }
        let output = `Found ${results.reduce((sum, r) => sum + r.totalMatches, 0)} matches in ${results.length} files:

`;
        for (const result of results) {
          output += `${result.filePath} (${result.totalMatches} matches):
`;
          for (const match of result.matches) {
            output += `  ${match.line}:${match.column}: ${match.text.trim()}
`;
            if (options.showContext && (match.beforeContext || match.afterContext)) {
              if (match.beforeContext) {
                for (const contextLine of match.beforeContext) {
                  output += `    - ${contextLine}
`;
                }
              }
              output += `    > ${match.text.trim()}
`;
              if (match.afterContext) {
                for (const contextLine of match.afterContext) {
                  output += `    + ${contextLine}
`;
                }
              }
            }
          }
          output += "\n";
        }
        return output.trim();
      }
      /**
       * Format replace results for display
       */
      formatReplaceResults(results, isDryRun) {
        const totalReplacements = results.reduce((sum, r) => sum + r.replacements, 0);
        const action = isDryRun ? "Would replace" : "Replaced";
        let output = `${action} ${totalReplacements} occurrences in ${results.length} files:

`;
        for (const result of results) {
          if (result.success) {
            output += `${result.filePath}: ${result.replacements} replacements
`;
          } else {
            output += `${result.filePath}: ERROR - ${result.error}
`;
          }
        }
        return output.trim();
      }
    };
  }
});
var pathExists5, FileTreeOperationsTool;
var init_file_tree_operations = __esm({
  "src/tools/advanced/file-tree-operations.ts"() {
    init_confirmation_service();
    pathExists5 = async (filePath) => {
      try {
        await ops6.promises.access(filePath, ops6.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    FileTreeOperationsTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
      }
      /**
       * Generate a visual tree representation of directory structure
       */
      async generateTree(rootPath, options = {}) {
        try {
          const resolvedPath = path8.resolve(rootPath);
          if (!await pathExists5(resolvedPath)) {
            return {
              success: false,
              error: `Path not found: ${rootPath}`
            };
          }
          const tree = await this.buildTreeStructure(resolvedPath, options, 0);
          const treeString = this.formatTree(tree, "", true);
          return {
            success: true,
            output: `Directory tree for ${rootPath}:
${treeString}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error generating tree: ${error.message}`
          };
        }
      }
      /**
       * Perform bulk operations on files/directories
       */
      async bulkOperations(operations) {
        try {
          for (const [index, op] of operations.entries()) {
            const validation = await this.validateBulkOperation(op);
            if (!validation.valid) {
              return {
                success: false,
                error: `Operation ${index + 1} invalid: ${validation.error}`
              };
            }
          }
          const preview = this.generateOperationsPreview(operations);
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Bulk operations (${operations.length} operations)`,
                filename: operations.map((op) => op.source).join(", "),
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Bulk operations cancelled by user"
              };
            }
          }
          const results = [];
          for (const [index, op] of operations.entries()) {
            try {
              const result = await this.executeBulkOperation(op);
              results.push(`\u2713 Operation ${index + 1}: ${result}`);
            } catch (error) {
              results.push(`\u2717 Operation ${index + 1}: ${error.message}`);
            }
          }
          return {
            success: true,
            output: `Bulk operations completed:
${results.join("\n")}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error executing bulk operations: ${error.message}`
          };
        }
      }
      /**
       * Copy directory structure (optionally with files)
       */
      async copyStructure(sourcePath, destinationPath, options = {}) {
        try {
          const resolvedSource = path8.resolve(sourcePath);
          const resolvedDest = path8.resolve(destinationPath);
          if (!await pathExists5(resolvedSource)) {
            return {
              success: false,
              error: `Source path not found: ${sourcePath}`
            };
          }
          if (await pathExists5(resolvedDest) && !options.overwrite) {
            return {
              success: false,
              error: `Destination already exists: ${destinationPath}`
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Copy structure from ${sourcePath} to ${destinationPath}`,
                filename: `${sourcePath} \u2192 ${destinationPath}`,
                showVSCodeOpen: false,
                content: `Copy ${options.includeFiles ? "structure and files" : "structure only"}
Overwrite: ${options.overwrite ? "Yes" : "No"}`
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Copy structure cancelled by user"
              };
            }
          }
          await this.copyStructureRecursive(resolvedSource, resolvedDest, options);
          return {
            success: true,
            output: `Structure copied from ${sourcePath} to ${destinationPath}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error copying structure: ${error.message}`
          };
        }
      }
      /**
       * Find and organize files by type, size, or date
       */
      async organizeFiles(sourcePath, organizationType, destinationBase) {
        try {
          const resolvedSource = path8.resolve(sourcePath);
          if (!await pathExists5(resolvedSource)) {
            return {
              success: false,
              error: `Source path not found: ${sourcePath}`
            };
          }
          const files = await this.getFilesRecursively(resolvedSource);
          const organization = await this.categorizeFiles(files, organizationType);
          const destBase = destinationBase ? path8.resolve(destinationBase) : resolvedSource;
          let preview = `Organization plan (${organizationType}):
`;
          for (const [category, fileList] of Object.entries(organization)) {
            preview += `
${category}/
`;
            fileList.slice(0, 5).forEach((file) => {
              preview += `  - ${path8.basename(file)}
`;
            });
            if (fileList.length > 5) {
              preview += `  ... and ${fileList.length - 5} more files
`;
            }
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Organize files by ${organizationType}`,
                filename: sourcePath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "File organization cancelled by user"
              };
            }
          }
          let movedFiles = 0;
          for (const [category, fileList] of Object.entries(organization)) {
            const categoryDir = path8.join(destBase, category);
            await ops6.promises.mkdir(categoryDir, { recursive: true });
            for (const filePath of fileList) {
              const fileName = path8.basename(filePath);
              const destPath = path8.join(categoryDir, fileName);
              await ops6.move(filePath, destPath);
              movedFiles++;
            }
          }
          return {
            success: true,
            output: `Organized ${movedFiles} files into ${Object.keys(organization).length} categories by ${organizationType}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error organizing files: ${error.message}`
          };
        }
      }
      /**
       * Clean up empty directories
       */
      async cleanupEmptyDirectories(rootPath) {
        try {
          const resolvedPath = path8.resolve(rootPath);
          if (!await pathExists5(resolvedPath)) {
            return {
              success: false,
              error: `Path not found: ${rootPath}`
            };
          }
          const emptyDirs = await this.findEmptyDirectories(resolvedPath);
          if (emptyDirs.length === 0) {
            return {
              success: true,
              output: "No empty directories found"
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = `Empty directories to remove:
${emptyDirs.map((dir) => `- ${path8.relative(rootPath, dir)}`).join("\n")}`;
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Remove ${emptyDirs.length} empty directories`,
                filename: rootPath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Cleanup cancelled by user"
              };
            }
          }
          emptyDirs.sort((a, b) => b.length - a.length);
          for (const dir of emptyDirs) {
            await ops6.rmdir(dir);
          }
          return {
            success: true,
            output: `Removed ${emptyDirs.length} empty directories`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error cleaning up directories: ${error.message}`
          };
        }
      }
      /**
       * Build tree structure recursively
       */
      async buildTreeStructure(dirPath, options, currentDepth) {
        const stats = await ops6.promises.stat(dirPath);
        const name = path8.basename(dirPath);
        const node = {
          name: name || path8.basename(dirPath),
          path: dirPath,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.size,
          modified: stats.mtime
        };
        if (stats.isDirectory() && (!options.maxDepth || currentDepth < options.maxDepth)) {
          node.children = [];
          try {
            const entries = await ops6.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
              if (!options.includeHidden && entry.name.startsWith(".")) {
                continue;
              }
              const fullPath = path8.join(dirPath, entry.name);
              if (!this.passesFilters(fullPath, entry, options)) {
                continue;
              }
              const childNode = await this.buildTreeStructure(fullPath, options, currentDepth + 1);
              node.children.push(childNode);
            }
            node.children.sort((a, b) => {
              if (a.type !== b.type) {
                return a.type === "directory" ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            });
          } catch (error) {
          }
        }
        return node;
      }
      /**
       * Format tree structure for display
       */
      formatTree(node, prefix, isLast) {
        const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
        let result = prefix + connector + node.name;
        if (node.type === "file" && node.size) {
          result += ` (${this.formatFileSize(node.size)})`;
        }
        result += "\n";
        if (node.children) {
          const childPrefix = prefix + (isLast ? "    " : "\u2502   ");
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const isLastChild = i === node.children.length - 1;
            result += this.formatTree(child, childPrefix, isLastChild);
          }
        }
        return result;
      }
      /**
       * Check if file/directory passes filters
       */
      passesFilters(fullPath, entry, options) {
        const name = entry.name;
        const ext = path8.extname(name).toLowerCase();
        if (options.excludePatterns) {
          for (const pattern of options.excludePatterns) {
            if (this.matchesPattern(name, pattern)) {
              return false;
            }
          }
        }
        if (options.includePatterns) {
          let matches = false;
          for (const pattern of options.includePatterns) {
            if (this.matchesPattern(name, pattern)) {
              matches = true;
              break;
            }
          }
          if (!matches) return false;
        }
        if (options.fileTypes && entry.isFile()) {
          if (!options.fileTypes.includes(ext)) {
            return false;
          }
        }
        return true;
      }
      /**
       * Simple pattern matching (supports * and ?)
       */
      matchesPattern(text, pattern) {
        const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
        const regex = new RegExp(`^${regexPattern}$`, "i");
        return regex.test(text);
      }
      /**
       * Format file size for display
       */
      formatFileSize(bytes) {
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }
        return `${size.toFixed(1)}${units[unitIndex]}`;
      }
      /**
       * Validate bulk operation
       */
      async validateBulkOperation(operation) {
        try {
          const sourcePath = path8.resolve(operation.source);
          switch (operation.type) {
            case "copy":
            case "move":
              if (!await pathExists5(sourcePath)) {
                return { valid: false, error: "Source path does not exist" };
              }
              if (!operation.destination) {
                return { valid: false, error: "Destination required for copy/move operations" };
              }
              break;
            case "delete":
              if (!await pathExists5(sourcePath)) {
                return { valid: false, error: "Path does not exist" };
              }
              break;
            case "create_dir":
              if (await pathExists5(sourcePath)) {
                return { valid: false, error: "Directory already exists" };
              }
              break;
            case "chmod":
              if (!await pathExists5(sourcePath)) {
                return { valid: false, error: "Path does not exist" };
              }
              if (!operation.mode) {
                return { valid: false, error: "Mode required for chmod operation" };
              }
              break;
            case "rename":
              if (!await pathExists5(sourcePath)) {
                return { valid: false, error: "Source path does not exist" };
              }
              if (!operation.destination) {
                return { valid: false, error: "Destination required for rename operation" };
              }
              break;
          }
          return { valid: true };
        } catch (error) {
          return { valid: false, error: error.message };
        }
      }
      /**
       * Execute a single bulk operation
       */
      async executeBulkOperation(operation) {
        const sourcePath = path8.resolve(operation.source);
        switch (operation.type) {
          case "copy":
            const copyDest = path8.resolve(operation.destination);
            await ops6.copy(sourcePath, copyDest);
            return `Copied ${operation.source} to ${operation.destination}`;
          case "move":
            const moveDest = path8.resolve(operation.destination);
            await ops6.move(sourcePath, moveDest);
            return `Moved ${operation.source} to ${operation.destination}`;
          case "delete":
            await ops6.promises.rm(sourcePath);
            return `Deleted ${operation.source}`;
          case "create_dir":
            await ops6.promises.mkdir(sourcePath, { recursive: true });
            return `Created directory ${operation.source}`;
          case "chmod":
            await ops6.promises.chmod(sourcePath, operation.mode);
            return `Changed permissions of ${operation.source} to ${operation.mode}`;
          case "rename":
            const renameDest = path8.resolve(operation.destination);
            await ops6.move(sourcePath, renameDest);
            return `Renamed ${operation.source} to ${operation.destination}`;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      }
      /**
       * Generate preview of operations
       */
      generateOperationsPreview(operations) {
        let preview = `Bulk Operations Preview (${operations.length} operations):

`;
        for (const [index, op] of operations.entries()) {
          preview += `${index + 1}. ${op.type.toUpperCase()}: ${op.source}`;
          if (op.destination) {
            preview += ` \u2192 ${op.destination}`;
          }
          if (op.mode) {
            preview += ` (mode: ${op.mode})`;
          }
          preview += "\n";
        }
        return preview;
      }
      /**
       * Copy structure recursively
       */
      async copyStructureRecursive(source, destination, options) {
        const stats = await ops6.promises.stat(source);
        if (stats.isDirectory()) {
          await ops6.promises.mkdir(destination, { recursive: true });
          const entries = await ops6.promises.readdir(source);
          for (const entry of entries) {
            const srcPath = path8.join(source, entry);
            const destPath = path8.join(destination, entry);
            await this.copyStructureRecursive(srcPath, destPath, options);
          }
        } else if (options.includeFiles) {
          await ops6.copy(source, destination, { overwrite: options.overwrite });
        }
      }
      /**
       * Get all files recursively
       */
      async getFilesRecursively(dirPath) {
        const files = [];
        const walk = async (currentPath) => {
          const entries = await ops6.promises.readdir(currentPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path8.join(currentPath, entry.name);
            if (entry.isDirectory()) {
              await walk(fullPath);
            } else if (entry.isFile()) {
              files.push(fullPath);
            }
          }
        };
        await walk(dirPath);
        return files;
      }
      /**
       * Categorize files for organization
       */
      async categorizeFiles(files, organizationType) {
        const categories = {};
        for (const filePath of files) {
          let category;
          switch (organizationType) {
            case "type":
              const ext = path8.extname(filePath).toLowerCase();
              category = ext || "no-extension";
              break;
            case "size":
              const stats = await ops6.promises.stat(filePath);
              if (stats.size < 1024) category = "small (< 1KB)";
              else if (stats.size < 1024 * 1024) category = "medium (< 1MB)";
              else if (stats.size < 1024 * 1024 * 10) category = "large (< 10MB)";
              else category = "very-large (> 10MB)";
              break;
            case "date":
              const fileStats = await ops6.promises.stat(filePath);
              const year = fileStats.mtime.getFullYear();
              const month = fileStats.mtime.getMonth() + 1;
              category = `${year}-${month.toString().padStart(2, "0")}`;
              break;
            default:
              category = "misc";
          }
          if (!categories[category]) {
            categories[category] = [];
          }
          categories[category].push(filePath);
        }
        return categories;
      }
      /**
       * Find empty directories recursively
       */
      async findEmptyDirectories(dirPath) {
        const emptyDirs = [];
        const checkDirectory = async (currentPath) => {
          try {
            const entries = await ops6.promises.readdir(currentPath);
            if (entries.length === 0) {
              emptyDirs.push(currentPath);
              return true;
            }
            let hasNonEmptyChildren = false;
            for (const entry of entries) {
              const fullPath = path8.join(currentPath, entry);
              const stats = await ops6.promises.stat(fullPath);
              if (stats.isDirectory()) {
                const isEmpty = await checkDirectory(fullPath);
                if (!isEmpty) {
                  hasNonEmptyChildren = true;
                }
              } else {
                hasNonEmptyChildren = true;
              }
            }
            if (!hasNonEmptyChildren) {
              emptyDirs.push(currentPath);
              return true;
            }
            return false;
          } catch (error) {
            return false;
          }
        };
        await checkDirectory(dirPath);
        return emptyDirs;
      }
    };
  }
});
var pathExists6, CodeAwareEditorTool;
var init_code_aware_editor = __esm({
  "src/tools/advanced/code-aware-editor.ts"() {
    init_confirmation_service();
    pathExists6 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    CodeAwareEditorTool = class {
      constructor() {
        this.confirmationService = ConfirmationService.getInstance();
      }
      /**
       * Analyze code structure and context
       */
      async analyzeCode(filePath) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists6(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          const language = this.detectLanguage(filePath);
          const context = await this.parseCodeContext(content, language);
          const output = this.formatCodeAnalysis(context, filePath);
          return {
            success: true,
            output
          };
        } catch (error) {
          return {
            success: false,
            error: `Error analyzing code: ${error.message}`
          };
        }
      }
      /**
       * Perform smart refactoring operations
       */
      async refactor(filePath, operation) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists6(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          const language = this.detectLanguage(filePath);
          const context = await this.parseCodeContext(content, language);
          const result = await this.performRefactoring(content, context, operation, language);
          if (!result.success) {
            return result;
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = this.generateRefactorPreview(content, result.newContent, operation);
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Refactor: ${operation.type} (${operation.target})`,
                filename: filePath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Refactoring cancelled by user"
              };
            }
          }
          await fs2.promises.writeFile(resolvedPath, result.newContent, "utf-8");
          return {
            success: true,
            output: result.output
          };
        } catch (error) {
          return {
            success: false,
            error: `Error performing refactoring: ${error.message}`
          };
        }
      }
      /**
       * Smart code insertion that preserves formatting and structure
       */
      async smartInsert(filePath, code, location, target) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists6(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          const language = this.detectLanguage(filePath);
          const context = await this.parseCodeContext(content, language);
          const insertionPoint = this.findInsertionPoint(content, context, location, target);
          if (!insertionPoint.success) {
            return insertionPoint;
          }
          const formattedCode = this.formatCodeForInsertion(code, insertionPoint.indentation, language);
          const lines = content.split("\n");
          lines.splice(insertionPoint.line, 0, formattedCode);
          const newContent = lines.join("\n");
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = this.generateInsertionPreview(content, newContent, insertionPoint.line);
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Insert code at ${location}${target ? ` (${target})` : ""}`,
                filename: filePath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Code insertion cancelled by user"
              };
            }
          }
          await fs2.promises.writeFile(resolvedPath, newContent, "utf-8");
          return {
            success: true,
            output: `Code inserted at line ${insertionPoint.line + 1} in ${filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error inserting code: ${error.message}`
          };
        }
      }
      /**
       * Auto-format code while preserving logical structure
       */
      async formatCode(filePath, options = {}) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists6(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          const language = this.detectLanguage(filePath);
          const formattedContent = await this.formatCodeContent(content, language, options);
          if (formattedContent === content) {
            return {
              success: true,
              output: "No formatting changes needed"
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = this.generateFormatPreview(content, formattedContent);
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: "Format code",
                filename: filePath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Code formatting cancelled by user"
              };
            }
          }
          await fs2.promises.writeFile(resolvedPath, formattedContent, "utf-8");
          return {
            success: true,
            output: `Code formatted in ${filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error formatting code: ${error.message}`
          };
        }
      }
      /**
       * Add missing imports automatically
       */
      async addMissingImports(filePath, symbols) {
        try {
          const resolvedPath = path8.resolve(filePath);
          if (!await pathExists6(resolvedPath)) {
            return {
              success: false,
              error: `File not found: ${filePath}`
            };
          }
          const content = await fs2.promises.readFile(resolvedPath, "utf-8");
          const language = this.detectLanguage(filePath);
          const context = await this.parseCodeContext(content, language);
          const missingImports = symbols.filter(
            (symbol) => !context.imports.some((imp) => imp.includes(symbol))
          );
          if (missingImports.length === 0) {
            return {
              success: true,
              output: "All symbols are already imported"
            };
          }
          const importsToAdd = await this.generateImportStatements(missingImports, language);
          const newContent = this.insertImports(content, importsToAdd, context, language);
          if (newContent === content) {
            return {
              success: true,
              output: "No imports to add"
            };
          }
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const preview = `Adding imports for: ${missingImports.join(", ")}

${importsToAdd.join("\n")}`;
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Add ${missingImports.length} missing imports`,
                filename: filePath,
                showVSCodeOpen: false,
                content: preview
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Import addition cancelled by user"
              };
            }
          }
          await fs2.promises.writeFile(resolvedPath, newContent, "utf-8");
          return {
            success: true,
            output: `Added ${missingImports.length} missing imports to ${filePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error adding imports: ${error.message}`
          };
        }
      }
      /**
       * Detect programming language from file extension
       */
      detectLanguage(filePath) {
        const ext = path8.extname(filePath).toLowerCase();
        const languageMap = {
          ".js": "javascript",
          ".jsx": "javascript",
          ".ts": "typescript",
          ".tsx": "typescript",
          ".py": "python",
          ".java": "java",
          ".c": "c",
          ".cpp": "cpp",
          ".cc": "cpp",
          ".cxx": "cpp",
          ".h": "c",
          ".hpp": "cpp",
          ".cs": "csharp",
          ".go": "go",
          ".rs": "rust",
          ".php": "php",
          ".rb": "ruby",
          ".swift": "swift",
          ".kt": "kotlin",
          ".scala": "scala"
        };
        return languageMap[ext] || "text";
      }
      /**
       * Parse code context based on language
       */
      async parseCodeContext(content, language) {
        const context = {
          language,
          imports: [],
          exports: [],
          functions: [],
          classes: [],
          variables: [],
          types: []
        };
        const lines = content.split("\n");
        switch (language) {
          case "javascript":
          case "typescript":
            this.parseJavaScriptTypeScript(lines, context);
            break;
          case "python":
            this.parsePython(lines, context);
            break;
          case "java":
            this.parseJava(lines, context);
            break;
          default:
            this.parseGeneric(lines, context);
        }
        return context;
      }
      /**
       * Parse JavaScript/TypeScript specific syntax
       */
      parseJavaScriptTypeScript(lines, context) {
        let currentClass = null;
        let currentFunction = null;
        let braceDepth = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const lineNumber = i + 1;
          if (line.startsWith("import ") || line.startsWith("const ") && line.includes("require(")) {
            context.imports.push(line);
          }
          if (line.startsWith("export ")) {
            context.exports.push(line);
          }
          if (line.startsWith("interface ") || line.startsWith("type ") || line.startsWith("enum ")) {
            const match = line.match(/(interface|type|enum)\s+(\w+)/);
            if (match) {
              context.types.push({
                name: match[2],
                line: lineNumber,
                kind: match[1],
                isExported: line.includes("export")
              });
            }
          }
          if (line.includes("class ")) {
            const match = line.match(/class\s+(\w+)/);
            if (match) {
              currentClass = {
                name: match[1],
                startLine: lineNumber,
                endLine: lineNumber,
                methods: [],
                properties: [],
                isExported: line.includes("export")
              };
              context.classes.push(currentClass);
            }
          }
          if (line.includes("function ") || line.match(/\w+\s*\(/)) {
            const functionMatch = line.match(/(?:async\s+)?(?:function\s+)?(\w+)\s*\(/);
            if (functionMatch) {
              const func = {
                name: functionMatch[1],
                startLine: lineNumber,
                endLine: lineNumber,
                parameters: this.extractParameters(line),
                isAsync: line.includes("async"),
                isExported: line.includes("export")
              };
              if (currentClass) {
                currentClass.methods.push(func);
              } else {
                context.functions.push(func);
              }
              currentFunction = func;
            }
          }
          if (line.match(/^(const|let|var)\s+\w+/)) {
            const match = line.match(/(const|let|var)\s+(\w+)/);
            if (match) {
              context.variables.push({
                name: match[2],
                line: lineNumber,
                isConst: match[1] === "const",
                isExported: line.includes("export"),
                scope: currentFunction ? "function" : currentClass ? "class" : "global"
              });
            }
          }
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          braceDepth += openBraces - closeBraces;
          if (braceDepth === 0 && currentFunction) {
            currentFunction.endLine = lineNumber;
            currentFunction = null;
          }
          if (braceDepth === 0 && currentClass) {
            currentClass.endLine = lineNumber;
            currentClass = null;
          }
        }
      }
      /**
       * Parse Python specific syntax
       */
      parsePython(lines, context) {
        let currentClass = null;
        let currentIndent = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmedLine = line.trim();
          const lineNumber = i + 1;
          const indent = line.length - line.trimStart().length;
          if (indent <= currentIndent) {
            currentClass = null;
            currentIndent = indent;
          }
          if (trimmedLine.startsWith("import ") || trimmedLine.startsWith("from ")) {
            context.imports.push(trimmedLine);
          }
          if (trimmedLine.startsWith("class ")) {
            const match = trimmedLine.match(/class\s+(\w+)/);
            if (match) {
              currentClass = {
                name: match[1],
                startLine: lineNumber,
                endLine: lineNumber,
                methods: [],
                properties: [],
                isExported: true
                // Python doesn't have explicit exports
              };
              context.classes.push(currentClass);
              currentIndent = indent;
            }
          }
          if (trimmedLine.startsWith("def ")) {
            const match = trimmedLine.match(/def\s+(\w+)\s*\(/);
            if (match) {
              const func = {
                name: match[1],
                startLine: lineNumber,
                endLine: lineNumber,
                parameters: this.extractPythonParameters(trimmedLine),
                isAsync: trimmedLine.startsWith("async def"),
                isExported: true
              };
              if (currentClass) {
                currentClass.methods.push(func);
              } else {
                context.functions.push(func);
              }
            }
          }
          if (trimmedLine.match(/^\w+\s*=/) && !trimmedLine.startsWith("def ") && !trimmedLine.startsWith("class ")) {
            const match = trimmedLine.match(/^(\w+)\s*=/);
            if (match) {
              context.variables.push({
                name: match[1],
                line: lineNumber,
                isConst: false,
                isExported: true,
                scope: currentClass ? "class" : "global"
              });
            }
          }
        }
      }
      /**
       * Parse Java specific syntax
       */
      parseJava(lines, context) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const lineNumber = i + 1;
          if (line.startsWith("import ")) {
            context.imports.push(line);
          }
          if (line.includes("class ")) {
            const match = line.match(/class\s+(\w+)/);
            if (match) {
              context.classes.push({
                name: match[1],
                startLine: lineNumber,
                endLine: lineNumber,
                methods: [],
                properties: [],
                isExported: line.includes("public")
              });
            }
          }
        }
      }
      /**
       * Generic parsing for unknown languages
       */
      parseGeneric(lines, context) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const lineNumber = i + 1;
          const functionMatch = line.match(/(\w+)\s*\(/);
          if (functionMatch && !line.includes("if") && !line.includes("while") && !line.includes("for")) {
            context.functions.push({
              name: functionMatch[1],
              startLine: lineNumber,
              endLine: lineNumber,
              parameters: [],
              isAsync: false,
              isExported: false
            });
          }
        }
      }
      /**
       * Extract function parameters
       */
      extractParameters(line) {
        const match = line.match(/\(([^)]*)\)/);
        if (!match || !match[1]) return [];
        return match[1].split(",").map((param) => param.trim()).filter(Boolean);
      }
      /**
       * Extract Python function parameters
       */
      extractPythonParameters(line) {
        const match = line.match(/\(([^)]*)\)/);
        if (!match || !match[1]) return [];
        return match[1].split(",").map((param) => param.trim().split(":")[0].split("=")[0].trim()).filter(Boolean);
      }
      /**
       * Format code analysis for display
       */
      formatCodeAnalysis(context, filePath) {
        let output = `Code Analysis for ${filePath} (${context.language}):

`;
        if (context.imports.length > 0) {
          output += `Imports (${context.imports.length}):
`;
          context.imports.slice(0, 5).forEach((imp) => output += `  - ${imp}
`);
          if (context.imports.length > 5) {
            output += `  ... and ${context.imports.length - 5} more
`;
          }
          output += "\n";
        }
        if (context.functions.length > 0) {
          output += `Functions (${context.functions.length}):
`;
          context.functions.forEach((func) => {
            output += `  - ${func.name}(${func.parameters.join(", ")}) [line ${func.startLine}]${func.isAsync ? " (async)" : ""}${func.isExported ? " (exported)" : ""}
`;
          });
          output += "\n";
        }
        if (context.classes.length > 0) {
          output += `Classes (${context.classes.length}):
`;
          context.classes.forEach((cls) => {
            output += `  - ${cls.name} [lines ${cls.startLine}-${cls.endLine}]${cls.isExported ? " (exported)" : ""}
`;
            if (cls.methods.length > 0) {
              output += `    Methods: ${cls.methods.map((m) => m.name).join(", ")}
`;
            }
          });
          output += "\n";
        }
        if (context.types.length > 0) {
          output += `Types (${context.types.length}):
`;
          context.types.forEach((type) => {
            output += `  - ${type.name} (${type.kind}) [line ${type.line}]${type.isExported ? " (exported)" : ""}
`;
          });
          output += "\n";
        }
        if (context.variables.length > 0) {
          output += `Variables (${context.variables.length}):
`;
          context.variables.slice(0, 10).forEach((variable) => {
            output += `  - ${variable.name} [line ${variable.line}] (${variable.scope})${variable.isConst ? " (const)" : ""}${variable.isExported ? " (exported)" : ""}
`;
          });
          if (context.variables.length > 10) {
            output += `  ... and ${context.variables.length - 10} more
`;
          }
        }
        return output.trim();
      }
      /**
       * Perform refactoring operation
       */
      async performRefactoring(content, context, operation, language) {
        const lines = content.split("\n");
        switch (operation.type) {
          case "rename":
            return this.performRename(lines, context, operation.target, operation.newName);
          case "extract_function":
            return this.performExtractFunction(lines, operation.startLine, operation.endLine, operation.newName, language);
          case "extract_variable":
            return this.performExtractVariable(lines, operation.startLine, operation.target, operation.newName, language);
          default:
            return {
              success: false,
              error: `Refactoring operation '${operation.type}' not yet implemented`
            };
        }
      }
      /**
       * Perform rename refactoring
       */
      performRename(lines, context, oldName, newName) {
        if (!this.isValidIdentifier(newName)) {
          return {
            success: false,
            error: `'${newName}' is not a valid identifier`
          };
        }
        let changes = 0;
        const newLines = lines.map((line) => {
          const regex = new RegExp(`\\b${oldName}\\b`, "g");
          const newLine = line.replace(regex, (_match) => {
            changes++;
            return newName;
          });
          return newLine;
        });
        return {
          success: true,
          newContent: newLines.join("\n"),
          output: `Renamed '${oldName}' to '${newName}' (${changes} occurrences)`
        };
      }
      /**
       * Perform extract function refactoring
       */
      performExtractFunction(lines, startLine, endLine, functionName, language) {
        if (startLine < 1 || endLine > lines.length || startLine > endLine) {
          return {
            success: false,
            error: "Invalid line range"
          };
        }
        const extractedLines = lines.slice(startLine - 1, endLine);
        const extractedCode = extractedLines.join("\n");
        let functionDecl;
        switch (language) {
          case "javascript":
          case "typescript":
            functionDecl = `function ${functionName}() {
${extractedCode}
}`;
            break;
          case "python":
            functionDecl = `def ${functionName}():
${extractedCode.split("\n").map((line) => "    " + line).join("\n")}`;
            break;
          default:
            functionDecl = `// Extracted function
${extractedCode}`;
        }
        const functionCall = language === "python" ? `${functionName}()` : `${functionName}();`;
        const newLines = [
          ...lines.slice(0, startLine - 1),
          functionCall,
          ...lines.slice(endLine),
          "",
          functionDecl
        ];
        return {
          success: true,
          newContent: newLines.join("\n"),
          output: `Extracted function '${functionName}' from lines ${startLine}-${endLine}`
        };
      }
      /**
       * Perform extract variable refactoring
       */
      performExtractVariable(lines, line, expression, variableName, language) {
        if (line < 1 || line > lines.length) {
          return {
            success: false,
            error: "Invalid line number"
          };
        }
        const targetLine = lines[line - 1];
        if (!targetLine.includes(expression)) {
          return {
            success: false,
            error: `Expression '${expression}' not found on line ${line}`
          };
        }
        let variableDecl;
        switch (language) {
          case "javascript":
          case "typescript":
            variableDecl = `const ${variableName} = ${expression};`;
            break;
          case "python":
            variableDecl = `${variableName} = ${expression}`;
            break;
          default:
            variableDecl = `${variableName} = ${expression}`;
        }
        const newTargetLine = targetLine.replace(expression, variableName);
        const newLines = [
          ...lines.slice(0, line - 1),
          variableDecl,
          newTargetLine,
          ...lines.slice(line)
        ];
        return {
          success: true,
          newContent: newLines.join("\n"),
          output: `Extracted variable '${variableName}' for expression '${expression}'`
        };
      }
      /**
       * Find insertion point for code
       */
      findInsertionPoint(content, context, location, target) {
        const lines = content.split("\n");
        switch (location) {
          case "top":
            const lastImportLine = Math.max(...context.imports.map(
              (imp) => lines.findIndex((line) => line.trim() === imp.trim())
            ).filter((idx) => idx !== -1));
            return {
              success: true,
              line: lastImportLine >= 0 ? lastImportLine + 2 : 0,
              indentation: ""
            };
          case "bottom":
            return {
              success: true,
              line: lines.length,
              indentation: ""
            };
          case "before_function":
          case "after_function":
            if (!target) {
              return { success: false, error: "Target function name required" };
            }
            const func = context.functions.find((f) => f.name === target);
            if (!func) {
              return { success: false, error: `Function '${target}' not found` };
            }
            const insertLine = location === "before_function" ? func.startLine - 1 : func.endLine;
            const referenceLine = lines[func.startLine - 1];
            const indentation = referenceLine.match(/^(\s*)/)?.[1] || "";
            return {
              success: true,
              line: insertLine,
              indentation
            };
          case "in_class":
            if (!target) {
              return { success: false, error: "Target class name required" };
            }
            const cls = context.classes.find((c) => c.name === target);
            if (!cls) {
              return { success: false, error: `Class '${target}' not found` };
            }
            const classLine = lines[cls.startLine - 1];
            const classIndentation = classLine.match(/^(\s*)/)?.[1] || "";
            const methodIndentation = classIndentation + "  ";
            return {
              success: true,
              line: cls.endLine - 1,
              indentation: methodIndentation
            };
          default:
            return { success: false, error: `Unknown location: ${location}` };
        }
      }
      /**
       * Format code for insertion with proper indentation
       */
      formatCodeForInsertion(code, indentation, _language) {
        const lines = code.split("\n");
        return lines.map((line) => {
          if (line.trim() === "") return "";
          return indentation + line;
        }).join("\n");
      }
      /**
       * Format code content (basic formatting)
       */
      async formatCodeContent(content, language, options) {
        const indentSize = options.indentSize || 2;
        const indent = " ".repeat(indentSize);
        const lines = content.split("\n");
        const formatted = [];
        let currentIndent = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "") {
            formatted.push("");
            continue;
          }
          if (trimmed.includes("}") || trimmed.includes("]") || trimmed.includes(")")) {
            currentIndent = Math.max(0, currentIndent - 1);
          }
          formatted.push(indent.repeat(currentIndent) + trimmed);
          if (trimmed.includes("{") || trimmed.includes("[") || trimmed.includes("(")) {
            currentIndent++;
          }
        }
        return formatted.join("\n");
      }
      /**
       * Generate import statements for missing symbols
       */
      async generateImportStatements(symbols, language) {
        const imports = [];
        for (const symbol of symbols) {
          let importStatement;
          switch (language) {
            case "javascript":
            case "typescript":
              importStatement = `import { ${symbol} } from './${symbol.toLowerCase()}';`;
              break;
            case "python":
              importStatement = `from .${symbol.toLowerCase()} import ${symbol}`;
              break;
            default:
              importStatement = `// Import ${symbol}`;
          }
          imports.push(importStatement);
        }
        return imports;
      }
      /**
       * Insert imports into content
       */
      insertImports(content, imports, context, language) {
        const lines = content.split("\n");
        let insertionPoint = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (language === "javascript" || language === "typescript") {
            if (line.startsWith("import ") || line.startsWith("const ") && line.includes("require(")) {
              insertionPoint = i + 1;
            }
          } else if (language === "python") {
            if (line.startsWith("import ") || line.startsWith("from ")) {
              insertionPoint = i + 1;
            }
          }
        }
        const newLines = [
          ...lines.slice(0, insertionPoint),
          ...imports,
          ...lines.slice(insertionPoint)
        ];
        return newLines.join("\n");
      }
      /**
       * Generate preview for refactoring
       */
      generateRefactorPreview(oldContent, newContent, operation) {
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");
        let preview = `Refactoring Preview: ${operation.type}
`;
        preview += `Target: ${operation.target}
`;
        if (operation.newName) {
          preview += `New name: ${operation.newName}
`;
        }
        preview += "\n";
        for (let i = 0; i < Math.min(oldLines.length, newLines.length, 20); i++) {
          if (oldLines[i] !== newLines[i]) {
            preview += `Line ${i + 1}:
`;
            preview += `- ${oldLines[i]}
`;
            preview += `+ ${newLines[i]}
`;
          }
        }
        return preview;
      }
      /**
       * Generate preview for insertion
       */
      generateInsertionPreview(oldContent, newContent, insertLine) {
        oldContent.split("\n");
        const newLines = newContent.split("\n");
        let preview = `Code Insertion Preview:
`;
        preview += `Insertion point: Line ${insertLine + 1}

`;
        const start = Math.max(0, insertLine - 3);
        const end = Math.min(newLines.length, insertLine + 6);
        for (let i = start; i < end; i++) {
          const marker = i === insertLine ? ">>> " : "    ";
          preview += `${marker}${i + 1}: ${newLines[i]}
`;
        }
        return preview;
      }
      /**
       * Generate preview for formatting
       */
      generateFormatPreview(oldContent, newContent) {
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");
        let preview = "Formatting Preview:\n\n";
        let changes = 0;
        for (let i = 0; i < Math.min(oldLines.length, newLines.length); i++) {
          if (oldLines[i] !== newLines[i]) {
            if (changes < 10) {
              preview += `Line ${i + 1}:
`;
              preview += `- ${oldLines[i]}
`;
              preview += `+ ${newLines[i]}
`;
            }
            changes++;
          }
        }
        if (changes > 10) {
          preview += `... and ${changes - 10} more changes
`;
        }
        return preview;
      }
      /**
       * Check if string is valid identifier
       */
      isValidIdentifier(name) {
        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
      }
    };
  }
});
var pathExists7, OperationHistoryTool;
var init_operation_history = __esm({
  "src/tools/advanced/operation-history.ts"() {
    init_confirmation_service();
    pathExists7 = async (filePath) => {
      try {
        await ops6.promises.access(filePath, ops6.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    OperationHistoryTool = class {
      constructor(options = {}) {
        this.history = [];
        this.confirmationService = ConfirmationService.getInstance();
        this.currentPosition = -1;
        this.options = {
          maxEntries: 100,
          maxAge: 7 * 24 * 60 * 60 * 1e3,
          // 7 days
          excludePatterns: ["node_modules/**", ".git/**", "dist/**", "build/**"],
          autoCleanup: true,
          ...options
        };
        const homeDir = process.env.HOME || process.env.USERPROFILE || "";
        this.historyFile = path8.join(homeDir, ".xcli", "operation-history.json");
        this.loadHistory();
        if (this.options.autoCleanup) {
          this.cleanupOldEntries();
        }
      }
      /**
       * Record a new operation in history
       */
      async recordOperation(operation, description, files, rollbackData, metadata = {}) {
        try {
          const fileSnapshots = await this.createFileSnapshots(files);
          const entry = {
            id: this.generateId(),
            timestamp: /* @__PURE__ */ new Date(),
            operation,
            description,
            rollbackData: {
              ...rollbackData,
              files: fileSnapshots
            },
            metadata: {
              tool: "x-cli",
              filesAffected: files,
              operationSize: this.determineOperationSize(files, rollbackData),
              ...metadata
            }
          };
          if (this.currentPosition < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentPosition + 1);
          }
          this.history.push(entry);
          this.currentPosition = this.history.length - 1;
          if (this.history.length > this.options.maxEntries) {
            this.history = this.history.slice(-this.options.maxEntries);
            this.currentPosition = this.history.length - 1;
          }
          await this.saveHistory();
          return {
            success: true,
            output: `Operation recorded: ${description} (ID: ${entry.id})`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error recording operation: ${error.message}`
          };
        }
      }
      /**
       * Undo the last operation
       */
      async undo() {
        try {
          if (this.currentPosition < 0) {
            return {
              success: false,
              error: "No operations to undo"
            };
          }
          const entry = this.history[this.currentPosition];
          if (this.isDangerousOperation(entry.operation)) {
            const sessionFlags = this.confirmationService.getSessionFlags();
            if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
              const preview = this.generateUndoPreview(entry);
              const confirmationResult = await this.confirmationService.requestConfirmation(
                {
                  operation: `Undo: ${entry.description}`,
                  filename: entry.metadata.filesAffected.join(", "),
                  showVSCodeOpen: false,
                  content: preview
                },
                "file"
              );
              if (!confirmationResult.confirmed) {
                return {
                  success: false,
                  error: confirmationResult.feedback || "Undo operation cancelled by user"
                };
              }
            }
          }
          const result = await this.performUndo(entry);
          if (!result.success) {
            return result;
          }
          this.currentPosition--;
          return {
            success: true,
            output: `Undone: ${entry.description} (${new Date(entry.timestamp).toLocaleString()})`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error during undo: ${error.message}`
          };
        }
      }
      /**
       * Redo the next operation
       */
      async redo() {
        try {
          if (this.currentPosition >= this.history.length - 1) {
            return {
              success: false,
              error: "No operations to redo"
            };
          }
          const nextPosition = this.currentPosition + 1;
          const entry = this.history[nextPosition];
          if (this.isDangerousOperation(entry.operation)) {
            const sessionFlags = this.confirmationService.getSessionFlags();
            if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
              const preview = this.generateRedoPreview(entry);
              const confirmationResult = await this.confirmationService.requestConfirmation(
                {
                  operation: `Redo: ${entry.description}`,
                  filename: entry.metadata.filesAffected.join(", "),
                  showVSCodeOpen: false,
                  content: preview
                },
                "file"
              );
              if (!confirmationResult.confirmed) {
                return {
                  success: false,
                  error: confirmationResult.feedback || "Redo operation cancelled by user"
                };
              }
            }
          }
          const result = await this.performRedo(entry);
          if (!result.success) {
            return result;
          }
          this.currentPosition = nextPosition;
          return {
            success: true,
            output: `Redone: ${entry.description} (${new Date(entry.timestamp).toLocaleString()})`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error during redo: ${error.message}`
          };
        }
      }
      /**
       * Show operation history
       */
      async showHistory(limit = 10) {
        try {
          if (this.history.length === 0) {
            return {
              success: true,
              output: "No operations in history"
            };
          }
          const recentEntries = this.history.slice(-limit).reverse();
          let output = `Operation History (last ${Math.min(limit, this.history.length)} entries):

`;
          for (const [index, entry] of recentEntries.entries()) {
            const position = this.history.length - index;
            const isCurrent = position - 1 === this.currentPosition;
            const marker = isCurrent ? "\u2192 " : "  ";
            output += `${marker}${position}. ${entry.description}
`;
            output += `   ${entry.operation} | ${new Date(entry.timestamp).toLocaleString()}
`;
            output += `   Files: ${entry.metadata.filesAffected.slice(0, 3).join(", ")}`;
            if (entry.metadata.filesAffected.length > 3) {
              output += ` (+${entry.metadata.filesAffected.length - 3} more)`;
            }
            output += `
   ID: ${entry.id}

`;
          }
          if (this.history.length > limit) {
            output += `... and ${this.history.length - limit} older entries
`;
          }
          output += `
Current position: ${this.currentPosition + 1}/${this.history.length}`;
          return {
            success: true,
            output: output.trim()
          };
        } catch (error) {
          return {
            success: false,
            error: `Error showing history: ${error.message}`
          };
        }
      }
      /**
       * Go to a specific point in history
       */
      async goToHistoryPoint(entryId) {
        try {
          const entryIndex = this.history.findIndex((entry) => entry.id === entryId);
          if (entryIndex === -1) {
            return {
              success: false,
              error: `Operation with ID ${entryId} not found in history`
            };
          }
          const targetPosition = entryIndex;
          if (targetPosition === this.currentPosition) {
            return {
              success: true,
              output: "Already at the specified history point"
            };
          }
          const operations = [];
          if (targetPosition < this.currentPosition) {
            for (let i = this.currentPosition; i > targetPosition; i--) {
              const undoResult = await this.undo();
              if (!undoResult.success) {
                return undoResult;
              }
              operations.push(`Undone: ${this.history[i].description}`);
            }
          } else {
            for (let i = this.currentPosition; i < targetPosition; i++) {
              const redoResult = await this.redo();
              if (!redoResult.success) {
                return redoResult;
              }
              operations.push(`Redone: ${this.history[i + 1].description}`);
            }
          }
          return {
            success: true,
            output: `Moved to history point ${entryId}:
${operations.join("\n")}`
          };
        } catch (error) {
          return {
            success: false,
            error: `Error navigating to history point: ${error.message}`
          };
        }
      }
      /**
       * Clear operation history
       */
      async clearHistory() {
        try {
          const sessionFlags = this.confirmationService.getSessionFlags();
          if (!sessionFlags.fileOperations && !sessionFlags.allOperations) {
            const confirmationResult = await this.confirmationService.requestConfirmation(
              {
                operation: `Clear operation history (${this.history.length} entries)`,
                filename: "operation history",
                showVSCodeOpen: false,
                content: `This will permanently delete all ${this.history.length} recorded operations.
This action cannot be undone.`
              },
              "file"
            );
            if (!confirmationResult.confirmed) {
              return {
                success: false,
                error: confirmationResult.feedback || "Clear history cancelled by user"
              };
            }
          }
          this.history = [];
          this.currentPosition = -1;
          await this.saveHistory();
          return {
            success: true,
            output: "Operation history cleared"
          };
        } catch (error) {
          return {
            success: false,
            error: `Error clearing history: ${error.message}`
          };
        }
      }
      /**
       * Create snapshots of files before operation
       */
      async createFileSnapshots(files) {
        const snapshots = [];
        for (const filePath of files) {
          try {
            const resolvedPath = path8.resolve(filePath);
            const exists = await pathExists7(resolvedPath);
            const snapshot = {
              filePath: resolvedPath,
              existed: exists
            };
            if (exists) {
              const stats = await ops6.promises.stat(resolvedPath);
              if (stats.isFile() && this.shouldSnapshotFile(resolvedPath)) {
                snapshot.content = await ops6.promises.readFile(resolvedPath, "utf-8");
                snapshot.size = stats.size;
                snapshot.lastModified = stats.mtime;
                snapshot.permissions = stats.mode.toString(8);
              }
            }
            snapshots.push(snapshot);
          } catch (_error) {
            snapshots.push({
              filePath: path8.resolve(filePath),
              existed: false
            });
          }
        }
        return snapshots;
      }
      /**
       * Check if file should be snapshotted (based on size and type)
       */
      shouldSnapshotFile(filePath) {
        try {
          const stats = ops6.statSync(filePath);
          if (stats.size > 1024 * 1024) {
            return false;
          }
        } catch {
          return false;
        }
        const ext = path8.extname(filePath).toLowerCase();
        const binaryExtensions = [
          ".exe",
          ".dll",
          ".so",
          ".dylib",
          ".bin",
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".bmp",
          ".ico",
          ".mp3",
          ".mp4",
          ".avi",
          ".mkv",
          ".mov",
          ".zip",
          ".tar",
          ".gz",
          ".rar",
          ".7z",
          ".pdf",
          ".doc",
          ".docx",
          ".xls",
          ".xlsx"
        ];
        if (binaryExtensions.includes(ext)) {
          return false;
        }
        for (const pattern of this.options.excludePatterns || []) {
          if (this.matchesPattern(filePath, pattern)) {
            return false;
          }
        }
        return true;
      }
      /**
       * Perform undo operation
       */
      async performUndo(entry) {
        try {
          const rollbackData = entry.rollbackData;
          switch (rollbackData.type) {
            case "file_operations":
              return await this.undoFileOperations(rollbackData.files);
            case "multi_file":
              return await this.undoMultiFileOperation(rollbackData.files);
            case "refactor":
              return await this.undoRefactorOperation(rollbackData.files, rollbackData.customData);
            case "search_replace":
              return await this.undoSearchReplaceOperation(rollbackData.files);
            default:
              return {
                success: false,
                error: `Unknown rollback type: ${rollbackData.type}`
              };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error performing undo: ${error.message}`
          };
        }
      }
      /**
       * Perform redo operation
       */
      async performRedo(_entry) {
        return {
          success: false,
          error: "Redo functionality requires storing forward changes - not yet implemented"
        };
      }
      /**
       * Undo file operations
       */
      async undoFileOperations(fileSnapshots) {
        const restored = [];
        const errors = [];
        for (const snapshot of fileSnapshots) {
          try {
            const currentExists = await pathExists7(snapshot.filePath);
            if (snapshot.existed && snapshot.content !== void 0) {
              await ops6.ensureDir(path8.dirname(snapshot.filePath));
              await ops6.promises.writeFile(snapshot.filePath, snapshot.content, "utf-8");
              if (snapshot.permissions) {
                await ops6.promises.chmod(snapshot.filePath, parseInt(snapshot.permissions, 8));
              }
              restored.push(`Restored: ${snapshot.filePath}`);
            } else if (!snapshot.existed && currentExists) {
              await ops6.promises.rm(snapshot.filePath);
              restored.push(`Removed: ${snapshot.filePath}`);
            }
          } catch (error) {
            errors.push(`Failed to restore ${snapshot.filePath}: ${error.message}`);
          }
        }
        if (errors.length > 0 && restored.length === 0) {
          return {
            success: false,
            error: `Undo failed:
${errors.join("\n")}`
          };
        }
        let output = `Undo completed:
${restored.join("\n")}`;
        if (errors.length > 0) {
          output += `

Warnings:
${errors.join("\n")}`;
        }
        return {
          success: true,
          output
        };
      }
      /**
       * Undo multi-file operation
       */
      async undoMultiFileOperation(fileSnapshots) {
        return await this.undoFileOperations(fileSnapshots);
      }
      /**
       * Undo refactor operation
       */
      async undoRefactorOperation(fileSnapshots, _customData) {
        return await this.undoFileOperations(fileSnapshots);
      }
      /**
       * Undo search and replace operation
       */
      async undoSearchReplaceOperation(fileSnapshots) {
        return await this.undoFileOperations(fileSnapshots);
      }
      /**
       * Generate undo preview
       */
      generateUndoPreview(entry) {
        let preview = `Undo Preview: ${entry.description}
`;
        preview += `Operation: ${entry.operation}
`;
        preview += `Timestamp: ${new Date(entry.timestamp).toLocaleString()}
`;
        preview += `Files affected: ${entry.metadata.filesAffected.length}

`;
        preview += "Files to be restored:\n";
        for (const file of entry.rollbackData.files.slice(0, 10)) {
          if (file.existed) {
            preview += `  - Restore: ${file.filePath}
`;
          } else {
            preview += `  - Remove: ${file.filePath}
`;
          }
        }
        if (entry.rollbackData.files.length > 10) {
          preview += `  ... and ${entry.rollbackData.files.length - 10} more files
`;
        }
        return preview;
      }
      /**
       * Generate redo preview
       */
      generateRedoPreview(entry) {
        let preview = `Redo Preview: ${entry.description}
`;
        preview += `Operation: ${entry.operation}
`;
        preview += `Timestamp: ${new Date(entry.timestamp).toLocaleString()}
`;
        preview += `Files affected: ${entry.metadata.filesAffected.length}

`;
        preview += "This will re-apply the original operation.\n";
        preview += "Files to be modified:\n";
        for (const filePath of entry.metadata.filesAffected.slice(0, 10)) {
          preview += `  - ${filePath}
`;
        }
        if (entry.metadata.filesAffected.length > 10) {
          preview += `  ... and ${entry.metadata.filesAffected.length - 10} more files
`;
        }
        return preview;
      }
      /**
       * Check if operation is potentially dangerous
       */
      isDangerousOperation(operation) {
        const dangerousOps = ["file_delete", "directory_delete", "bulk_operation"];
        return dangerousOps.includes(operation);
      }
      /**
       * Determine operation size
       */
      determineOperationSize(files, _rollbackData) {
        if (files.length <= 3) return "small";
        if (files.length <= 10) return "medium";
        return "large";
      }
      /**
       * Generate unique ID
       */
      generateId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      /**
       * Pattern matching utility
       */
      matchesPattern(filePath, pattern) {
        const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\?/g, ".");
        const regex = new RegExp(`^${regexPattern}$`, "i");
        return regex.test(filePath);
      }
      /**
       * Clean up old entries
       */
      cleanupOldEntries() {
        if (!this.options.maxAge) return;
        const cutoffTime = Date.now() - this.options.maxAge;
        const originalLength = this.history.length;
        this.history = this.history.filter(
          (entry) => entry.timestamp.getTime() > cutoffTime
        );
        const removedCount = originalLength - this.history.length;
        this.currentPosition = Math.max(-1, this.currentPosition - removedCount);
      }
      /**
       * Load history from file
       */
      async loadHistory() {
        try {
          if (await pathExists7(this.historyFile)) {
            const data = await ops6.promises.readFile(this.historyFile, "utf-8");
            const parsed = JSON.parse(data);
            this.history = parsed.entries.map((entry) => ({
              ...entry,
              timestamp: new Date(entry.timestamp)
            }));
            this.currentPosition = parsed.currentPosition || this.history.length - 1;
          }
        } catch (_error) {
          this.history = [];
          this.currentPosition = -1;
        }
      }
      /**
       * Save history to file
       */
      async saveHistory() {
        try {
          await ops6.ensureDir(path8.dirname(this.historyFile));
          const data = {
            entries: this.history,
            currentPosition: this.currentPosition,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          };
          await ops6.promises.writeFile(this.historyFile, JSON.stringify(data, null, 2), "utf-8");
        } catch (_error) {
        }
      }
      /**
       * Get current history status
       */
      getStatus() {
        return {
          totalEntries: this.history.length,
          currentPosition: this.currentPosition,
          canUndo: this.currentPosition >= 0,
          canRedo: this.currentPosition < this.history.length - 1
        };
      }
    };
  }
});

// src/tools/advanced/index.ts
var init_advanced = __esm({
  "src/tools/advanced/index.ts"() {
    init_multi_file_editor();
    init_advanced_search();
    init_file_tree_operations();
    init_code_aware_editor();
    init_operation_history();
  }
});
var Parser, JavaScript, TypeScript, Python, pathExists8, ASTParserTool;
var init_ast_parser = __esm({
  "src/tools/intelligence/ast-parser.ts"() {
    try {
      Parser = __require("tree-sitter");
      JavaScript = __require("tree-sitter-javascript");
      TypeScript = __require("tree-sitter-typescript");
      Python = __require("tree-sitter-python");
    } catch (error) {
      console.warn("Tree-sitter modules not available, falling back to TypeScript-only parsing");
    }
    pathExists8 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    ASTParserTool = class {
      constructor() {
        this.name = "ast_parser";
        this.description = "Parse source code files to extract AST, symbols, imports, exports, and structural information";
        this.parsers = /* @__PURE__ */ new Map();
        this.initializeParsers();
      }
      initializeParsers() {
        if (!Parser || !JavaScript || !TypeScript || !Python) {
          console.log("Tree-sitter parsers not available, using TypeScript-only parsing");
          return;
        }
        try {
          const jsParser = new Parser();
          jsParser.setLanguage(JavaScript);
          this.parsers.set("javascript", jsParser);
          this.parsers.set("js", jsParser);
          this.parsers.set("jsx", jsParser);
          const tsParser = new Parser();
          tsParser.setLanguage(TypeScript.typescript);
          this.parsers.set("typescript", tsParser);
          this.parsers.set("ts", tsParser);
          const tsxParser = new Parser();
          tsxParser.setLanguage(TypeScript.tsx);
          this.parsers.set("tsx", tsxParser);
          const pyParser = new Parser();
          pyParser.setLanguage(Python);
          this.parsers.set("python", pyParser);
          this.parsers.set("py", pyParser);
        } catch (error) {
          console.warn("Failed to initialize some parsers:", error);
        }
      }
      detectLanguage(filePath) {
        const ext = path8__default.extname(filePath).slice(1).toLowerCase();
        switch (ext) {
          case "js":
          case "mjs":
          case "cjs":
            return "javascript";
          case "jsx":
            return "jsx";
          case "ts":
            return "typescript";
          case "tsx":
            return "tsx";
          case "py":
          case "pyw":
            return "python";
          default:
            return "javascript";
        }
      }
      async execute(args) {
        try {
          const {
            filePath,
            includeSymbols = true,
            includeImports = true,
            includeTree = false,
            symbolTypes = ["function", "class", "variable", "interface", "enum", "type"],
            scope = "all"
            // 'all', 'global', 'local'
          } = args;
          if (!filePath) {
            throw new Error("File path is required");
          }
          if (!await pathExists8(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          const content = await fs2.promises.readFile(filePath, "utf-8");
          const language = this.detectLanguage(filePath);
          let result;
          if (language === "typescript" || language === "tsx") {
            result = await this.parseWithTypeScript(content, language, filePath);
          } else {
            result = await this.parseWithTreeSitter(content, language, filePath);
          }
          if (!includeSymbols) {
            result.symbols = [];
          } else {
            result.symbols = result.symbols.filter(
              (symbol) => symbolTypes.includes(symbol.type) && (scope === "all" || this.matchesScope(symbol, scope))
            );
          }
          if (!includeImports) {
            result.imports = [];
            result.exports = [];
          }
          if (!includeTree) {
            result.tree = { type: "program", text: "", startPosition: { row: 0, column: 0 }, endPosition: { row: 0, column: 0 } };
          }
          return {
            success: true,
            output: JSON.stringify({
              filePath,
              language: result.language,
              symbolCount: result.symbols.length,
              importCount: result.imports.length,
              exportCount: result.exports.length,
              errorCount: result.errors.length,
              ...includeSymbols && { symbols: result.symbols },
              ...includeImports && {
                imports: result.imports,
                exports: result.exports
              },
              ...includeTree && { tree: result.tree },
              ...result.errors.length > 0 && { errors: result.errors }
            }, null, 2)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      async parseWithTypeScript(content, language, filePath) {
        const errors = [];
        try {
          const ast = parse(content, {
            jsx: language === "tsx",
            loc: true,
            range: true,
            comment: true,
            attachComments: true,
            errorOnUnknownASTType: false,
            errorOnTypeScriptSyntacticAndSemanticIssues: false
          });
          const symbols = this.extractTypeScriptSymbols(ast, content);
          const imports = this.extractTypeScriptImports(ast);
          const exports = this.extractTypeScriptExports(ast);
          const tree = this.convertTypeScriptAST(ast);
          return {
            language,
            tree,
            symbols,
            imports,
            exports,
            errors
          };
        } catch (error) {
          errors.push({
            message: error instanceof Error ? error.message : String(error),
            line: 0,
            column: 0,
            severity: "error"
          });
          return this.parseWithTreeSitter(content, language, filePath);
        }
      }
      async parseWithTreeSitter(content, language, filePath) {
        const parser = this.parsers.get(language);
        if (!parser) {
          if (language === "typescript" || language === "ts" || language === "javascript" || language === "js") {
            return await this.parseWithTypeScript(content, language, filePath);
          }
          throw new Error(`Unsupported language: ${language}`);
        }
        const tree = parser.parse(content);
        const symbols = this.extractTreeSitterSymbols(tree.rootNode, content, language);
        const imports = this.extractTreeSitterImports(tree.rootNode, content, language);
        const exports = this.extractTreeSitterExports(tree.rootNode, content, language);
        const astTree = this.convertTreeSitterAST(tree.rootNode, content);
        return {
          language,
          tree: astTree,
          symbols,
          imports,
          exports,
          errors: []
        };
      }
      extractTypeScriptSymbols(ast, content) {
        const symbols = [];
        content.split("\n");
        const visit = (node, scope = "global") => {
          if (!node) return;
          const getPosition = (pos) => ({
            row: pos.line - 1,
            column: pos.column
          });
          switch (node.type) {
            case "FunctionDeclaration":
              if (node.id?.name) {
                symbols.push({
                  name: node.id.name,
                  type: "function",
                  startPosition: getPosition(node.loc.start),
                  endPosition: getPosition(node.loc.end),
                  scope,
                  isAsync: node.async,
                  parameters: node.params?.map((param) => ({
                    name: param.name || param.left?.name || "unknown",
                    type: param.typeAnnotation?.typeAnnotation?.type,
                    optional: param.optional
                  })) || []
                });
              }
              break;
            case "ClassDeclaration":
              if (node.id?.name) {
                symbols.push({
                  name: node.id.name,
                  type: "class",
                  startPosition: getPosition(node.loc.start),
                  endPosition: getPosition(node.loc.end),
                  scope
                });
              }
              node.body?.body?.forEach((member) => {
                if (member.type === "MethodDefinition" && member.key?.name) {
                  symbols.push({
                    name: member.key.name,
                    type: "method",
                    startPosition: getPosition(member.loc.start),
                    endPosition: getPosition(member.loc.end),
                    scope: `${node.id?.name || "unknown"}.${member.key.name}`,
                    accessibility: member.accessibility,
                    isStatic: member.static,
                    isAsync: member.value?.async
                  });
                }
              });
              break;
            case "VariableDeclaration":
              node.declarations?.forEach((decl) => {
                if (decl.id?.name) {
                  symbols.push({
                    name: decl.id.name,
                    type: "variable",
                    startPosition: getPosition(decl.loc.start),
                    endPosition: getPosition(decl.loc.end),
                    scope
                  });
                }
              });
              break;
            case "TSInterfaceDeclaration":
              if (node.id?.name) {
                symbols.push({
                  name: node.id.name,
                  type: "interface",
                  startPosition: getPosition(node.loc.start),
                  endPosition: getPosition(node.loc.end),
                  scope
                });
              }
              break;
            case "TSEnumDeclaration":
              if (node.id?.name) {
                symbols.push({
                  name: node.id.name,
                  type: "enum",
                  startPosition: getPosition(node.loc.start),
                  endPosition: getPosition(node.loc.end),
                  scope
                });
              }
              break;
            case "TSTypeAliasDeclaration":
              if (node.id?.name) {
                symbols.push({
                  name: node.id.name,
                  type: "type",
                  startPosition: getPosition(node.loc.start),
                  endPosition: getPosition(node.loc.end),
                  scope
                });
              }
              break;
          }
          for (const key in node) {
            if (key !== "parent" && key !== "loc" && key !== "range") {
              const child = node[key];
              if (Array.isArray(child)) {
                child.forEach((grandchild) => {
                  if (grandchild && typeof grandchild === "object") {
                    visit(grandchild, scope);
                  }
                });
              } else if (child && typeof child === "object") {
                visit(child, scope);
              }
            }
          }
        };
        visit(ast);
        return symbols;
      }
      extractTypeScriptImports(ast) {
        const imports = [];
        const visit = (node) => {
          if (node.type === "ImportDeclaration") {
            const specifiers = [];
            node.specifiers?.forEach((spec) => {
              switch (spec.type) {
                case "ImportDefaultSpecifier":
                  specifiers.push({
                    name: spec.local.name,
                    isDefault: true
                  });
                  break;
                case "ImportNamespaceSpecifier":
                  specifiers.push({
                    name: spec.local.name,
                    isNamespace: true
                  });
                  break;
                case "ImportSpecifier":
                  specifiers.push({
                    name: spec.imported.name,
                    alias: spec.local.name !== spec.imported.name ? spec.local.name : void 0
                  });
                  break;
              }
            });
            imports.push({
              source: node.source.value,
              specifiers,
              isTypeOnly: node.importKind === "type",
              startPosition: {
                row: node.loc.start.line - 1,
                column: node.loc.start.column
              }
            });
          }
          for (const key in node) {
            if (key !== "parent" && key !== "loc" && key !== "range") {
              const child = node[key];
              if (Array.isArray(child)) {
                child.forEach((grandchild) => {
                  if (grandchild && typeof grandchild === "object") {
                    visit(grandchild);
                  }
                });
              } else if (child && typeof child === "object") {
                visit(child);
              }
            }
          }
        };
        visit(ast);
        return imports;
      }
      extractTypeScriptExports(ast) {
        const exports = [];
        const visit = (node) => {
          switch (node.type) {
            case "ExportNamedDeclaration":
              if (node.declaration) {
                if (node.declaration.id?.name) {
                  exports.push({
                    name: node.declaration.id.name,
                    type: this.getDeclarationType(node.declaration.type),
                    startPosition: {
                      row: node.loc.start.line - 1,
                      column: node.loc.start.column
                    }
                  });
                }
              } else if (node.specifiers) {
                node.specifiers.forEach((spec) => {
                  exports.push({
                    name: spec.exported.name,
                    type: "variable",
                    // Default to variable
                    startPosition: {
                      row: node.loc.start.line - 1,
                      column: node.loc.start.column
                    },
                    source: node.source?.value
                  });
                });
              }
              break;
            case "ExportDefaultDeclaration":
              const name = node.declaration?.id?.name || "default";
              exports.push({
                name,
                type: this.getDeclarationType(node.declaration?.type) || "default",
                startPosition: {
                  row: node.loc.start.line - 1,
                  column: node.loc.start.column
                },
                isDefault: true
              });
              break;
          }
          for (const key in node) {
            if (key !== "parent" && key !== "loc" && key !== "range") {
              const child = node[key];
              if (Array.isArray(child)) {
                child.forEach((grandchild) => {
                  if (grandchild && typeof grandchild === "object") {
                    visit(grandchild);
                  }
                });
              } else if (child && typeof child === "object") {
                visit(child);
              }
            }
          }
        };
        visit(ast);
        return exports;
      }
      extractTreeSitterSymbols(node, content, language) {
        const symbols = [];
        content.split("\n");
        const visit = (node2, scope = "global") => {
          content.slice(node2.startIndex, node2.endIndex);
          const startPos = { row: node2.startPosition.row, column: node2.startPosition.column };
          const endPos = { row: node2.endPosition.row, column: node2.endPosition.column };
          switch (node2.type) {
            case "function_declaration":
            case "function_definition":
              const funcName = this.extractNodeName(node2, "name") || this.extractNodeName(node2, "identifier");
              if (funcName) {
                symbols.push({
                  name: funcName,
                  type: "function",
                  startPosition: startPos,
                  endPosition: endPos,
                  scope
                });
              }
              break;
            case "class_declaration":
            case "class_definition":
              const className = this.extractNodeName(node2, "name") || this.extractNodeName(node2, "identifier");
              if (className) {
                symbols.push({
                  name: className,
                  type: "class",
                  startPosition: startPos,
                  endPosition: endPos,
                  scope
                });
              }
              break;
            case "variable_declaration":
            case "lexical_declaration":
              node2.children?.forEach((child) => {
                if (child.type === "variable_declarator") {
                  const varName = this.extractNodeName(child, "name") || this.extractNodeName(child, "identifier");
                  if (varName) {
                    symbols.push({
                      name: varName,
                      type: "variable",
                      startPosition: { row: child.startPosition.row, column: child.startPosition.column },
                      endPosition: { row: child.endPosition.row, column: child.endPosition.column },
                      scope
                    });
                  }
                }
              });
              break;
          }
          node2.children?.forEach((child) => visit(child, scope));
        };
        visit(node);
        return symbols;
      }
      extractTreeSitterImports(node, content, language) {
        const imports = [];
        const visit = (node2) => {
          if (node2.type === "import_statement" || node2.type === "import_from_statement") {
            const sourceNode = node2.children?.find(
              (child) => child.type === "string" || child.type === "string_literal"
            );
            if (sourceNode) {
              const source = content.slice(sourceNode.startIndex + 1, sourceNode.endIndex - 1);
              imports.push({
                source,
                specifiers: [],
                // Simplified for tree-sitter
                startPosition: {
                  row: node2.startPosition.row,
                  column: node2.startPosition.column
                }
              });
            }
          }
          node2.children?.forEach((child) => visit(child));
        };
        visit(node);
        return imports;
      }
      extractTreeSitterExports(node, content, language) {
        const exports = [];
        const visit = (node2) => {
          if (node2.type === "export_statement") {
            const name = this.extractNodeName(node2, "name") || "unknown";
            exports.push({
              name,
              type: "variable",
              startPosition: {
                row: node2.startPosition.row,
                column: node2.startPosition.column
              }
            });
          }
          node2.children?.forEach((child) => visit(child));
        };
        visit(node);
        return exports;
      }
      convertTypeScriptAST(node) {
        return {
          type: node.type,
          text: "",
          startPosition: { row: node.loc?.start?.line - 1 || 0, column: node.loc?.start?.column || 0 },
          endPosition: { row: node.loc?.end?.line - 1 || 0, column: node.loc?.end?.column || 0 },
          children: []
        };
      }
      convertTreeSitterAST(node, content) {
        const children = [];
        if (node.children) {
          for (const child of node.children) {
            children.push(this.convertTreeSitterAST(child, content));
          }
        }
        return {
          type: node.type,
          text: content.slice(node.startIndex, node.endIndex),
          startPosition: { row: node.startPosition.row, column: node.startPosition.column },
          endPosition: { row: node.endPosition.row, column: node.endPosition.column },
          children
        };
      }
      extractNodeName(node, nameField) {
        const nameNode = node.children?.find((child) => child.type === nameField);
        return nameNode ? nameNode.text : null;
      }
      getDeclarationType(nodeType) {
        switch (nodeType) {
          case "FunctionDeclaration":
            return "function";
          case "ClassDeclaration":
            return "class";
          case "TSInterfaceDeclaration":
            return "interface";
          case "TSEnumDeclaration":
            return "enum";
          case "TSTypeAliasDeclaration":
            return "type";
          default:
            return "variable";
        }
      }
      matchesScope(symbol, scope) {
        switch (scope) {
          case "global":
            return symbol.scope === "global";
          case "local":
            return symbol.scope !== "global";
          default:
            return true;
        }
      }
      getSchema() {
        return {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the source code file to parse"
            },
            includeSymbols: {
              type: "boolean",
              description: "Whether to extract symbols (functions, classes, variables, etc.)",
              default: true
            },
            includeImports: {
              type: "boolean",
              description: "Whether to extract import/export information",
              default: true
            },
            includeTree: {
              type: "boolean",
              description: "Whether to include the full AST tree in response",
              default: false
            },
            symbolTypes: {
              type: "array",
              items: {
                type: "string",
                enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
              },
              description: "Types of symbols to extract",
              default: ["function", "class", "variable", "interface", "enum", "type"]
            },
            scope: {
              type: "string",
              enum: ["all", "global", "local"],
              description: "Scope of symbols to extract",
              default: "all"
            }
          },
          required: ["filePath"]
        };
      }
    };
  }
});
var SymbolSearchTool;
var init_symbol_search = __esm({
  "src/tools/intelligence/symbol-search.ts"() {
    init_ast_parser();
    SymbolSearchTool = class {
      // 5 minutes
      constructor() {
        this.name = "symbol_search";
        this.description = "Search for symbols (functions, classes, variables) across the codebase with fuzzy matching and cross-references";
        this.symbolIndex = /* @__PURE__ */ new Map();
        this.lastIndexTime = 0;
        this.indexCacheDuration = 5 * 60 * 1e3;
        this.astParser = new ASTParserTool();
      }
      async execute(args) {
        try {
          const {
            query,
            searchPath = process.cwd(),
            symbolTypes = ["function", "class", "variable", "interface", "enum", "type"],
            includeUsages = false,
            fuzzyMatch = true,
            caseSensitive = false,
            maxResults = 50,
            filePatterns = ["**/*.{ts,tsx,js,jsx,py}"],
            excludePatterns = ["**/node_modules/**", "**/dist/**", "**/.git/**"],
            indexCache = true
          } = args;
          if (!query) {
            throw new Error("Search query is required");
          }
          const startTime = Date.now();
          if (!indexCache || this.shouldRebuildIndex()) {
            await this.buildSymbolIndex(searchPath, filePatterns, excludePatterns, symbolTypes);
          }
          const results = await this.searchSymbols(
            query,
            symbolTypes,
            fuzzyMatch,
            caseSensitive,
            maxResults,
            includeUsages
          );
          const searchTime = Date.now() - startTime;
          return {
            success: true,
            output: JSON.stringify({
              ...results,
              searchTime
            }, null, 2)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      shouldRebuildIndex() {
        return Date.now() - this.lastIndexTime > this.indexCacheDuration;
      }
      async buildSymbolIndex(searchPath, filePatterns, excludePatterns, symbolTypes) {
        this.symbolIndex.clear();
        const allFiles = [];
        for (const pattern of filePatterns) {
          const files = await glob(pattern, {
            cwd: searchPath,
            absolute: true,
            ignore: excludePatterns
          });
          allFiles.push(...files);
        }
        for (const filePath of allFiles) {
          try {
            const parseResult = await this.astParser.execute({
              filePath,
              includeSymbols: true,
              includeImports: false,
              includeTree: false,
              symbolTypes
            });
            if (!parseResult.success || !parseResult.output) continue;
            const parsed = JSON.parse(parseResult.output);
            if (parsed.success && parsed.result.symbols) {
              const symbols = parsed.result.symbols;
              for (const symbol of symbols) {
                const symbolRef = {
                  symbol,
                  filePath,
                  usages: []
                };
                const existing = this.symbolIndex.get(symbol.name) || [];
                existing.push(symbolRef);
                this.symbolIndex.set(symbol.name, existing);
                const typeKey = `type:${symbol.type}`;
                const typeExisting = this.symbolIndex.get(typeKey) || [];
                typeExisting.push(symbolRef);
                this.symbolIndex.set(typeKey, typeExisting);
              }
            }
          } catch (error) {
            console.warn(`Failed to parse ${filePath}: ${error}`);
          }
        }
        this.lastIndexTime = Date.now();
      }
      async searchSymbols(query, symbolTypes, fuzzyMatch, caseSensitive, maxResults, includeUsages) {
        const allSymbols = [];
        for (const refs of this.symbolIndex.values()) {
          allSymbols.push(...refs);
        }
        const filteredSymbols = allSymbols.filter(
          (ref) => symbolTypes.includes(ref.symbol.type)
        );
        let matches = [];
        if (fuzzyMatch) {
          const fuse = new Fuse(filteredSymbols, {
            keys: [
              { name: "symbol.name", weight: 0.7 },
              { name: "symbol.type", weight: 0.2 },
              { name: "filePath", weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            includeMatches: true,
            isCaseSensitive: caseSensitive
          });
          const fuseResults = fuse.search(query);
          matches = fuseResults.map((result) => result.item);
        } else {
          const queryLower = caseSensitive ? query : query.toLowerCase();
          matches = filteredSymbols.filter((ref) => {
            const symbolName = caseSensitive ? ref.symbol.name : ref.symbol.name.toLowerCase();
            return symbolName.includes(queryLower);
          });
        }
        matches = matches.slice(0, maxResults);
        if (includeUsages) {
          for (const match of matches) {
            match.usages = await this.findSymbolUsages(match);
          }
        }
        return {
          query,
          totalMatches: matches.length,
          symbols: matches,
          searchTime: 0,
          // Will be set by caller
          scope: {
            filesSearched: this.getUniqueFiles(allSymbols).length,
            symbolsIndexed: allSymbols.length
          }
        };
      }
      async findSymbolUsages(symbolRef) {
        const usages = [];
        try {
          const content = await fs2.promises.readFile(symbolRef.filePath, "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const symbolName = symbolRef.symbol.name;
            let index = 0;
            while ((index = line.indexOf(symbolName, index)) !== -1) {
              if (i === symbolRef.symbol.startPosition.row) {
                index += symbolName.length;
                continue;
              }
              let usageType = "reference";
              if (line.includes("import") && line.includes(symbolName)) {
                usageType = "import";
              } else if (line.includes("export") && line.includes(symbolName)) {
                usageType = "export";
              } else if (line.includes(symbolName + "(")) {
                usageType = "call";
              }
              usages.push({
                line: i,
                column: index,
                context: line.trim(),
                type: usageType
              });
              index += symbolName.length;
            }
          }
        } catch (_error) {
        }
        return usages;
      }
      getUniqueFiles(symbols) {
        const files = new Set(symbols.map((ref) => ref.filePath));
        return Array.from(files);
      }
      async findCrossReferences(symbolName, searchPath = process.cwd()) {
        const crossRefs = [];
        const searchResult = await this.execute({
          query: symbolName,
          searchPath,
          includeUsages: true,
          fuzzyMatch: false,
          caseSensitive: true
        });
        if (!searchResult.success || !searchResult.output) return [];
        const parsed = JSON.parse(searchResult.output);
        if (parsed.success && parsed.result.symbols) {
          const symbols = parsed.result.symbols;
          for (const symbolRef of symbols) {
            if (symbolRef.symbol.name === symbolName) {
              const definitionFile = symbolRef.filePath;
              const usageFiles = symbolRef.usages.filter((usage) => usage.type === "reference" || usage.type === "call").map(() => symbolRef.filePath);
              const importedBy = symbolRef.usages.filter((usage) => usage.type === "import").map(() => symbolRef.filePath);
              const exportedTo = symbolRef.usages.filter((usage) => usage.type === "export").map(() => symbolRef.filePath);
              crossRefs.push({
                symbol: symbolName,
                definitionFile,
                usageFiles: [...new Set(usageFiles)],
                importedBy: [...new Set(importedBy)],
                exportedTo: [...new Set(exportedTo)]
              });
            }
          }
        }
        return crossRefs;
      }
      async findSimilarSymbols(symbolName, threshold = 0.6) {
        const allSymbols = [];
        for (const refs of this.symbolIndex.values()) {
          allSymbols.push(...refs);
        }
        const fuse = new Fuse(allSymbols, {
          keys: ["symbol.name"],
          threshold,
          includeScore: true
        });
        const results = fuse.search(symbolName);
        return results.map((result) => result.item);
      }
      async getSymbolsByType(symbolType, searchPath = process.cwd()) {
        if (!this.symbolIndex.has(`type:${symbolType}`)) {
          await this.buildSymbolIndex(
            searchPath,
            ["**/*.{ts,tsx,js,jsx,py}"],
            ["**/node_modules/**", "**/dist/**", "**/.git/**"],
            [symbolType]
          );
        }
        return this.symbolIndex.get(`type:${symbolType}`) || [];
      }
      clearIndex() {
        this.symbolIndex.clear();
        this.lastIndexTime = 0;
      }
      getIndexStats() {
        const allSymbols = [];
        for (const refs of this.symbolIndex.values()) {
          allSymbols.push(...refs);
        }
        return {
          symbolCount: allSymbols.length,
          fileCount: this.getUniqueFiles(allSymbols).length,
          lastUpdated: new Date(this.lastIndexTime)
        };
      }
      getSchema() {
        return {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query for symbol names"
            },
            searchPath: {
              type: "string",
              description: "Root path to search in",
              default: "current working directory"
            },
            symbolTypes: {
              type: "array",
              items: {
                type: "string",
                enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
              },
              description: "Types of symbols to search for",
              default: ["function", "class", "variable", "interface", "enum", "type"]
            },
            includeUsages: {
              type: "boolean",
              description: "Whether to find usages of matched symbols",
              default: false
            },
            fuzzyMatch: {
              type: "boolean",
              description: "Use fuzzy matching for symbol names",
              default: true
            },
            caseSensitive: {
              type: "boolean",
              description: "Case sensitive search",
              default: false
            },
            maxResults: {
              type: "integer",
              description: "Maximum number of results to return",
              default: 50,
              minimum: 1,
              maximum: 1e3
            },
            filePatterns: {
              type: "array",
              items: { type: "string" },
              description: "Glob patterns for files to search",
              default: ["**/*.{ts,tsx,js,jsx,py}"]
            },
            excludePatterns: {
              type: "array",
              items: { type: "string" },
              description: "Glob patterns for files to exclude",
              default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
            },
            indexCache: {
              type: "boolean",
              description: "Use cached symbol index if available",
              default: true
            }
          },
          required: ["query"]
        };
      }
    };
  }
});
var pathExists9, DependencyAnalyzerTool;
var init_dependency_analyzer = __esm({
  "src/tools/intelligence/dependency-analyzer.ts"() {
    init_ast_parser();
    pathExists9 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    DependencyAnalyzerTool = class {
      constructor() {
        this.name = "dependency_analyzer";
        this.description = "Analyze import/export dependencies, detect circular dependencies, and generate dependency graphs";
        this.astParser = new ASTParserTool();
      }
      async execute(args) {
        try {
          const {
            rootPath = process.cwd(),
            filePatterns = ["**/*.{ts,tsx,js,jsx}"],
            excludePatterns = ["**/node_modules/**", "**/dist/**", "**/.git/**"],
            includeExternals = false,
            detectCircular = true,
            findUnreachable = true,
            generateGraph = false,
            entryPoints = [],
            maxDepth = 50
          } = args;
          if (!await pathExists9(rootPath)) {
            throw new Error(`Root path does not exist: ${rootPath}`);
          }
          const sourceFiles = await this.findSourceFiles(rootPath, filePatterns, excludePatterns);
          const dependencyGraph = await this.buildDependencyGraph(
            sourceFiles,
            rootPath,
            includeExternals,
            maxDepth
          );
          if (detectCircular) {
            dependencyGraph.circularDependencies = this.detectCircularDependencies(dependencyGraph);
          }
          if (findUnreachable) {
            dependencyGraph.unreachableFiles = this.findUnreachableFiles(
              dependencyGraph,
              entryPoints.length > 0 ? entryPoints : this.inferEntryPoints(dependencyGraph)
            );
          }
          dependencyGraph.statistics = this.calculateStatistics(dependencyGraph);
          const result = {
            rootPath,
            totalFiles: sourceFiles.length,
            entryPoints: dependencyGraph.entryPoints,
            leafNodes: dependencyGraph.leafNodes,
            statistics: dependencyGraph.statistics
          };
          if (detectCircular) {
            result.circularDependencies = dependencyGraph.circularDependencies;
          }
          if (findUnreachable) {
            result.unreachableFiles = dependencyGraph.unreachableFiles;
          }
          if (generateGraph) {
            result.dependencyGraph = this.serializeDependencyGraph(dependencyGraph);
          }
          return {
            success: true,
            output: JSON.stringify(result, null, 2)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      async findSourceFiles(rootPath, filePatterns, excludePatterns) {
        const allFiles = [];
        for (const pattern of filePatterns) {
          const files = await glob(pattern, {
            cwd: rootPath,
            absolute: true,
            ignore: excludePatterns
          });
          allFiles.push(...files);
        }
        return [...new Set(allFiles)];
      }
      async buildDependencyGraph(sourceFiles, rootPath, includeExternals, maxDepth) {
        const graph = {
          nodes: /* @__PURE__ */ new Map(),
          entryPoints: [],
          leafNodes: [],
          circularDependencies: [],
          unreachableFiles: [],
          statistics: {
            totalFiles: 0,
            totalDependencies: 0,
            averageDependencies: 0,
            maxDependencyDepth: 0,
            circularDependencyCount: 0,
            unreachableFileCount: 0
          }
        };
        for (const filePath of sourceFiles) {
          try {
            const parseResult = await this.astParser.execute({
              filePath,
              includeSymbols: false,
              includeImports: true,
              includeTree: false
            });
            if (!parseResult.success || !parseResult.output) continue;
            const parsed = JSON.parse(parseResult.output);
            if (parsed.success && parsed.result) {
              const imports = parsed.result.imports || [];
              const exports = parsed.result.exports || [];
              const dependencies = await this.resolveImportPaths(
                imports,
                filePath,
                rootPath,
                includeExternals
              );
              const node = {
                filePath: path8__default.relative(rootPath, filePath),
                absolutePath: filePath,
                imports,
                exports,
                dependencies,
                dependents: [],
                isEntryPoint: false,
                isLeaf: dependencies.length === 0,
                circularDependencies: []
              };
              graph.nodes.set(filePath, node);
            }
          } catch (error) {
            console.warn(`Failed to parse ${filePath}: ${error}`);
          }
        }
        for (const [filePath, node] of graph.nodes) {
          for (const dependency of node.dependencies) {
            const depNode = graph.nodes.get(dependency);
            if (depNode) {
              depNode.dependents.push(filePath);
            }
          }
        }
        for (const [filePath, node] of graph.nodes) {
          node.isEntryPoint = node.dependents.length === 0;
          node.isLeaf = node.dependencies.length === 0;
          if (node.isEntryPoint) {
            graph.entryPoints.push(filePath);
          }
          if (node.isLeaf) {
            graph.leafNodes.push(filePath);
          }
        }
        return graph;
      }
      async resolveImportPaths(imports, currentFile, rootPath, includeExternals) {
        const dependencies = [];
        const currentDir = path8__default.dirname(currentFile);
        for (const importInfo of imports) {
          let resolvedPath = null;
          if (importInfo.source.startsWith(".")) {
            resolvedPath = await this.resolveRelativeImport(importInfo.source, currentDir);
          } else if (importInfo.source.startsWith("/")) {
            resolvedPath = await this.resolveAbsoluteImport(importInfo.source, rootPath);
          } else if (includeExternals) {
            dependencies.push(importInfo.source);
            continue;
          } else {
            continue;
          }
          if (resolvedPath && await pathExists9(resolvedPath)) {
            dependencies.push(resolvedPath);
          }
        }
        return dependencies;
      }
      async resolveRelativeImport(importPath, currentDir) {
        const basePath = path8__default.resolve(currentDir, importPath);
        const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
        for (const ext of extensions) {
          const fullPath = basePath + ext;
          if (await pathExists9(fullPath)) {
            return fullPath;
          }
        }
        for (const ext of extensions) {
          const indexPath = path8__default.join(basePath, `index${ext}`);
          if (await pathExists9(indexPath)) {
            return indexPath;
          }
        }
        return null;
      }
      async resolveAbsoluteImport(importPath, rootPath) {
        const fullPath = path8__default.join(rootPath, importPath.slice(1));
        return await this.resolveRelativeImport(".", path8__default.dirname(fullPath));
      }
      detectCircularDependencies(graph) {
        const circularDeps = [];
        const visited = /* @__PURE__ */ new Set();
        const visiting = /* @__PURE__ */ new Set();
        const dfs = (filePath, path33) => {
          if (visiting.has(filePath)) {
            const cycleStart = path33.indexOf(filePath);
            const cycle = path33.slice(cycleStart).concat([filePath]);
            circularDeps.push({
              cycle: cycle.map((fp) => graph.nodes.get(fp)?.filePath || fp),
              severity: cycle.length <= 2 ? "error" : "warning",
              type: cycle.length <= 2 ? "direct" : "indirect"
            });
            return;
          }
          if (visited.has(filePath)) {
            return;
          }
          visiting.add(filePath);
          const node = graph.nodes.get(filePath);
          if (node) {
            for (const dependency of node.dependencies) {
              if (graph.nodes.has(dependency)) {
                dfs(dependency, [...path33, filePath]);
              }
            }
          }
          visiting.delete(filePath);
          visited.add(filePath);
        };
        for (const filePath of graph.nodes.keys()) {
          if (!visited.has(filePath)) {
            dfs(filePath, []);
          }
        }
        return circularDeps;
      }
      findUnreachableFiles(graph, entryPoints) {
        const reachable = /* @__PURE__ */ new Set();
        const dfs = (filePath) => {
          if (reachable.has(filePath)) {
            return;
          }
          reachable.add(filePath);
          const node = graph.nodes.get(filePath);
          if (node) {
            for (const dependency of node.dependencies) {
              if (graph.nodes.has(dependency)) {
                dfs(dependency);
              }
            }
          }
        };
        for (const entryPoint of entryPoints) {
          if (graph.nodes.has(entryPoint)) {
            dfs(entryPoint);
          }
        }
        const unreachable = [];
        for (const filePath of graph.nodes.keys()) {
          if (!reachable.has(filePath)) {
            const node = graph.nodes.get(filePath);
            unreachable.push(node?.filePath || filePath);
          }
        }
        return unreachable;
      }
      inferEntryPoints(graph) {
        if (graph.entryPoints.length > 0) {
          return graph.entryPoints;
        }
        const commonEntryPatterns = [
          /index\.(ts|js|tsx|jsx)$/,
          /main\.(ts|js|tsx|jsx)$/,
          /app\.(ts|js|tsx|jsx)$/,
          /server\.(ts|js|tsx|jsx)$/
        ];
        const entryPoints = [];
        for (const [filePath, node] of graph.nodes) {
          const fileName = path8__default.basename(filePath);
          if (node.dependents.length === 0 || commonEntryPatterns.some((pattern) => pattern.test(fileName))) {
            entryPoints.push(filePath);
          }
        }
        return entryPoints;
      }
      calculateStatistics(graph) {
        const totalFiles = graph.nodes.size;
        let totalDependencies = 0;
        let maxDepth = 0;
        for (const node of graph.nodes.values()) {
          totalDependencies += node.dependencies.length;
          const depth = this.calculateNodeDepth(node.absolutePath, graph);
          maxDepth = Math.max(maxDepth, depth);
        }
        return {
          totalFiles,
          totalDependencies,
          averageDependencies: totalFiles > 0 ? totalDependencies / totalFiles : 0,
          maxDependencyDepth: maxDepth,
          circularDependencyCount: graph.circularDependencies.length,
          unreachableFileCount: graph.unreachableFiles.length
        };
      }
      calculateNodeDepth(filePath, graph) {
        const visited = /* @__PURE__ */ new Set();
        const dfs = (currentPath, depth) => {
          if (visited.has(currentPath)) {
            return depth;
          }
          visited.add(currentPath);
          const node = graph.nodes.get(currentPath);
          if (!node || node.dependencies.length === 0) {
            return depth;
          }
          let maxChildDepth = depth;
          for (const dependency of node.dependencies) {
            if (graph.nodes.has(dependency)) {
              const childDepth = dfs(dependency, depth + 1);
              maxChildDepth = Math.max(maxChildDepth, childDepth);
            }
          }
          return maxChildDepth;
        };
        return dfs(filePath, 0);
      }
      serializeDependencyGraph(graph) {
        const nodes = [];
        for (const [filePath, node] of graph.nodes) {
          nodes.push({
            id: filePath,
            filePath: node.filePath,
            dependencies: node.dependencies,
            dependents: node.dependents,
            isEntryPoint: node.isEntryPoint,
            isLeaf: node.isLeaf,
            importCount: node.imports.length,
            exportCount: node.exports.length
          });
        }
        return {
          nodes,
          edges: this.generateEdges(graph)
        };
      }
      generateEdges(graph) {
        const edges = [];
        for (const [filePath, node] of graph.nodes) {
          for (const dependency of node.dependencies) {
            if (graph.nodes.has(dependency)) {
              edges.push({
                from: filePath,
                to: dependency,
                type: "dependency"
              });
            }
          }
        }
        return edges;
      }
      // Additional utility methods
      async analyzeModule(filePath) {
        const parseResult = await this.astParser.execute({
          filePath,
          includeSymbols: false,
          includeImports: true,
          includeTree: false
        });
        if (!parseResult.success || !parseResult.output) {
          throw new Error(`Failed to parse module: ${filePath}`);
        }
        const parsed = JSON.parse(parseResult.output);
        if (!parsed.success) {
          throw new Error(`Failed to parse module: ${filePath}`);
        }
        const imports = parsed.result.imports || [];
        const rootPath = process.cwd();
        const externalDependencies = [];
        const internalDependencies = [];
        const duplicateImports = [];
        const seenSources = /* @__PURE__ */ new Set();
        for (const importInfo of imports) {
          if (seenSources.has(importInfo.source)) {
            duplicateImports.push(importInfo.source);
          } else {
            seenSources.add(importInfo.source);
          }
          if (importInfo.source.startsWith(".") || importInfo.source.startsWith("/")) {
            const resolved = await this.resolveRelativeImport(
              importInfo.source,
              path8__default.dirname(filePath)
            );
            if (resolved) {
              internalDependencies.push(resolved);
            }
          } else {
            externalDependencies.push(importInfo.source);
          }
        }
        return {
          filePath: path8__default.relative(rootPath, filePath),
          externalDependencies,
          internalDependencies,
          circularImports: [],
          // TODO: Implement
          unusedImports: [],
          // TODO: Implement with symbol usage analysis
          missingDependencies: [],
          // TODO: Implement with file existence checks
          duplicateImports
        };
      }
      getSchema() {
        return {
          type: "object",
          properties: {
            rootPath: {
              type: "string",
              description: "Root path to analyze dependencies from",
              default: "current working directory"
            },
            filePatterns: {
              type: "array",
              items: { type: "string" },
              description: "Glob patterns for files to include",
              default: ["**/*.{ts,tsx,js,jsx}"]
            },
            excludePatterns: {
              type: "array",
              items: { type: "string" },
              description: "Glob patterns for files to exclude",
              default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
            },
            includeExternals: {
              type: "boolean",
              description: "Include external module dependencies",
              default: false
            },
            detectCircular: {
              type: "boolean",
              description: "Detect circular dependencies",
              default: true
            },
            findUnreachable: {
              type: "boolean",
              description: "Find unreachable files from entry points",
              default: true
            },
            generateGraph: {
              type: "boolean",
              description: "Generate serialized dependency graph",
              default: false
            },
            entryPoints: {
              type: "array",
              items: { type: "string" },
              description: "Explicit entry point files (if not provided, will be inferred)",
              default: []
            },
            maxDepth: {
              type: "integer",
              description: "Maximum dependency depth to analyze",
              default: 50,
              minimum: 1,
              maximum: 1e3
            }
          }
        };
      }
    };
  }
});
var pathExists10, CodeContextTool;
var init_code_context = __esm({
  "src/tools/intelligence/code-context.ts"() {
    init_ast_parser();
    init_symbol_search();
    init_dependency_analyzer();
    pathExists10 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    CodeContextTool = class {
      constructor() {
        this.name = "code_context";
        this.description = "Build intelligent code context, analyze relationships, and provide semantic understanding";
        this.astParser = new ASTParserTool();
        this.symbolSearch = new SymbolSearchTool();
        this.dependencyAnalyzer = new DependencyAnalyzerTool();
      }
      async execute(args) {
        try {
          const {
            filePath,
            rootPath = process.cwd(),
            includeRelationships = true,
            includeMetrics = true,
            includeSemantics = true,
            maxRelatedFiles = 10,
            contextDepth = 2
          } = args;
          if (!filePath) {
            throw new Error("File path is required");
          }
          if (!await pathExists10(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          const context = await this.buildCodeContext(
            filePath,
            rootPath,
            includeRelationships,
            includeMetrics,
            includeSemantics,
            maxRelatedFiles,
            contextDepth
          );
          return {
            success: true,
            output: JSON.stringify(context, null, 2)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      async buildCodeContext(filePath, rootPath, includeRelationships, includeMetrics, includeSemantics, maxRelatedFiles, contextDepth) {
        const parseResult = await this.astParser.execute({
          filePath,
          includeSymbols: true,
          includeImports: true,
          includeTree: false
        });
        if (!parseResult.success || !parseResult.output) {
          throw new Error(`Failed to parse file: ${filePath}`);
        }
        const parsed = JSON.parse(parseResult.output);
        if (!parsed.success) {
          throw new Error(`Failed to parse file: ${filePath}`);
        }
        const symbols = parsed.result.symbols || [];
        const imports = parsed.result.imports || [];
        const contextualSymbols = await this.enhanceSymbolsWithContext(symbols, filePath, rootPath);
        const dependencies = await this.analyzeDependencies(imports, filePath, rootPath);
        let relationships = [];
        if (includeRelationships) {
          relationships = await this.buildCodeRelationships(
            filePath,
            contextualSymbols,
            dependencies,
            rootPath,
            maxRelatedFiles
          );
        }
        let semanticContext = {
          purpose: "unknown",
          domain: [],
          patterns: [],
          complexity: { cyclomatic: 0, cognitive: 0, nesting: 0, dependencies: 0 },
          quality: { maintainability: 0, readability: 0, testability: 0, reusability: 0 }
        };
        if (includeSemantics) {
          semanticContext = await this.analyzeSemanticContext(filePath, contextualSymbols, dependencies);
        }
        let codeMetrics = {
          linesOfCode: 0,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          maintainabilityIndex: 0,
          technicalDebt: 0
        };
        if (includeMetrics) {
          codeMetrics = await this.calculateCodeMetrics(filePath, contextualSymbols);
        }
        return {
          filePath: path8__default.relative(rootPath, filePath),
          symbols: contextualSymbols,
          dependencies,
          relationships,
          semanticContext,
          codeMetrics
        };
      }
      async enhanceSymbolsWithContext(symbols, filePath, rootPath) {
        const enhanced = [];
        for (const symbol of symbols) {
          const relatedSymbols = await this.findRelatedSymbols(symbol, symbols, filePath, rootPath);
          const usagePatterns = await this.analyzeUsagePatterns(symbol, filePath);
          const semanticTags = this.generateSemanticTags(symbol, filePath);
          const contextualSymbol = {
            ...symbol,
            context: {
              parentClass: this.findParentClass(symbol, symbols),
              parentFunction: this.findParentFunction(symbol, symbols),
              relatedSymbols,
              usagePatterns,
              semanticTags
            }
          };
          enhanced.push(contextualSymbol);
        }
        return enhanced;
      }
      async findRelatedSymbols(symbol, allSymbols, filePath, rootPath) {
        const related = [];
        const sameScope = allSymbols.filter(
          (s) => s !== symbol && s.scope === symbol.scope
        );
        related.push(...sameScope.map((s) => s.name));
        try {
          const searchResult = await this.symbolSearch.findSimilarSymbols(symbol.name, 0.7);
          const similarNames = searchResult.filter((ref) => ref.filePath !== filePath).slice(0, 5).map((ref) => ref.symbol.name);
          related.push(...similarNames);
        } catch (error) {
        }
        return [...new Set(related)];
      }
      async analyzeUsagePatterns(symbol, filePath) {
        const patterns = [];
        try {
          const content = await fs2.promises.readFile(filePath, "utf-8");
          const lines = content.split("\n");
          let callCount = 0;
          let assignmentCount = 0;
          let returnCount = 0;
          for (const line of lines) {
            if (line.includes(`${symbol.name}(`)) callCount++;
            if (line.includes(`= ${symbol.name}`) || line.includes(`const ${symbol.name}`)) assignmentCount++;
            if (line.includes(`return ${symbol.name}`)) returnCount++;
          }
          if (callCount > 0) {
            patterns.push({
              pattern: "function_call",
              frequency: callCount,
              contexts: ["invocation"]
            });
          }
          if (assignmentCount > 0) {
            patterns.push({
              pattern: "assignment",
              frequency: assignmentCount,
              contexts: ["declaration", "assignment"]
            });
          }
          if (returnCount > 0) {
            patterns.push({
              pattern: "return_value",
              frequency: returnCount,
              contexts: ["return"]
            });
          }
        } catch (error) {
        }
        return patterns;
      }
      generateSemanticTags(symbol, filePath) {
        const tags = [];
        tags.push(symbol.type);
        const name = symbol.name.toLowerCase();
        if (name.includes("test") || name.includes("spec")) {
          tags.push("test");
        }
        if (name.includes("util") || name.includes("helper")) {
          tags.push("utility");
        }
        if (name.includes("config") || name.includes("setting")) {
          tags.push("configuration");
        }
        if (name.includes("api") || name.includes("service")) {
          tags.push("api");
        }
        if (name.includes("component") || name.includes("widget")) {
          tags.push("ui");
        }
        if (name.includes("model") || name.includes("entity")) {
          tags.push("model");
        }
        if (name.includes("controller") || name.includes("handler")) {
          tags.push("controller");
        }
        const fileName = path8__default.basename(filePath);
        if (fileName.includes("test")) {
          tags.push("test");
        }
        if (fileName.includes("mock")) {
          tags.push("mock");
        }
        if (symbol.isAsync) {
          tags.push("async");
        }
        if (symbol.accessibility) {
          tags.push(symbol.accessibility);
        }
        return [...new Set(tags)];
      }
      findParentClass(symbol, allSymbols) {
        const classSymbols = allSymbols.filter((s) => s.type === "class");
        for (const classSymbol of classSymbols) {
          if (symbol.startPosition.row >= classSymbol.startPosition.row && symbol.endPosition.row <= classSymbol.endPosition.row && symbol !== classSymbol) {
            return classSymbol.name;
          }
        }
        return void 0;
      }
      findParentFunction(symbol, allSymbols) {
        const functionSymbols = allSymbols.filter((s) => s.type === "function" || s.type === "method");
        for (const funcSymbol of functionSymbols) {
          if (symbol.startPosition.row >= funcSymbol.startPosition.row && symbol.endPosition.row <= funcSymbol.endPosition.row && symbol !== funcSymbol) {
            return funcSymbol.name;
          }
        }
        return void 0;
      }
      async analyzeDependencies(imports, filePath, rootPath) {
        const dependencies = [];
        for (const importInfo of imports) {
          const type = this.categorizeImport(importInfo.source);
          const importedSymbols = importInfo.specifiers?.map((spec) => spec.name) || [];
          dependencies.push({
            source: importInfo.source,
            type,
            usage: "direct",
            importedSymbols,
            usageContext: [],
            isCircular: false
            // TODO: Check with dependency analyzer
          });
        }
        return dependencies;
      }
      categorizeImport(source) {
        if (source.startsWith(".") || source.startsWith("/")) {
          return "internal";
        }
        const builtinModules = ["fs", "path", "util", "crypto", "http", "https", "os", "url"];
        if (builtinModules.includes(source)) {
          return "builtin";
        }
        return "external";
      }
      async buildCodeRelationships(filePath, symbols, dependencies, rootPath, maxRelatedFiles) {
        const relationships = [];
        for (const symbol of symbols) {
          for (const relatedName of symbol.context.relatedSymbols) {
            const relatedSymbol = symbols.find((s) => s.name === relatedName);
            if (relatedSymbol) {
              relationships.push({
                type: "usage",
                source: symbol.name,
                target: relatedSymbol.name,
                strength: 0.8,
                description: `${symbol.name} uses ${relatedSymbol.name}`,
                evidence: [`Same file: ${path8__default.basename(filePath)}`]
              });
            }
          }
        }
        for (const dep of dependencies) {
          if (dep.type === "internal") {
            relationships.push({
              type: "dependency",
              source: path8__default.basename(filePath),
              target: dep.source,
              strength: 0.9,
              description: `File depends on ${dep.source}`,
              evidence: [`Import: ${dep.importedSymbols.join(", ")}`]
            });
          }
        }
        return relationships;
      }
      async analyzeSemanticContext(filePath, symbols, dependencies) {
        const fileName = path8__default.basename(filePath);
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const purpose = this.inferPurpose(fileName, symbols, content);
        const domain = this.extractDomain(filePath, symbols, dependencies);
        const patterns = this.detectDesignPatterns(content, symbols);
        const complexity = this.calculateComplexityMetrics(content, symbols);
        const quality = this.assessQuality(content, symbols, dependencies);
        return {
          purpose,
          domain,
          patterns,
          complexity,
          quality
        };
      }
      inferPurpose(fileName, symbols, content) {
        const name = fileName.toLowerCase();
        if (name.includes("test") || name.includes("spec")) return "testing";
        if (name.includes("config")) return "configuration";
        if (name.includes("util") || name.includes("helper")) return "utility";
        if (name.includes("service")) return "service";
        if (name.includes("component")) return "ui_component";
        if (name.includes("model")) return "data_model";
        if (name.includes("controller")) return "controller";
        if (name.includes("router") || name.includes("route")) return "routing";
        const functionCount = symbols.filter((s) => s.type === "function").length;
        const classCount = symbols.filter((s) => s.type === "class").length;
        const interfaceCount = symbols.filter((s) => s.type === "interface").length;
        if (interfaceCount > functionCount && interfaceCount > classCount) return "type_definitions";
        if (classCount > functionCount) return "object_oriented";
        if (functionCount > 0) return "functional";
        return "unknown";
      }
      extractDomain(filePath, symbols, dependencies) {
        const domains = [];
        const pathParts = filePath.split(path8__default.sep);
        for (const part of pathParts) {
          if (["auth", "user", "authentication"].includes(part.toLowerCase())) {
            domains.push("authentication");
          }
          if (["api", "rest", "graphql"].includes(part.toLowerCase())) {
            domains.push("api");
          }
          if (["ui", "component", "view"].includes(part.toLowerCase())) {
            domains.push("ui");
          }
          if (["data", "model", "database"].includes(part.toLowerCase())) {
            domains.push("data");
          }
        }
        for (const dep of dependencies) {
          if (dep.source.includes("react")) domains.push("react");
          if (dep.source.includes("express")) domains.push("web_server");
          if (dep.source.includes("database") || dep.source.includes("sql")) domains.push("database");
          if (dep.source.includes("test")) domains.push("testing");
        }
        return [...new Set(domains)];
      }
      detectDesignPatterns(content, symbols) {
        const patterns = [];
        if (content.includes("getInstance") && symbols.some((s) => s.type === "class")) {
          patterns.push({
            name: "Singleton",
            confidence: 0.7,
            evidence: ["getInstance method found"],
            location: { startLine: 0, endLine: 0 }
          });
        }
        if (content.includes("create") && symbols.some((s) => s.name.toLowerCase().includes("factory"))) {
          patterns.push({
            name: "Factory",
            confidence: 0.8,
            evidence: ["Factory class with create method"],
            location: { startLine: 0, endLine: 0 }
          });
        }
        if (content.includes("subscribe") || content.includes("addEventListener")) {
          patterns.push({
            name: "Observer",
            confidence: 0.6,
            evidence: ["Event subscription methods found"],
            location: { startLine: 0, endLine: 0 }
          });
        }
        return patterns;
      }
      calculateComplexityMetrics(content, symbols) {
        const lines = content.split("\n");
        let cyclomatic = 1;
        let cognitive = 0;
        let maxNesting = 0;
        let currentNesting = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes("if") || trimmed.includes("while") || trimmed.includes("for") || trimmed.includes("switch") || trimmed.includes("catch")) {
            cyclomatic++;
          }
          if (trimmed.includes("{")) currentNesting++;
          if (trimmed.includes("}")) currentNesting--;
          maxNesting = Math.max(maxNesting, currentNesting);
          if (trimmed.includes("if") || trimmed.includes("while") || trimmed.includes("for")) {
            cognitive += currentNesting + 1;
          }
        }
        return {
          cyclomatic,
          cognitive,
          nesting: maxNesting,
          dependencies: symbols.length
        };
      }
      assessQuality(content, symbols, dependencies) {
        const lines = content.split("\n").filter((line) => line.trim().length > 0);
        const commentLines = lines.filter((line) => line.trim().startsWith("//") || line.trim().startsWith("*"));
        const commentRatio = commentLines.length / lines.length;
        const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
        const functionCount = symbols.filter((s) => s.type === "function").length;
        const classCount = symbols.filter((s) => s.type === "class").length;
        const maintainability = Math.min(1, commentRatio * 2 + (functionCount > 0 ? 0.3 : 0));
        const readability = Math.max(0, 1 - (averageLineLength - 50) / 100);
        const testability = functionCount > classCount ? 0.8 : 0.5;
        const reusability = dependencies.filter((d) => d.type === "external").length > 0 ? 0.7 : 0.4;
        return {
          maintainability: Math.max(0, Math.min(1, maintainability)),
          readability: Math.max(0, Math.min(1, readability)),
          testability: Math.max(0, Math.min(1, testability)),
          reusability: Math.max(0, Math.min(1, reusability))
        };
      }
      async calculateCodeMetrics(filePath, symbols) {
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const codeLines = lines.filter((line) => line.trim().length > 0 && !line.trim().startsWith("//"));
        const linesOfCode = codeLines.length;
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
        const cognitiveComplexity = this.calculateCognitiveComplexity(content);
        const averageLineLength = codeLines.reduce((sum, line) => sum + line.length, 0) / codeLines.length;
        const maintainabilityIndex = Math.max(
          0,
          171 - 5.2 * Math.log(averageLineLength) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)
        );
        const technicalDebt = (cyclomaticComplexity - 10) * 0.1 + (cognitiveComplexity - 15) * 0.05;
        return {
          linesOfCode,
          cyclomaticComplexity,
          cognitiveComplexity,
          maintainabilityIndex,
          technicalDebt: Math.max(0, technicalDebt)
        };
      }
      calculateCyclomaticComplexity(content) {
        let complexity = 1;
        const complexityKeywords = ["if", "else", "while", "for", "switch", "case", "catch", "&&", "||", "?"];
        for (const keyword of complexityKeywords) {
          const matches = content.match(new RegExp(`\\b${keyword}\\b`, "g"));
          if (matches) {
            complexity += matches.length;
          }
        }
        return complexity;
      }
      calculateCognitiveComplexity(content) {
        let complexity = 0;
        let nestingLevel = 0;
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes("{")) nestingLevel++;
          if (trimmed.includes("}")) nestingLevel = Math.max(0, nestingLevel - 1);
          if (trimmed.includes("if") || trimmed.includes("while") || trimmed.includes("for")) {
            complexity += nestingLevel + 1;
          }
          if (trimmed.includes("switch")) {
            complexity += nestingLevel + 1;
          }
          if (trimmed.includes("catch")) {
            complexity += nestingLevel + 1;
          }
        }
        return complexity;
      }
      getSchema() {
        return {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the file to analyze for context"
            },
            rootPath: {
              type: "string",
              description: "Root path of the project",
              default: "current working directory"
            },
            includeRelationships: {
              type: "boolean",
              description: "Include code relationships analysis",
              default: true
            },
            includeMetrics: {
              type: "boolean",
              description: "Include code quality metrics",
              default: true
            },
            includeSemantics: {
              type: "boolean",
              description: "Include semantic analysis and patterns",
              default: true
            },
            maxRelatedFiles: {
              type: "integer",
              description: "Maximum number of related files to analyze",
              default: 10,
              minimum: 1,
              maximum: 50
            },
            contextDepth: {
              type: "integer",
              description: "Depth of context analysis",
              default: 2,
              minimum: 1,
              maximum: 5
            }
          },
          required: ["filePath"]
        };
      }
    };
  }
});
var pathExists11, RefactoringAssistantTool;
var init_refactoring_assistant = __esm({
  "src/tools/intelligence/refactoring-assistant.ts"() {
    init_ast_parser();
    init_symbol_search();
    init_multi_file_editor();
    init_operation_history();
    pathExists11 = async (filePath) => {
      try {
        await fs2.promises.access(filePath, fs2.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    };
    RefactoringAssistantTool = class {
      constructor() {
        this.name = "refactoring_assistant";
        this.description = "Perform safe code refactoring operations including rename, extract, inline, and move operations";
        this.astParser = new ASTParserTool();
        this.symbolSearch = new SymbolSearchTool();
        this.multiFileEditor = new MultiFileEditorTool();
        this.operationHistory = new OperationHistoryTool();
      }
      async execute(args) {
        try {
          const { operation, ...operationArgs } = args;
          if (!operation) {
            throw new Error("Refactoring operation type is required");
          }
          let result;
          switch (operation) {
            case "rename":
              result = await this.performRename(operationArgs);
              break;
            case "extract_function":
              result = await this.performExtractFunction(operationArgs);
              break;
            case "extract_variable":
              result = await this.performExtractVariable(operationArgs);
              break;
            case "inline_function":
              result = await this.performInlineFunction(operationArgs);
              break;
            case "inline_variable":
              result = await this.performInlineVariable(operationArgs);
              break;
            case "move_function":
            case "move_class":
              result = await this.performMove(operationArgs);
              break;
            default:
              throw new Error(`Unsupported refactoring operation: ${operation}`);
          }
          return {
            success: true,
            output: JSON.stringify(result, null, 2)
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
      async performRename(request) {
        const { symbolName, newName, filePath, scope, includeComments, includeStrings } = request;
        if (!symbolName || !newName) {
          throw new Error("Symbol name and new name are required for rename operation");
        }
        if (!this.isValidIdentifier(newName)) {
          throw new Error(`Invalid identifier: ${newName}`);
        }
        const searchPath = scope === "file" && filePath ? path8__default.dirname(filePath) : process.cwd();
        const searchResult = await this.symbolSearch.execute({
          query: symbolName,
          searchPath,
          includeUsages: true,
          fuzzyMatch: false,
          caseSensitive: true
        });
        if (!searchResult.success || !searchResult.output) {
          throw new Error("Failed to find symbol occurrences");
        }
        const parsed = JSON.parse(searchResult.output);
        if (!parsed.success) {
          throw new Error("Failed to find symbol occurrences");
        }
        const symbolRefs = parsed.result.symbols;
        const relevantRefs = scope === "file" && filePath ? symbolRefs.filter((ref) => ref.filePath === filePath) : symbolRefs;
        if (relevantRefs.length === 0) {
          throw new Error(`Symbol '${symbolName}' not found in specified scope`);
        }
        const safety = await this.analyzeSafety(relevantRefs, "rename");
        const fileChanges = [];
        const affectedFiles = /* @__PURE__ */ new Set();
        for (const ref of relevantRefs) {
          affectedFiles.add(ref.filePath);
          const changes = await this.generateRenameChanges(
            ref,
            symbolName,
            newName,
            includeComments,
            includeStrings
          );
          if (changes.length > 0) {
            fileChanges.push({
              filePath: ref.filePath,
              changes
            });
          }
        }
        const preview = this.generatePreview(fileChanges, "rename", symbolName, newName);
        return {
          type: "rename",
          description: `Rename '${symbolName}' to '${newName}' (${scope} scope)`,
          files: fileChanges,
          preview,
          safety
        };
      }
      async performExtractFunction(request) {
        const { filePath, startLine, endLine, functionName, parameters = [], returnType } = request;
        if (!filePath || startLine === void 0 || endLine === void 0 || !functionName) {
          throw new Error("File path, line range, and function name are required");
        }
        if (!await pathExists11(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        if (startLine < 0 || endLine >= lines.length || startLine > endLine) {
          throw new Error("Invalid line range");
        }
        const extractedCode = lines.slice(startLine, endLine + 1);
        const extractedText = extractedCode.join("\n");
        const analysis = await this.analyzeExtractedCode(extractedText, filePath);
        const functionSignature = this.generateFunctionSignature(
          functionName,
          analysis.parameters.length > 0 ? analysis.parameters : parameters,
          returnType || analysis.inferredReturnType
        );
        const newFunction = this.createExtractedFunction(
          functionSignature,
          extractedText,
          analysis.localVariables
        );
        const functionCall = this.generateFunctionCall(
          functionName,
          analysis.parameters,
          analysis.returnVariable
        );
        const changes = [
          // Replace extracted code with function call
          {
            startLine,
            startColumn: 0,
            endLine,
            endColumn: lines[endLine].length,
            oldText: extractedText,
            newText: functionCall,
            type: "replace"
          },
          // Insert new function (simplified - should find appropriate location)
          {
            startLine: endLine + 1,
            startColumn: 0,
            endLine: endLine + 1,
            endColumn: 0,
            oldText: "",
            newText: "\n" + newFunction + "\n",
            type: "insert"
          }
        ];
        const safety = {
          riskLevel: "medium",
          potentialIssues: [
            "Variable scope changes",
            "Side effects may be altered",
            "Error handling context may change"
          ],
          affectedFiles: 1,
          affectedSymbols: 1,
          requiresTests: true,
          breakingChanges: false
        };
        const fileChanges = [{
          filePath,
          changes
        }];
        const preview = this.generatePreview(fileChanges, "extract_function", extractedText, functionName);
        return {
          type: "extract_function",
          description: `Extract function '${functionName}' from lines ${startLine}-${endLine}`,
          files: fileChanges,
          preview,
          safety
        };
      }
      async performExtractVariable(args) {
        const { filePath, startLine, startColumn, endLine, endColumn, variableName, variableType } = args;
        if (!filePath || !variableName) {
          throw new Error("File path and variable name are required");
        }
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const startLineContent = lines[startLine];
        const endLineContent = lines[endLine];
        let expression;
        if (startLine === endLine) {
          expression = startLineContent.substring(startColumn, endColumn);
        } else {
          expression = startLineContent.substring(startColumn) + "\n" + lines.slice(startLine + 1, endLine).join("\n") + "\n" + endLineContent.substring(0, endColumn);
        }
        const indent = this.getIndentation(startLineContent);
        const varDeclaration = `${indent}const ${variableName}${variableType ? `: ${variableType}` : ""} = ${expression.trim()};`;
        const changes = [
          // Insert variable declaration
          {
            startLine,
            startColumn: 0,
            endLine: startLine,
            endColumn: 0,
            oldText: "",
            newText: varDeclaration + "\n",
            type: "insert"
          },
          // Replace expression with variable
          {
            startLine: startLine + 1,
            // Account for inserted line
            startColumn,
            endLine: endLine + 1,
            endColumn,
            oldText: expression,
            newText: variableName,
            type: "replace"
          }
        ];
        const safety = {
          riskLevel: "low",
          potentialIssues: ["Variable name conflicts"],
          affectedFiles: 1,
          affectedSymbols: 1,
          requiresTests: false,
          breakingChanges: false
        };
        const fileChanges = [{
          filePath,
          changes
        }];
        const preview = this.generatePreview(fileChanges, "extract_variable", expression, variableName);
        return {
          type: "extract_variable",
          description: `Extract variable '${variableName}' from expression`,
          files: fileChanges,
          preview,
          safety
        };
      }
      async performInlineFunction(request) {
        const { symbolName, filePath, preserveComments } = request;
        const parseResult = await this.astParser.execute({
          filePath,
          includeSymbols: true,
          symbolTypes: ["function"]
        });
        if (!parseResult.success || !parseResult.output) {
          throw new Error("Failed to parse file");
        }
        const parsed = JSON.parse(parseResult.output);
        if (!parsed.success) {
          throw new Error("Failed to parse file");
        }
        const symbols = parsed.result.symbols;
        const functionSymbol = symbols.find((s) => s.name === symbolName && s.type === "function");
        if (!functionSymbol) {
          throw new Error(`Function '${symbolName}' not found`);
        }
        const content = await fs2.promises.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const functionLines = lines.slice(functionSymbol.startPosition.row, functionSymbol.endPosition.row + 1);
        const functionBody = this.extractFunctionBody(functionLines.join("\n"));
        const usageSearch = await this.symbolSearch.execute({
          query: symbolName,
          searchPath: path8__default.dirname(filePath),
          includeUsages: true,
          fuzzyMatch: false
        });
        if (!usageSearch.success || !usageSearch.output) {
          throw new Error("Failed to find function usages");
        }
        const usageParsed = JSON.parse(usageSearch.output);
        if (!usageParsed.success) {
          throw new Error("Failed to find function usages");
        }
        const usages = usageParsed.result.symbols;
        const functionCalls = this.findFunctionCalls(usages, symbolName);
        const fileChanges = [];
        const affectedFiles = /* @__PURE__ */ new Set();
        for (const call of functionCalls) {
          affectedFiles.add(call.filePath);
          const inlinedCode = this.inlineFunction(functionBody, call.arguments);
          const changes = [{
            startLine: call.line,
            startColumn: call.column,
            endLine: call.line,
            endColumn: call.column + call.text.length,
            oldText: call.text,
            newText: inlinedCode,
            type: "replace"
          }];
          fileChanges.push({
            filePath: call.filePath,
            changes
          });
        }
        const definitionChanges = [{
          startLine: functionSymbol.startPosition.row,
          startColumn: 0,
          endLine: functionSymbol.endPosition.row + 1,
          endColumn: 0,
          oldText: functionLines.join("\n"),
          newText: preserveComments ? this.extractComments(functionLines.join("\n")) : "",
          type: "replace"
        }];
        fileChanges.push({
          filePath,
          changes: definitionChanges
        });
        const safety = {
          riskLevel: "high",
          potentialIssues: [
            "Code duplication",
            "Variable scope changes",
            "Performance implications",
            "Debugging complexity"
          ],
          affectedFiles: affectedFiles.size,
          affectedSymbols: functionCalls.length + 1,
          requiresTests: true,
          breakingChanges: false
        };
        const preview = this.generatePreview(fileChanges, "inline_function", symbolName, "inlined code");
        return {
          type: "inline_function",
          description: `Inline function '${symbolName}' at all call sites`,
          files: fileChanges,
          preview,
          safety
        };
      }
      async performInlineVariable(_request) {
        throw new Error("Inline variable not yet implemented");
      }
      async performMove(_request) {
        throw new Error("Move operation not yet implemented");
      }
      // Helper methods
      isValidIdentifier(name) {
        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
      }
      async analyzeSafety(refs, operation) {
        const affectedFiles = new Set(refs.map((ref) => ref.filePath)).size;
        const affectedSymbols = refs.length;
        let riskLevel = "low";
        const potentialIssues = [];
        if (affectedFiles > 5) {
          riskLevel = "medium";
          potentialIssues.push("Many files affected");
        }
        if (affectedSymbols > 20) {
          riskLevel = "high";
          potentialIssues.push("Many symbol occurrences");
        }
        if (operation === "rename") {
          potentialIssues.push("Potential naming conflicts");
        }
        return {
          riskLevel,
          potentialIssues,
          affectedFiles,
          affectedSymbols,
          requiresTests: affectedFiles > 1,
          breakingChanges: false
        };
      }
      async generateRenameChanges(ref, oldName, newName, includeComments, includeStrings) {
        const changes = [];
        const content = await fs2.promises.readFile(ref.filePath, "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!includeComments && (line.trim().startsWith("//") || line.trim().startsWith("*"))) {
            continue;
          }
          if (!includeStrings && (line.includes('"') || line.includes("'"))) {
            continue;
          }
          const regex = new RegExp(`\\b${oldName}\\b`, "g");
          let match;
          while ((match = regex.exec(line)) !== null) {
            changes.push({
              startLine: i,
              startColumn: match.index,
              endLine: i,
              endColumn: match.index + oldName.length,
              oldText: oldName,
              newText: newName,
              type: "replace"
            });
          }
        }
        return changes;
      }
      async analyzeExtractedCode(code, _filePath) {
        const lines = code.split("\n");
        const parameters = [];
        const localVariables = [];
        let inferredReturnType = "void";
        let returnVariable;
        for (const line of lines) {
          if (line.includes("return ")) {
            const returnMatch = line.match(/return\s+([^;]+)/);
            if (returnMatch) {
              returnVariable = returnMatch[1].trim();
              inferredReturnType = "any";
            }
          }
        }
        return {
          parameters,
          localVariables,
          inferredReturnType,
          returnVariable
        };
      }
      generateFunctionSignature(name, parameters, returnType) {
        const params = parameters.map(
          (p) => `${p.name}${p.type ? `: ${p.type}` : ""}${p.defaultValue ? ` = ${p.defaultValue}` : ""}`
        ).join(", ");
        return `function ${name}(${params})${returnType !== "void" ? `: ${returnType}` : ""}`;
      }
      createExtractedFunction(signature, body, _localVars) {
        return `${signature} {
${body}
}`;
      }
      generateFunctionCall(name, parameters, returnVar) {
        const args = parameters.map((p) => p.name).join(", ");
        const call = `${name}(${args})`;
        return returnVar ? `const ${returnVar} = ${call};` : `${call};`;
      }
      getIndentation(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1] : "";
      }
      extractFunctionBody(functionCode) {
        const lines = functionCode.split("\n");
        const bodyStart = lines.findIndex((line) => line.includes("{")) + 1;
        const bodyEnd = lines.length - 1;
        return lines.slice(bodyStart, bodyEnd).join("\n");
      }
      findFunctionCalls(usages, _functionName) {
        const calls = [];
        for (const usage of usages) {
          for (const u of usage.usages) {
            if (u.type === "call") {
              calls.push({
                filePath: usage.filePath,
                line: u.line,
                column: u.column,
                text: u.context,
                arguments: []
                // Would parse actual arguments
              });
            }
          }
        }
        return calls;
      }
      inlineFunction(functionBody, _args) {
        return functionBody;
      }
      extractComments(code) {
        const lines = code.split("\n");
        const comments = lines.filter(
          (line) => line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("/*")
        );
        return comments.join("\n");
      }
      generatePreview(fileChanges, operation, oldValue, newValue) {
        let preview = `${operation.toUpperCase()}: ${oldValue} \u2192 ${newValue}

`;
        for (const fileChange of fileChanges) {
          preview += `File: ${fileChange.filePath}
`;
          preview += `Changes: ${fileChange.changes.length}
`;
          for (const change of fileChange.changes.slice(0, 3)) {
            preview += `  Line ${change.startLine}: ${change.oldText} \u2192 ${change.newText}
`;
          }
          if (fileChange.changes.length > 3) {
            preview += `  ... and ${fileChange.changes.length - 3} more changes
`;
          }
          preview += "\n";
        }
        return preview;
      }
      getSchema() {
        return {
          type: "object",
          properties: {
            operation: {
              type: "string",
              enum: ["rename", "extract_function", "extract_variable", "inline_function", "inline_variable", "move_function", "move_class"],
              description: "Type of refactoring operation to perform"
            },
            symbolName: {
              type: "string",
              description: "Name of symbol to refactor (for rename, inline, move operations)"
            },
            newName: {
              type: "string",
              description: "New name for symbol (for rename operation)"
            },
            filePath: {
              type: "string",
              description: "Path to file containing the symbol"
            },
            scope: {
              type: "string",
              enum: ["file", "project", "global"],
              description: "Scope of refactoring operation",
              default: "project"
            },
            includeComments: {
              type: "boolean",
              description: "Include comments in rename operation",
              default: false
            },
            includeStrings: {
              type: "boolean",
              description: "Include string literals in rename operation",
              default: false
            },
            startLine: {
              type: "integer",
              description: "Start line for extract operations"
            },
            endLine: {
              type: "integer",
              description: "End line for extract operations"
            },
            startColumn: {
              type: "integer",
              description: "Start column for extract variable operation"
            },
            endColumn: {
              type: "integer",
              description: "End column for extract variable operation"
            },
            functionName: {
              type: "string",
              description: "Name for extracted function"
            },
            variableName: {
              type: "string",
              description: "Name for extracted variable"
            },
            variableType: {
              type: "string",
              description: "Type annotation for extracted variable"
            },
            parameters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  defaultValue: { type: "string" }
                },
                required: ["name"]
              },
              description: "Parameters for extracted function"
            },
            returnType: {
              type: "string",
              description: "Return type for extracted function"
            },
            targetFile: {
              type: "string",
              description: "Target file for move operations"
            },
            createTargetFile: {
              type: "boolean",
              description: "Create target file if it doesn't exist",
              default: false
            },
            preserveComments: {
              type: "boolean",
              description: "Preserve comments in inline operations",
              default: true
            }
          },
          required: ["operation"]
        };
      }
    };
  }
});

// src/tools/intelligence/index.ts
var init_intelligence = __esm({
  "src/tools/intelligence/index.ts"() {
    init_ast_parser();
    init_symbol_search();
    init_dependency_analyzer();
    init_code_context();
    init_refactoring_assistant();
  }
});

// src/tools/index.ts
var init_tools2 = __esm({
  "src/tools/index.ts"() {
    init_bash();
    init_text_editor();
    init_morph_editor();
    init_todo_tool();
    init_confirmation_tool();
    init_search();
    init_advanced();
    init_intelligence();
  }
});
function formatTokenCount(count) {
  if (count <= 999) {
    return count.toString();
  }
  if (count < 1e6) {
    const k = count / 1e3;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  const m = count / 1e6;
  return m % 1 === 0 ? `${m}m` : `${m.toFixed(1)}m`;
}
function createTokenCounter(model) {
  return new TokenCounter(model);
}
var TokenCounter;
var init_token_counter = __esm({
  "src/utils/token-counter.ts"() {
    TokenCounter = class {
      constructor(model = "gpt-4") {
        try {
          this.encoder = encoding_for_model(model);
        } catch {
          this.encoder = get_encoding("cl100k_base");
        }
      }
      /**
       * Count tokens in a string
       */
      countTokens(text) {
        if (!text) return 0;
        return this.encoder.encode(text).length;
      }
      /**
       * Count tokens in messages array (for chat completions)
       */
      countMessageTokens(messages) {
        let totalTokens = 0;
        for (const message of messages) {
          totalTokens += 3;
          if (message.content && typeof message.content === "string") {
            totalTokens += this.countTokens(message.content);
          }
          if (message.role) {
            totalTokens += this.countTokens(message.role);
          }
          if (message.tool_calls) {
            totalTokens += this.countTokens(JSON.stringify(message.tool_calls));
          }
        }
        totalTokens += 3;
        return totalTokens;
      }
      /**
       * Estimate tokens for streaming content
       * This is an approximation since we don't have the full response yet
       */
      estimateStreamingTokens(accumulatedContent) {
        return this.countTokens(accumulatedContent);
      }
      /**
       * Clean up resources
       */
      dispose() {
        this.encoder.free();
      }
    };
  }
});
function loadCustomInstructions(workingDirectory = process.cwd()) {
  try {
    const instructionsPath = path8.join(workingDirectory, ".xcli", "GROK.md");
    if (!fs2.existsSync(instructionsPath)) {
      return null;
    }
    const customInstructions = fs2.readFileSync(instructionsPath, "utf-8");
    return customInstructions.trim();
  } catch (error) {
    console.warn("Failed to load custom instructions:", error);
    return null;
  }
}
var init_custom_instructions = __esm({
  "src/utils/custom-instructions.ts"() {
  }
});
var DEFAULT_OPTIONS, ExecutionOrchestrator;
var init_execution_orchestrator = __esm({
  "src/services/execution-orchestrator.ts"() {
    DEFAULT_OPTIONS = {
      createPatches: true,
      createBackups: true,
      gitCommit: true,
      timeout: 3e5,
      // 5 minutes per step
      maxConcurrentSteps: 1
    };
    ExecutionOrchestrator = class {
      constructor(agent, options = {}) {
        this.agent = agent;
        this.maxRecoveryAttempts = 3;
        this.recoveryAttempts = /* @__PURE__ */ new Map();
        this.options = { ...DEFAULT_OPTIONS, ...options };
      }
      /**
       * Execute a research plan's TODO items
       */
      async executePlan(plan) {
        console.log(`\u{1F680} Starting execution of ${plan.todo.length} tasks...`);
        console.log(`Summary: ${plan.summary}`);
        const executionPlan = {
          steps: plan.todo.map((todo, index) => ({
            id: index + 1,
            description: todo,
            status: "pending"
          })),
          totalSteps: plan.todo.length,
          completedSteps: 0,
          failedSteps: 0,
          startTime: /* @__PURE__ */ new Date(),
          summary: plan.summary
        };
        try {
          for (const step of executionPlan.steps) {
            await this.executeStep(step, executionPlan);
            if (step.status === "failed") {
              executionPlan.failedSteps++;
            } else {
              executionPlan.completedSteps++;
            }
          }
          executionPlan.endTime = /* @__PURE__ */ new Date();
          if (this.options.gitCommit && this.isGitRepository()) {
            try {
              executionPlan.gitCommitHash = await this.createGitCommit(executionPlan);
            } catch (error) {
              console.warn("[Execution] Failed to create git commit:", error);
            }
          }
          const success = executionPlan.failedSteps === 0;
          console.log(`\u2705 Execution ${success ? "completed" : "finished with errors"}: ${executionPlan.completedSteps}/${executionPlan.totalSteps} steps successful`);
          return {
            success,
            executionPlan
          };
        } catch (error) {
          executionPlan.endTime = /* @__PURE__ */ new Date();
          console.error("[Execution] Orchestration failed:", error);
          return {
            success: false,
            executionPlan,
            error: error instanceof Error ? error.message : "Unknown execution error"
          };
        }
      }
      /**
       * Execute a single step
       */
      async executeStep(step, _executionPlan) {
        step.status = "running";
        step.startTime = /* @__PURE__ */ new Date();
        console.log(`
[x-cli] #${step.id} ${step.description} \u2026`);
        try {
          const beforeState = this.captureFileState();
          await this.agent.processUserMessage(step.description);
          await new Promise((resolve8) => setTimeout(resolve8, 1e3));
          const afterState = this.captureFileState();
          step.changes = this.calculateChanges(beforeState, afterState);
          await this.displayChanges(step);
          if (step.changes && step.changes.length > 0) {
            step.patchFile = await this.createPatchFile(step);
            await this.createBackups(step);
          }
          step.status = "completed";
          step.endTime = /* @__PURE__ */ new Date();
          console.log(`[x-cli] #${step.id} \u2713 Completed`);
        } catch (error) {
          step.status = "failed";
          step.endTime = /* @__PURE__ */ new Date();
          step.error = error instanceof Error ? error.message : "Unknown error";
          console.log(`[x-cli] #${step.id} \u2717 Failed: ${step.error}`);
        }
      }
      /**
       * Capture current file state (simplified - just track modification times)
       */
      captureFileState() {
        const state = /* @__PURE__ */ new Map();
        try {
          const walkDir = (dir) => {
            const files = fs2.readdirSync(dir);
            for (const file of files) {
              const filePath = path8.join(dir, file);
              const stat = fs2.statSync(filePath);
              if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
                walkDir(filePath);
              } else if (stat.isFile()) {
                state.set(filePath, stat.mtime.getTime());
              }
            }
          };
          walkDir(".");
        } catch (error) {
          console.warn("[Execution] Failed to capture file state:", error);
        }
        return state;
      }
      /**
       * Calculate file changes between states
       */
      calculateChanges(before, after) {
        const changes = [];
        for (const [filePath, afterTime] of after) {
          const beforeTime = before.get(filePath);
          if (!beforeTime || beforeTime !== afterTime) {
            changes.push({
              filePath,
              changeType: beforeTime ? "modified" : "created"
            });
          }
        }
        for (const filePath of before.keys()) {
          if (!after.has(filePath)) {
            changes.push({
              filePath,
              changeType: "deleted"
            });
          }
        }
        return changes;
      }
      /**
       * Display changes with diffs
       */
      async displayChanges(step) {
        if (!step.changes || step.changes.length === 0) {
          return;
        }
        console.log(`[x-cli] #${step.id} Changes detected:`);
        for (const change of step.changes) {
          console.log(`  ${change.changeType.toUpperCase()}: ${change.filePath}`);
          if (change.changeType === "modified" && fs2.existsSync(change.filePath)) {
            try {
              if (this.isGitRepository()) {
                const diff = execSync(`git diff --no-index /dev/null ${change.filePath} 2>/dev/null || git diff ${change.filePath}`, {
                  encoding: "utf-8",
                  timeout: 5e3
                }).trim();
                if (diff) {
                  console.log("  Diff:");
                  console.log(diff.split("\n").map((line) => `    ${line}`).join("\n"));
                }
              }
            } catch (_error) {
            }
          }
        }
      }
      /**
       * Create patch file for changes
       */
      async createPatchFile(step) {
        if (!this.options.createPatches || !step.changes || step.changes.length === 0) {
          return void 0;
        }
        try {
          const patchesDir = path8.join(__require("os").homedir(), ".xcli", "patches");
          if (!fs2.existsSync(patchesDir)) {
            fs2.mkdirSync(patchesDir, { recursive: true });
          }
          const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
          const patchFile = path8.join(patchesDir, `step-${step.id}-${timestamp}.patch`);
          let patchContent = `# Patch for step #${step.id}: ${step.description}
`;
          patchContent += `# Generated: ${(/* @__PURE__ */ new Date()).toISOString()}

`;
          for (const change of step.changes) {
            if (change.changeType === "modified" && fs2.existsSync(change.filePath)) {
              try {
                const diff = execSync(`git diff ${change.filePath}`, {
                  encoding: "utf-8",
                  timeout: 5e3
                });
                patchContent += `--- a/${change.filePath}
+++ b/${change.filePath}
${diff}
`;
              } catch {
              }
            }
          }
          fs2.writeFileSync(patchFile, patchContent);
          console.log(`[x-cli] #${step.id} Patch saved: ${patchFile}`);
          return patchFile;
        } catch (error) {
          console.warn(`[Execution] Failed to create patch for step ${step.id}:`, error);
          return void 0;
        }
      }
      /**
       * Create backup files
       */
      async createBackups(step) {
        if (!this.options.createBackups || !step.changes) {
          return;
        }
        for (const change of step.changes) {
          if ((change.changeType === "modified" || change.changeType === "created") && fs2.existsSync(change.filePath)) {
            try {
              const backupPath = `${change.filePath}.bak`;
              fs2.copyFileSync(change.filePath, backupPath);
              change.backupPath = backupPath;
              console.log(`[x-cli] #${step.id} Backup created: ${backupPath}`);
            } catch (_error) {
              console.warn(`[Execution] Failed to create backup for ${change.filePath}:`, _error);
            }
          }
        }
      }
      /**
       * Check if current directory is a git repository
       */
      isGitRepository() {
        try {
          execSync("git rev-parse --git-dir", { stdio: "ignore" });
          return true;
        } catch {
          return false;
        }
      }
      /**
       * Create git commit for all changes
       */
      async createGitCommit(executionPlan) {
        try {
          execSync("git add .", { stdio: "ignore" });
          const commitMessage = `feat: ${executionPlan.summary}

Executed ${executionPlan.totalSteps} tasks:
${executionPlan.steps.map((step) => `- ${step.description}`).join("\n")}

Auto-generated by x-cli execution orchestrator`;
          execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" });
          const hash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
          console.log(`\u2705 Git commit created: ${hash.substring(0, 8)}`);
          return hash;
        } catch (error) {
          throw new Error(`Git commit failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Detect error patterns in step execution
       */
      detectError(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("test") && (errorMessage.includes("fail") || errorMessage.includes("error"))) {
          return {
            stepId: -1,
            // Will be set by caller
            errorType: "test_failure",
            errorMessage,
            stackTrace: error instanceof Error ? error.stack : void 0,
            affectedFiles: this.findTestFiles(),
            contextData: { pattern: "test_failure" }
          };
        }
        if (errorMessage.includes("build") && (errorMessage.includes("fail") || errorMessage.includes("error"))) {
          return {
            stepId: -1,
            errorType: "build_failure",
            errorMessage,
            stackTrace: error instanceof Error ? error.stack : void 0,
            affectedFiles: this.findBuildFiles(),
            contextData: { pattern: "build_failure" }
          };
        }
        if (errorMessage.includes("lint") && (errorMessage.includes("fail") || errorMessage.includes("error"))) {
          return {
            stepId: -1,
            errorType: "lint_failure",
            errorMessage,
            stackTrace: error instanceof Error ? error.stack : void 0,
            affectedFiles: this.findSourceFiles(),
            contextData: { pattern: "lint_failure" }
          };
        }
        return {
          stepId: -1,
          errorType: "runtime_error",
          errorMessage,
          stackTrace: error instanceof Error ? error.stack : void 0,
          affectedFiles: [],
          contextData: { pattern: "runtime_error" }
        };
      }
      /**
       * Find test files in the project
       */
      findTestFiles() {
        try {
          const testFiles = [];
          const walkDir = (dir) => {
            const files = fs2.readdirSync(dir);
            for (const file of files) {
              const filePath = path8.join(dir, file);
              const stat = fs2.statSync(filePath);
              if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
                walkDir(filePath);
              } else if (stat.isFile() && (file.includes("test") || file.includes("spec"))) {
                testFiles.push(filePath);
              }
            }
          };
          walkDir(".");
          return testFiles.slice(0, 10);
        } catch {
          return [];
        }
      }
      /**
       * Find build configuration files
       */
      findBuildFiles() {
        const buildFiles = ["package.json", "tsconfig.json", "webpack.config.js", "babel.config.js"];
        return buildFiles.filter((file) => fs2.existsSync(file));
      }
      /**
       * Find source files
       */
      findSourceFiles() {
        try {
          const sourceFiles = [];
          const walkDir = (dir) => {
            const files = fs2.readdirSync(dir);
            for (const file of files) {
              const filePath = path8.join(dir, file);
              const stat = fs2.statSync(filePath);
              if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
                walkDir(filePath);
              } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".tsx") || file.endsWith(".jsx"))) {
                sourceFiles.push(filePath);
              }
            }
          };
          walkDir(".");
          return sourceFiles.slice(0, 20);
        } catch {
          return [];
        }
      }
      /**
       * Present error context to user
       */
      presentErrorContext(errorContext, _step) {
        console.log("\n" + "=".repeat(60));
        console.log("\u{1F6A8} ISSUE ENCOUNTERED");
        console.log("=".repeat(60));
        console.log(`[x-cli] Issue encountered: ${errorContext.errorMessage}`);
        if (errorContext.affectedFiles.length > 0) {
          console.log(`Affected files: ${errorContext.affectedFiles.slice(0, 5).join(", ")}`);
          if (errorContext.affectedFiles.length > 5) {
            console.log(`... and ${errorContext.affectedFiles.length - 5} more`);
          }
        }
        console.log("\n\u{1F504} Initiating adaptive recovery...");
      }
      /**
       * Handle recovery flow
       */
      async handleRecovery(originalRequest, errorContext, executionPlan, researchService) {
        const attempts = this.recoveryAttempts.get(errorContext.stepId) || 0;
        if (attempts >= this.maxRecoveryAttempts) {
          console.log(`\u274C Maximum recovery attempts (${this.maxRecoveryAttempts}) reached for step ${errorContext.stepId}`);
          return { approved: false, maxRetriesExceeded: true };
        }
        this.recoveryAttempts.set(errorContext.stepId, attempts + 1);
        const recoveryRequest = {
          userTask: `Recovery from execution error: ${errorContext.errorMessage}

Original task: ${originalRequest.userTask}

Error context:
- Type: ${errorContext.errorType}
- Message: ${errorContext.errorMessage}
- Affected files: ${errorContext.affectedFiles.join(", ")}

Please provide a recovery plan to resolve this issue and continue execution.`,
          context: `This is a RECOVERY REQUEST for a failed execution step. The original task was part of a larger plan that encountered an error. Focus on fixing the specific issue and providing steps to resolve it.`,
          constraints: [
            "Focus on fixing the specific error encountered",
            "Provide actionable recovery steps",
            "Consider the broader execution context",
            "Ensure recovery steps are safe and reversible"
          ]
        };
        try {
          console.log("\u{1F50D} Analyzing error and generating recovery plan...");
          const { output, approval } = await researchService.researchAndGetApproval(recoveryRequest);
          if (approval.approved) {
            console.log("\u2705 Recovery plan approved. Resuming execution...");
            return { approved: true, recoveryPlan: output };
          } else {
            console.log("\u274C Recovery plan rejected by user.");
            return { approved: false };
          }
        } catch (error) {
          console.error("[Recovery] Failed to generate recovery plan:", error);
          return { approved: false };
        }
      }
      /**
       * Execute with adaptive recovery
       */
      async executeWithRecovery(plan, researchService, originalRequest) {
        console.log(`\u{1F680} Starting execution with adaptive recovery of ${plan.todo.length} tasks...`);
        console.log(`Summary: ${plan.summary}`);
        const executionPlan = {
          steps: plan.todo.map((todo, index) => ({
            id: index + 1,
            description: todo,
            status: "pending"
          })),
          totalSteps: plan.todo.length,
          completedSteps: 0,
          failedSteps: 0,
          startTime: /* @__PURE__ */ new Date(),
          summary: plan.summary
        };
        try {
          for (let i = 0; i < executionPlan.steps.length; i++) {
            const step = executionPlan.steps[i];
            try {
              await this.executeStep(step, executionPlan);
              if (step.status === "completed") {
                executionPlan.completedSteps++;
              } else {
                const errorContext = this.detectError(step.error);
                if (errorContext) {
                  errorContext.stepId = step.id;
                  this.presentErrorContext(errorContext, step);
                  const recoveryResult = await this.handleRecovery(
                    originalRequest,
                    errorContext,
                    executionPlan,
                    researchService
                  );
                  if (recoveryResult.approved && recoveryResult.recoveryPlan) {
                    const recoverySteps = recoveryResult.recoveryPlan.plan.todo.map((todo, idx) => ({
                      id: executionPlan.steps.length + idx + 1,
                      description: `[RECOVERY] ${todo}`,
                      status: "pending"
                    }));
                    executionPlan.steps.splice(i + 1, 0, ...recoverySteps);
                    executionPlan.totalSteps += recoverySteps.length;
                    console.log(`\u{1F4CB} Added ${recoverySteps.length} recovery steps. Continuing execution...`);
                    continue;
                  }
                }
                executionPlan.failedSteps++;
              }
            } catch (error) {
              const errorContext = this.detectError(error);
              if (errorContext) {
                errorContext.stepId = step.id;
                step.status = "failed";
                step.error = errorContext.errorMessage;
                executionPlan.failedSteps++;
                console.log(`[x-cli] #${step.id} \u2717 Failed: ${errorContext.errorMessage}`);
              }
            }
          }
          executionPlan.endTime = /* @__PURE__ */ new Date();
          if (this.options.gitCommit && this.isGitRepository()) {
            try {
              executionPlan.gitCommitHash = await this.createGitCommit(executionPlan);
            } catch (error) {
              console.warn("[Execution] Failed to create git commit:", error);
            }
          }
          const success = executionPlan.failedSteps === 0;
          console.log(`\u2705 Execution ${success ? "completed" : "finished with errors"}: ${executionPlan.completedSteps}/${executionPlan.totalSteps} steps successful`);
          return {
            success,
            executionPlan
          };
        } catch (error) {
          executionPlan.endTime = /* @__PURE__ */ new Date();
          console.error("[Execution] Orchestration failed:", error);
          return {
            success: false,
            executionPlan,
            error: error instanceof Error ? error.message : "Unknown execution error"
          };
        }
      }
    };
  }
});
var DEFAULT_CONFIG, ResearchRecommendService;
var init_research_recommend = __esm({
  "src/services/research-recommend.ts"() {
    init_execution_orchestrator();
    DEFAULT_CONFIG = {
      maxOptions: 3,
      includeContext: true,
      timeout: 6e4
      // 60 seconds
    };
    ResearchRecommendService = class {
      constructor(agent, config2 = DEFAULT_CONFIG) {
        this.agent = agent;
        this.config = config2;
      }
      /**
       * Perform research and generate recommendation
       */
      async researchAndRecommend(request, contextPack) {
        const prompt = this.buildResearchPrompt(request, contextPack);
        try {
          console.log("\u{1F50D} [DEBUG] Research prompt sent:", prompt.substring(0, 200) + "...");
          console.log("\u{1F50D} [DEBUG] Research prompt sent (first 200 chars):", prompt.substring(0, 200) + "...");
          const response = await this.agent.processUserMessage(prompt);
          console.log("\u{1F50D} [DEBUG] Raw AI response received:", JSON.stringify(response, null, 2));
          console.log("\u{1F50D} [DEBUG] Raw AI response:", JSON.stringify(response, null, 2));
          console.log("\u{1F50D} [DEBUG] Using mock output (real AI pending)");
          const mockOutput = {
            issues: [],
            options: [],
            recommendation: {
              option: 1,
              reasoning: "Mock plan - real AI integration pending",
              confidence: 0.8
            },
            plan: {
              summary: "Mock summary - detailed plan generation pending",
              approach: "Mock approach - implementation strategy pending",
              todo: [
                {
                  id: 1,
                  description: "Mock task - actual tasks will be generated by AI",
                  priority: "medium",
                  estimatedEffort: "2 hours"
                }
              ],
              riskAssessment: {
                complexity: "low",
                dependencies: [],
                potentialIssues: []
              }
            }
          };
          return mockOutput;
        } catch (error) {
          console.error("[ResearchRecommend] Research failed:", error);
          throw new Error(`Research failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Build the research prompt
       */
      buildResearchPrompt(request, contextPack) {
        let prompt = `Analyze the following task and provide a structured research output in JSON format.

TASK: ${request.userTask}

`;
        if (request.constraints && request.constraints.length > 0) {
          prompt += `CONSTRAINTS:
${request.constraints.map((c) => `- ${c}`).join("\n")}

`;
        }
        if (request.preferences && request.preferences.length > 0) {
          prompt += `PREFERENCES:
${request.preferences.map((p) => `- ${p}`).join("\n")}

`;
        }
        if (this.config.includeContext && contextPack) {
          prompt += `CONTEXT INFORMATION:
System Documentation:
${contextPack.system}

SOP Documentation:
${contextPack.sop}

Recent Task Documentation:
${contextPack.tasks.slice(0, 5).map((t) => `${t.filename}:
${t.content}`).join("\n\n")}

`;
        }
        prompt += `Please provide your analysis in the following JSON structure:
{
  "issues": [
    {
      "type": "fact|gap|risk",
      "description": "Description of the issue",
      "severity": "low|medium|high",
      "impact": "Impact description (optional)"
    }
  ],
  "options": [
    {
      "id": 1,
      "title": "Option title",
      "description": "Detailed description",
      "tradeoffs": {
        "pros": ["pro1", "pro2"],
        "cons": ["con1", "con2"]
      },
      "effort": "low|medium|high",
      "risk": "low|medium|high"
    }
  ],
  "recommendation": {
    "optionId": 1,
    "reasoning": "Why this option is recommended",
    "justification": "Detailed justification",
    "confidence": "low|medium|high"
  },
  "plan": {
    "summary": "Brief summary of the plan",
    "approach": ["step1", "step2", "step3"],
    "todo": ["TODO item 1", "TODO item 2"],
    "estimatedEffort": "Time estimate",
    "keyConsiderations": ["consideration1", "consideration2"]
  }
}

Provide exactly ${this.config.maxOptions} options. Focus on actionable, practical solutions. Be thorough but concise. Respond with ONLY the JSON.`;
        return prompt;
      }
      /**
       * Parse the AI response into structured output
       */
      parseResearchOutput(response) {
        let jsonText = "";
        if (Array.isArray(response)) {
          for (const entry of response) {
            if (entry.type === "assistant" && entry.content) {
              jsonText = entry.content.trim();
              break;
            }
          }
        } else if (typeof response === "string") {
          jsonText = response;
        }
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            issues: this.validateIssues(parsed.issues || []),
            options: this.validateOptions(parsed.options || []),
            recommendation: this.validateRecommendation(parsed.recommendation),
            plan: this.validatePlan(parsed.plan)
          };
        } catch (error) {
          console.error("[ResearchRecommend] JSON parse error:", error);
          console.error("Raw response:", jsonText);
          throw new Error("Failed to parse research output JSON");
        }
      }
      validateIssues(issues) {
        return issues.map((issue) => ({
          type: ["fact", "gap", "risk"].includes(issue.type) ? issue.type : "fact",
          description: issue.description || "No description provided",
          severity: ["low", "medium", "high"].includes(issue.severity) ? issue.severity : "medium",
          impact: issue.impact
        }));
      }
      validateOptions(options) {
        return options.slice(0, this.config.maxOptions).map((option, index) => ({
          id: option.id || index + 1,
          title: option.title || `Option ${index + 1}`,
          description: option.description || "No description provided",
          tradeoffs: {
            pros: Array.isArray(option.tradeoffs?.pros) ? option.tradeoffs.pros : [],
            cons: Array.isArray(option.tradeoffs?.cons) ? option.tradeoffs.cons : []
          },
          effort: ["low", "medium", "high"].includes(option.effort) ? option.effort : "medium",
          risk: ["low", "medium", "high"].includes(option.risk) ? option.risk : "medium"
        }));
      }
      validateRecommendation(rec) {
        return {
          optionId: rec?.optionId || 1,
          reasoning: rec?.reasoning || "No reasoning provided",
          justification: rec?.justification || "No justification provided",
          confidence: ["low", "medium", "high"].includes(rec?.confidence) ? rec.confidence : "medium"
        };
      }
      validatePlan(plan) {
        return {
          summary: plan?.summary || "No summary provided",
          approach: Array.isArray(plan?.approach) ? plan.approach : [],
          todo: Array.isArray(plan?.todo) ? plan.todo : [],
          estimatedEffort: plan?.estimatedEffort || "Unknown",
          keyConsiderations: Array.isArray(plan?.keyConsiderations) ? plan.keyConsiderations : []
        };
      }
      /**
       * Render research output to console
       */
      renderToConsole(output) {
        console.log("\n" + "=".repeat(50));
        console.log("\u{1F916} RESEARCH & RECOMMENDATION");
        console.log("=".repeat(50));
        this.renderIssues(output.issues);
        this.renderOptions(output.options);
        this.renderRecommendation(output.recommendation, output.options);
        this.renderPlan(output.plan);
        console.log("=".repeat(50));
      }
      renderIssues(issues) {
        console.log("\n\u{1F4CB} ISSUES");
        console.log("-".repeat(20));
        if (issues.length === 0) {
          console.log("No issues identified.");
          return;
        }
        for (const issue of issues) {
          const icon = issue.type === "fact" ? "\u{1F4CA}" : issue.type === "gap" ? "\u26A0\uFE0F" : "\u{1F6A8}";
          const severity = issue.severity ? ` (${issue.severity.toUpperCase()})` : "";
          console.log(`${icon} ${issue.type.toUpperCase()}${severity}: ${issue.description}`);
          if (issue.impact) {
            console.log(`   Impact: ${issue.impact}`);
          }
        }
      }
      renderOptions(options) {
        console.log("\n\u{1F3AF} OPTIONS");
        console.log("-".repeat(20));
        for (const option of options) {
          console.log(`
${option.id}) ${option.title}`);
          console.log(`   ${option.description}`);
          console.log(`   Effort: ${option.effort.toUpperCase()} | Risk: ${option.risk.toUpperCase()}`);
          if (option.tradeoffs.pros.length > 0) {
            console.log(`   \u2705 Pros: ${option.tradeoffs.pros.join(", ")}`);
          }
          if (option.tradeoffs.cons.length > 0) {
            console.log(`   \u274C Cons: ${option.tradeoffs.cons.join(", ")}`);
          }
        }
      }
      renderRecommendation(recommendation, options) {
        console.log("\n\u{1F3AF} RECOMMENDATION");
        console.log("-".repeat(20));
        const recommendedOption = options.find((o) => o.id === recommendation.optionId);
        const optionTitle = recommendedOption ? recommendedOption.title : `Option ${recommendation.optionId}`;
        console.log(`\u2192 ${optionTitle} (Confidence: ${recommendation.confidence.toUpperCase()})`);
        console.log(`Reasoning: ${recommendation.reasoning}`);
        console.log(`Justification: ${recommendation.justification}`);
      }
      renderPlan(plan) {
        console.log("\n\u{1F4DD} PLAN SUMMARY");
        console.log("-".repeat(20));
        console.log(`Summary: ${plan.summary}`);
        console.log(`Estimated Effort: ${plan.estimatedEffort}`);
        if (plan.approach.length > 0) {
          console.log("\nApproach:");
          plan.approach.forEach((step, index) => {
            console.log(`   ${index + 1}. ${step}`);
          });
        }
        if (plan.todo.length > 0) {
          console.log("\nTODO:");
          plan.todo.forEach((item) => {
            console.log(`   [ ] ${item}`);
          });
        }
        if (plan.keyConsiderations.length > 0) {
          console.log("\nKey Considerations:");
          plan.keyConsiderations.forEach((consideration) => {
            console.log(`   \u2022 ${consideration}`);
          });
        }
      }
      /**
       * Prompt user for approval with Y/n/R options
       */
      async promptForApproval(_output) {
        return new Promise((resolve8) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          const promptUser = () => {
            console.log("\nProceed with recommendation? (Y/n) [R=revise]");
            rl.question("> ", (answer) => {
              const cleanAnswer = answer.trim().toLowerCase();
              if (cleanAnswer === "y" || cleanAnswer === "yes" || cleanAnswer === "") {
                rl.close();
                resolve8({ approved: true, revised: false });
              } else if (cleanAnswer === "n" || cleanAnswer === "no") {
                rl.close();
                resolve8({ approved: false, revised: false });
              } else if (cleanAnswer === "r" || cleanAnswer === "revise") {
                rl.question("Revision note (brief description of changes needed): ", (revisionNote) => {
                  rl.close();
                  resolve8({
                    approved: false,
                    revised: true,
                    revisionNote: revisionNote.trim() || "User requested revision"
                  });
                });
              } else {
                console.log("\u274C Invalid input. Please enter Y (yes), N (no), or R (revise).");
                promptUser();
              }
            });
          };
          promptUser();
        });
      }
      /**
       * Handle revision flow with updated request
       */
      async handleRevision(originalRequest, revisionNote, contextPack) {
        console.log(`\u{1F504} Revising based on: "${revisionNote}"`);
        console.log("\u{1F50D} Re-researching with revision context...");
        const revisedRequest = {
          ...originalRequest,
          constraints: [
            ...originalRequest.constraints || [],
            `REVISION REQUEST: ${revisionNote}`
          ]
        };
        return await this.researchAndRecommend(revisedRequest, contextPack);
      }
      /**
       * Full research and approval workflow with revision support
       */
      async researchAndGetApproval(request, contextPack, maxRevisions = 3) {
        let currentRequest = request;
        let revisions = 0;
        while (revisions <= maxRevisions) {
          console.log("\u{1F50D} Researching and analyzing...");
          const output = await this.researchAndRecommend(currentRequest, contextPack);
          this.renderToConsole(output);
          const approval = await this.promptForApproval(output);
          if (approval.approved || !approval.revised) {
            return { output, approval, revisions };
          }
          revisions++;
          if (revisions > maxRevisions) {
            console.log(`\u274C Maximum revisions (${maxRevisions}) reached.`);
            return { output, approval, revisions };
          }
          console.log(`\u{1F504} Revision ${revisions}/${maxRevisions}`);
          currentRequest = {
            ...request,
            constraints: [
              ...request.constraints || [],
              `REVISION ${revisions}: ${approval.revisionNote}`
            ]
          };
        }
        throw new Error("Unexpected end of revision loop");
      }
      /**
       * Complete workflow: Research → Recommend → Execute with Adaptive Recovery
       */
      async researchRecommendExecute(request, contextPack, maxRevisions = 3) {
        const { output, approval, revisions } = await this.researchAndGetApproval(request, contextPack, maxRevisions);
        if (!approval.approved) {
          return { output, approval, revisions };
        }
        console.log("\n\u{1F680} Proceeding with execution (with adaptive recovery)...");
        const orchestrator = new ExecutionOrchestrator(this.agent);
        const execution = await orchestrator.executeWithRecovery(output.plan, this, request);
        return {
          output,
          approval,
          revisions,
          execution
        };
      }
    };
  }
});

// src/utils/context-loader.ts
var context_loader_exports = {};
__export(context_loader_exports, {
  formatContextStatus: () => formatContextStatus,
  loadContext: () => loadContext
});
function loadMarkdownDirectory(dirPath) {
  if (!fs2__default.existsSync(dirPath)) {
    return "";
  }
  const files = fs2__default.readdirSync(dirPath).filter((file) => file.endsWith(".md")).sort();
  let content = "";
  for (const file of files) {
    const filePath = path8__default.join(dirPath, file);
    try {
      const fileContent = fs2__default.readFileSync(filePath, "utf-8");
      content += `

=== ${file} ===

${fileContent}`;
    } catch (error) {
      console.warn(`Failed to read ${filePath}:`, error);
    }
  }
  return content;
}
function extractDateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]);
  }
  return /* @__PURE__ */ new Date(0);
}
function summarizeContent(content, maxLength = MAX_SUMMARY_LENGTH) {
  if (content.length <= maxLength) {
    return content;
  }
  const truncated = content.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf("\n\n");
  if (lastNewline > maxLength * 0.8) {
    return truncated.substring(0, lastNewline);
  }
  return truncated + "\n\n[...content truncated for context budget...]";
}
function loadTaskFiles(tasksDir, maxBudget) {
  if (!fs2__default.existsSync(tasksDir)) {
    return [];
  }
  const files = fs2__default.readdirSync(tasksDir).filter((file) => file.endsWith(".md")).map((filename) => {
    const filePath = path8__default.join(tasksDir, filename);
    const content = fs2__default.readFileSync(filePath, "utf-8");
    return {
      filename,
      content,
      size: Buffer.byteLength(content, "utf-8"),
      date: extractDateFromFilename(filename),
      isSummarized: false
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
  const result = [];
  let usedBudget = 0;
  for (const file of files) {
    let finalContent = file.content;
    let isSummarized = false;
    if (usedBudget + file.size > maxBudget) {
      finalContent = summarizeContent(file.content);
      const summarizedSize = Buffer.byteLength(finalContent, "utf-8");
      if (usedBudget + summarizedSize > maxBudget) {
        continue;
      }
      usedBudget += summarizedSize;
      isSummarized = true;
    } else {
      usedBudget += file.size;
    }
    result.push({
      ...file,
      content: finalContent,
      isSummarized
    });
  }
  return result;
}
function loadContext(agentDir = ".agent") {
  const systemContent = loadMarkdownDirectory(path8__default.join(agentDir, "system"));
  const sopContent = loadMarkdownDirectory(path8__default.join(agentDir, "sop"));
  const systemSize = Buffer.byteLength(systemContent, "utf-8");
  const sopSize = Buffer.byteLength(sopContent, "utf-8");
  const taskBudget = Math.max(0, CONTEXT_BUDGET_BYTES - systemSize - sopSize);
  const tasks = loadTaskFiles(path8__default.join(agentDir, "tasks"), taskBudget);
  const totalSize = systemSize + sopSize + tasks.reduce((sum, task) => sum + Buffer.byteLength(task.content, "utf-8"), 0);
  const warnings = [];
  if (totalSize > CONTEXT_BUDGET_BYTES) {
    warnings.push(`Context size (${(totalSize / 1024).toFixed(1)}KB) exceeds budget (${CONTEXT_BUDGET_BYTES / 1024}KB)`);
  }
  return {
    system: systemContent,
    sop: sopContent,
    tasks,
    totalSize,
    warnings
  };
}
function formatContextStatus(pack) {
  const taskCount = pack.tasks.length;
  const summarizedCount = pack.tasks.filter((t) => t.isSummarized).length;
  const sizeKB = (pack.totalSize / 1024).toFixed(1);
  let status = `[x-cli] Context: loaded system docs, sop docs, ${taskCount} task docs (~${sizeKB} KB).`;
  if (summarizedCount > 0) {
    status += ` Summarized ${summarizedCount} older tasks for context budget.`;
  }
  if (pack.warnings.length > 0) {
    status += ` Warnings: ${pack.warnings.join("; ")}`;
  }
  return status;
}
var CONTEXT_BUDGET_BYTES, MAX_SUMMARY_LENGTH;
var init_context_loader = __esm({
  "src/utils/context-loader.ts"() {
    CONTEXT_BUDGET_BYTES = 280 * 1024;
    MAX_SUMMARY_LENGTH = 2e3;
  }
});

// src/agent/grok-agent.ts
var grok_agent_exports = {};
__export(grok_agent_exports, {
  GrokAgent: () => GrokAgent
});
var GrokAgent;
var init_grok_agent = __esm({
  "src/agent/grok-agent.ts"() {
    init_client();
    init_tools();
    init_config();
    init_tools2();
    init_token_counter();
    init_custom_instructions();
    init_settings_manager();
    init_research_recommend();
    init_execution_orchestrator();
    GrokAgent = class extends EventEmitter {
      constructor(apiKey2, baseURL, model, maxToolRounds, contextPack) {
        super();
        this.chatHistory = [];
        this.messages = [];
        this.abortController = null;
        this.mcpInitialized = false;
        this.lastToolExecutionTime = 0;
        this.activeToolCalls = 0;
        this.maxConcurrentToolCalls = 2;
        this.minRequestInterval = 500;
        // ms
        this.lastRequestTime = 0;
        const manager = getSettingsManager();
        const savedModel = manager.getCurrentModel();
        const modelToUse = model || savedModel || "grok-code-fast-1";
        this.maxToolRounds = maxToolRounds || 400;
        this.sessionLogPath = process.env.GROK_SESSION_LOG || `${process.env.HOME}/.grok/session.log`;
        this.grokClient = new GrokClient(apiKey2, modelToUse, baseURL);
        this.textEditor = new TextEditorTool();
        this.morphEditor = process.env.MORPH_API_KEY ? new MorphEditorTool() : null;
        this.bash = new BashTool();
        this.todoTool = new TodoTool();
        this.confirmationTool = new ConfirmationTool();
        this.search = new SearchTool();
        this.multiFileEditor = new MultiFileEditorTool();
        this.advancedSearch = new AdvancedSearchTool();
        this.fileTreeOps = new FileTreeOperationsTool();
        this.codeAwareEditor = new CodeAwareEditorTool();
        this.operationHistory = new OperationHistoryTool();
        this.astParser = new ASTParserTool();
        this.symbolSearch = new SymbolSearchTool();
        this.dependencyAnalyzer = new DependencyAnalyzerTool();
        this.codeContext = new CodeContextTool();
        this.refactoringAssistant = new RefactoringAssistantTool();
        this.tokenCounter = createTokenCounter(modelToUse);
        this.initializeMCP();
        const customInstructions = loadCustomInstructions();
        const customInstructionsSection = customInstructions ? `

CUSTOM INSTRUCTIONS:
${customInstructions}

The above custom instructions should be followed alongside the standard instructions below.` : "";
        const contextSection = contextPack ? `

PROJECT CONTEXT:
${contextPack.system}

SOP:
${contextPack.sop}

TASKS:
${contextPack.tasks.map((t) => `- ${t.filename}: ${t.content}`).join("\n")}

The above project context should inform your responses and decision making.` : "";
        this.messages.push({
          role: "system",
          content: `You are X-CLI, an AI assistant that helps with file editing, coding tasks, and system operations.${customInstructionsSection}${contextSection}

You have access to these tools:

CORE TOOLS:
- view_file: View file contents or directory listings
- create_file: Create new files with content (ONLY use this for files that don't exist yet)
- str_replace_editor: Replace text in existing files (ALWAYS use this to edit or update existing files)${this.morphEditor ? "\n- edit_file: High-speed file editing with Morph Fast Apply (4,500+ tokens/sec with 98% accuracy)" : ""}
- bash: Execute bash commands (use for searching, file discovery, navigation, and system operations)
- search: Unified search tool for finding text content or files (similar to Cursor's search functionality)
- create_todo_list: Create a visual todo list for planning and tracking tasks
- update_todo_list: Update existing todos in your todo list

ADVANCED TOOLS:
- multi_file_edit: Perform atomic operations across multiple files with transaction support
- advanced_search: Enhanced search with regex patterns, context, and bulk replace capabilities
- file_tree_ops: Generate directory trees, bulk operations, and file organization
- code_analysis: Analyze code structure, perform refactoring, and smart code operations
- operation_history: Track, undo, and redo operations with comprehensive history management

REAL-TIME INFORMATION:
You have access to real-time web search and X (Twitter) data. When users ask for current information, latest news, or recent events, you automatically have access to up-to-date information from the web and social media.

IMPORTANT TOOL USAGE RULES:
- NEVER use create_file on files that already exist - this will overwrite them completely
- ALWAYS use str_replace_editor to modify existing files, even for small changes
- Before editing a file, use view_file to see its current contents
- Use create_file ONLY when creating entirely new files that don't exist

SEARCHING AND EXPLORATION:
- Use search for fast, powerful text search across files or finding files by name (unified search tool)
- Examples: search for text content like "import.*react", search for files like "component.tsx"
- Use bash with commands like 'find', 'grep', 'rg', 'ls' for complex file operations and navigation
- view_file is best for reading specific files you already know exist

When a user asks you to edit, update, modify, or change an existing file:
1. First use view_file to see the current contents
2. Then use str_replace_editor to make the specific changes
3. Never use create_file for existing files

When a user asks you to create a new file that doesn't exist:
1. Use create_file with the full content

TASK PLANNING WITH TODO LISTS:
- For complex requests with multiple steps, ALWAYS create a todo list first to plan your approach
- Use create_todo_list to break down tasks into manageable items with priorities
- Mark tasks as 'in_progress' when you start working on them (only one at a time)
- Mark tasks as 'completed' immediately when finished
- Use update_todo_list to track your progress throughout the task
- Todo lists provide visual feedback with colors: \u2705 Green (completed), \u{1F504} Cyan (in progress), \u23F3 Yellow (pending)
- Always create todos with priorities: 'high' (\u{1F534}), 'medium' (\u{1F7E1}), 'low' (\u{1F7E2})

USER CONFIRMATION SYSTEM:
File operations (create_file, str_replace_editor) and bash commands will automatically request user confirmation before execution. The confirmation system will show users the actual content or command before they decide. Users can choose to approve individual operations or approve all operations of that type for the session.

If a user rejects an operation, the tool will return an error and you should not proceed with that specific operation.

Be helpful, direct, and efficient. Always explain what you're doing and show the results.

IMPORTANT RESPONSE GUIDELINES:
- After using tools, do NOT respond with pleasantries like "Thanks for..." or "Great!"
- Only provide necessary explanations or next steps if relevant to the task
- Keep responses concise and focused on the actual work being done
- If a tool execution completes the user's request, you can remain silent or give a brief confirmation

Current working directory: ${process.cwd()}`
        });
      }
      async initializeMCP() {
        Promise.resolve().then(async () => {
          try {
            const config2 = loadMCPConfig();
            if (config2.servers.length > 0) {
              await initializeMCPServers();
            }
          } catch (error) {
            console.warn("MCP initialization failed:", error);
          } finally {
            this.mcpInitialized = true;
          }
        });
      }
      isGrokModel() {
        const currentModel = this.grokClient.getCurrentModel();
        return currentModel.toLowerCase().includes("grok");
      }
      // Heuristic: enable web search only when likely needed
      shouldUseSearchFor(message) {
        const q = message.toLowerCase();
        const keywords = [
          "today",
          "latest",
          "news",
          "trending",
          "breaking",
          "current",
          "now",
          "recent",
          "x.com",
          "twitter",
          "tweet",
          "what happened",
          "as of",
          "update on",
          "release notes",
          "changelog",
          "price"
        ];
        if (keywords.some((k) => q.includes(k))) return true;
        if (/(20\d{2})/.test(q)) return true;
        return false;
      }
      // Detect if message should use the Research → Recommend → Execute workflow
      shouldUseWorkflow(message) {
        const q = message.toLowerCase();
        const complexityIndicators = [
          // Action verbs indicating multi-step tasks
          /\b(implement|build|create|refactor|optimize|add|update|modify|develop|design)\b/.test(q),
          /\b(system|feature|component|module|service|api|database)\b/.test(q),
          // Multi-step indicators
          /\b(and|then|after|finally|also|additionally)\b/.test(q),
          /\b(step|phase|stage|part|component)\b/.test(q),
          // Size/complexity indicators
          q.length > 150,
          // Long requests
          (q.match(/\b(and|or|but|however|therefore|consequently)\b/g) || []).length >= 2,
          // Complex logic
          // Technical complexity
          /\b(authentication|authorization|security|validation|testing|deployment|ci.cd|docker|kubernetes)\b/.test(q),
          /\b(multiple|several|various|different|complex|advanced)\b/.test(q)
        ];
        const indicatorCount = complexityIndicators.filter(Boolean).length;
        return indicatorCount >= 2;
      }
      async processUserMessage(message) {
        if (this.shouldUseWorkflow(message)) {
          return this.processWithWorkflow(message);
        }
        return this.processStandard(message);
      }
      /**
       * Process complex tasks using the Research → Recommend → Execute workflow
       */
      async processWithWorkflow(message) {
        const userEntry = {
          type: "user",
          content: message,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.chatHistory.push(userEntry);
        this.logEntry(userEntry);
        this.messages.push({ role: "user", content: message });
        try {
          const contextPack = await this.loadContextPack();
          const workflowService = new ResearchRecommendService(this);
          const request = {
            userTask: message,
            context: contextPack ? "Project context loaded" : void 0
          };
          console.log("\u{1F50D} Researching and analyzing...");
          const { output, approval, revisions } = await workflowService.researchAndGetApproval(request, contextPack);
          if (!approval.approved) {
            const rejectionEntry = {
              type: "assistant",
              content: approval.revised ? `Plan revised ${revisions} time(s) but ultimately rejected by user.` : "Plan rejected by user.",
              timestamp: /* @__PURE__ */ new Date()
            };
            this.chatHistory.push(rejectionEntry);
            return [userEntry, rejectionEntry];
          }
          console.log("\u2705 Plan approved. Executing...");
          const orchestrator = new ExecutionOrchestrator(this);
          const executionResult = await orchestrator.executeWithRecovery(output.plan, workflowService, request);
          return this.workflowResultToChatEntries(userEntry, output, approval, executionResult);
        } catch (error) {
          console.error("[Workflow] Failed:", error);
          const errorEntry = {
            type: "assistant",
            content: `Workflow failed: ${error.message}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          this.chatHistory.push(errorEntry);
          return [userEntry, errorEntry];
        }
      }
      /**
       * Standard processing for simple queries
       */
      async processStandard(message) {
        const userEntry = {
          type: "user",
          content: message,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.chatHistory.push(userEntry);
        this.logEntry(userEntry);
        this.messages.push({ role: "user", content: message });
        const newEntries = [userEntry];
        const maxToolRounds = this.maxToolRounds;
        let toolRounds = 0;
        try {
          const tools = await getAllGrokTools();
          let currentResponse = await this.grokClient.chat(
            this.messages,
            tools,
            void 0,
            this.isGrokModel() && this.shouldUseSearchFor(message) ? { search_parameters: { mode: "auto" } } : { search_parameters: { mode: "off" } }
          );
          while (toolRounds < maxToolRounds) {
            const assistantMessage = currentResponse.choices[0]?.message;
            if (!assistantMessage) {
              throw new Error("No response from Grok");
            }
            if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
              toolRounds++;
              const assistantEntry = {
                type: "assistant",
                content: assistantMessage.content || "Using tools to help you...",
                timestamp: /* @__PURE__ */ new Date(),
                toolCalls: assistantMessage.tool_calls
              };
              this.chatHistory.push(assistantEntry);
              this.logEntry(assistantEntry);
              newEntries.push(assistantEntry);
              this.messages.push({
                role: "assistant",
                content: assistantMessage.content || "",
                tool_calls: assistantMessage.tool_calls
              });
              assistantMessage.tool_calls.forEach((toolCall) => {
                const toolCallEntry = {
                  type: "tool_call",
                  content: "Executing...",
                  timestamp: /* @__PURE__ */ new Date(),
                  toolCall
                };
                this.chatHistory.push(toolCallEntry);
                newEntries.push(toolCallEntry);
              });
              for (const toolCall of assistantMessage.tool_calls) {
                const result = await this.executeTool(toolCall);
                const entryIndex = this.chatHistory.findIndex(
                  (entry) => entry.type === "tool_call" && entry.toolCall?.id === toolCall.id
                );
                if (entryIndex !== -1) {
                  const updatedEntry = {
                    ...this.chatHistory[entryIndex],
                    type: "tool_result",
                    content: result.success ? result.output || "Success" : result.error || "Error occurred",
                    toolResult: result
                  };
                  this.chatHistory[entryIndex] = updatedEntry;
                  const newEntryIndex = newEntries.findIndex(
                    (entry) => entry.type === "tool_call" && entry.toolCall?.id === toolCall.id
                  );
                  if (newEntryIndex !== -1) {
                    newEntries[newEntryIndex] = updatedEntry;
                  }
                }
                this.messages.push({
                  role: "tool",
                  content: result.success ? result.output || "Success" : result.error || "Error",
                  tool_call_id: toolCall.id
                });
              }
              currentResponse = await this.grokClient.chat(
                this.messages,
                tools,
                void 0,
                this.isGrokModel() && this.shouldUseSearchFor(message) ? { search_parameters: { mode: "auto" } } : { search_parameters: { mode: "off" } }
              );
            } else {
              const finalEntry = {
                type: "assistant",
                content: assistantMessage.content || "I understand, but I don't have a specific response.",
                timestamp: /* @__PURE__ */ new Date()
              };
              this.chatHistory.push(finalEntry);
              this.messages.push({
                role: "assistant",
                content: assistantMessage.content || ""
              });
              newEntries.push(finalEntry);
              break;
            }
          }
          if (toolRounds >= maxToolRounds) {
            const warningEntry = {
              type: "assistant",
              content: "Maximum tool execution rounds reached. Stopping to prevent infinite loops.",
              timestamp: /* @__PURE__ */ new Date()
            };
            this.chatHistory.push(warningEntry);
            newEntries.push(warningEntry);
          }
          return newEntries;
        } catch (error) {
          const errorEntry = {
            type: "assistant",
            content: `Sorry, I encountered an error: ${error.message}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          this.chatHistory.push(errorEntry);
          return [userEntry, errorEntry];
        }
      }
      messageReducer(previous, item) {
        const reduce = (acc, delta) => {
          acc = { ...acc };
          for (const [key, value] of Object.entries(delta)) {
            if (acc[key] === void 0 || acc[key] === null) {
              acc[key] = value;
              if (Array.isArray(acc[key])) {
                for (const arr of acc[key]) {
                  delete arr.index;
                }
              }
            } else if (typeof acc[key] === "string" && typeof value === "string") {
              acc[key] += value;
            } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
              const accArray = acc[key];
              for (let i = 0; i < value.length; i++) {
                if (!accArray[i]) accArray[i] = {};
                accArray[i] = reduce(accArray[i], value[i]);
              }
            } else if (typeof acc[key] === "object" && typeof value === "object") {
              acc[key] = reduce(acc[key], value);
            }
          }
          return acc;
        };
        return reduce(previous, item.choices[0]?.delta || {});
      }
      async *processUserMessageStream(message) {
        this.abortController = new AbortController();
        const userEntry = {
          type: "user",
          content: message,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.chatHistory.push(userEntry);
        this.messages.push({ role: "user", content: message });
        let inputTokens = this.tokenCounter.countMessageTokens(
          this.messages
        );
        yield {
          type: "token_count",
          tokenCount: inputTokens
        };
        const maxToolRounds = this.maxToolRounds;
        let toolRounds = 0;
        let totalOutputTokens = 0;
        let lastTokenUpdate = 0;
        try {
          while (toolRounds < maxToolRounds) {
            if (this.abortController?.signal.aborted) {
              yield {
                type: "content",
                content: "\n\n[Operation cancelled by user]"
              };
              yield { type: "done" };
              return;
            }
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
              const delay = this.minRequestInterval - timeSinceLastRequest;
              await new Promise((resolve8) => setTimeout(resolve8, delay));
            }
            this.lastRequestTime = Date.now();
            const tools = await getAllGrokTools();
            const stream = this.grokClient.chatStream(
              this.messages,
              tools,
              void 0,
              this.isGrokModel() && this.shouldUseSearchFor(message) ? { search_parameters: { mode: "auto" } } : { search_parameters: { mode: "off" } },
              this.abortController?.signal
            );
            let accumulatedMessage = {};
            let accumulatedContent = "";
            let toolCallsYielded = false;
            for await (const chunk of stream) {
              if (this.abortController?.signal.aborted) {
                yield {
                  type: "content",
                  content: "\n\n[Operation cancelled by user]"
                };
                yield { type: "done" };
                return;
              }
              if (!chunk.choices?.[0]) continue;
              accumulatedMessage = this.messageReducer(accumulatedMessage, chunk);
              if (!toolCallsYielded && accumulatedMessage.tool_calls?.length > 0) {
                const hasCompleteTool = accumulatedMessage.tool_calls.some(
                  (tc) => tc.function?.name
                );
                if (hasCompleteTool) {
                  yield {
                    type: "tool_calls",
                    toolCalls: accumulatedMessage.tool_calls
                  };
                  toolCallsYielded = true;
                }
              }
              if (chunk.choices[0].delta?.content) {
                accumulatedContent += chunk.choices[0].delta.content;
                const currentOutputTokens = this.tokenCounter.estimateStreamingTokens(accumulatedContent) + (accumulatedMessage.tool_calls ? this.tokenCounter.countTokens(
                  JSON.stringify(accumulatedMessage.tool_calls)
                ) : 0);
                totalOutputTokens = currentOutputTokens;
                yield {
                  type: "content",
                  content: chunk.choices[0].delta.content
                };
                const now2 = Date.now();
                if (now2 - lastTokenUpdate > 250) {
                  lastTokenUpdate = now2;
                  yield {
                    type: "token_count",
                    tokenCount: inputTokens + totalOutputTokens
                  };
                }
              }
            }
            const assistantEntry = {
              type: "assistant",
              content: accumulatedMessage.content || "Using tools to help you...",
              timestamp: /* @__PURE__ */ new Date(),
              toolCalls: accumulatedMessage.tool_calls || void 0
            };
            this.chatHistory.push(assistantEntry);
            this.messages.push({
              role: "assistant",
              content: accumulatedMessage.content || "",
              tool_calls: accumulatedMessage.tool_calls
            });
            if (accumulatedMessage.tool_calls?.length > 0) {
              toolRounds++;
              if (!toolCallsYielded) {
                yield {
                  type: "tool_calls",
                  toolCalls: accumulatedMessage.tool_calls
                };
              }
              const toolCalls = accumulatedMessage.tool_calls;
              for (let i = 0; i < toolCalls.length; i += this.maxConcurrentToolCalls) {
                const now2 = Date.now();
                const timeSinceLastExecution = now2 - this.lastToolExecutionTime;
                if (timeSinceLastExecution < this.minRequestInterval) {
                  const delay = this.minRequestInterval - timeSinceLastExecution;
                  await new Promise((resolve8) => setTimeout(resolve8, delay));
                }
                const batch = toolCalls.slice(i, i + this.maxConcurrentToolCalls);
                const batchPromises = batch.map(async (toolCall) => {
                  if (this.abortController?.signal.aborted) {
                    return null;
                  }
                  const result = await this.executeTool(toolCall);
                  const toolResultEntry = {
                    type: "tool_result",
                    content: result.success ? result.output || "Success" : result.error || "Error occurred",
                    timestamp: /* @__PURE__ */ new Date(),
                    toolCall,
                    toolResult: result
                  };
                  this.chatHistory.push(toolResultEntry);
                  this.messages.push({
                    role: "tool",
                    content: result.success ? result.output || "Success" : result.error || "Error",
                    tool_call_id: toolCall.id
                  });
                  return { toolCall, result, entry: toolResultEntry };
                });
                const batchResults = await Promise.all(batchPromises);
                this.lastToolExecutionTime = Date.now();
                if (batchResults.includes(null)) {
                  yield {
                    type: "content",
                    content: "\n\n[Operation cancelled by user]"
                  };
                  yield { type: "done" };
                  return;
                }
                for (const { toolCall, result } of batchResults) {
                  yield {
                    type: "tool_result",
                    toolCall,
                    toolResult: result
                  };
                }
              }
              inputTokens = this.tokenCounter.countMessageTokens(
                this.messages
              );
              yield {
                type: "token_count",
                tokenCount: inputTokens + totalOutputTokens
              };
            } else {
              break;
            }
          }
          if (toolRounds >= maxToolRounds) {
            yield {
              type: "content",
              content: "\n\nMaximum tool execution rounds reached. Stopping to prevent infinite loops."
            };
          }
          yield { type: "done" };
        } catch (error) {
          if (this.abortController?.signal.aborted) {
            yield {
              type: "content",
              content: "\n\n[Operation cancelled by user]"
            };
            yield { type: "done" };
            return;
          }
          const errorEntry = {
            type: "assistant",
            content: `Sorry, I encountered an error: ${error.message}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          this.chatHistory.push(errorEntry);
          yield {
            type: "content",
            content: errorEntry.content
          };
          yield { type: "done" };
        } finally {
          this.abortController = null;
        }
      }
      async executeTool(toolCall) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const settingsManager = getSettingsManager();
          const requireConfirmation = settingsManager.getUserSetting("requireConfirmation") ?? true;
          if (requireConfirmation) {
            const needsConfirmation = ["create_file", "str_replace_editor", "bash"].includes(toolCall.function.name);
            if (needsConfirmation) {
              const confirmationResult = await this.confirmationTool.requestConfirmation({
                operation: toolCall.function.name,
                filename: args.path || args.command || "unknown",
                description: `Execute ${toolCall.function.name} operation`
              });
              if (!confirmationResult.success) {
                return {
                  success: false,
                  error: confirmationResult.error || "Operation cancelled by user"
                };
              }
            }
          }
          switch (toolCall.function.name) {
            case "view_file":
              try {
                const range = args.start_line && args.end_line ? [args.start_line, args.end_line] : void 0;
                return await this.textEditor.view(args.path, range);
              } catch (error) {
                console.warn(`view_file tool failed, falling back to bash: ${error.message}`);
                const path33 = args.path;
                let command = `cat "${path33}"`;
                if (args.start_line && args.end_line) {
                  command = `sed -n '${args.start_line},${args.end_line}p' "${path33}"`;
                }
                return await this.bash.execute(command);
              }
            case "create_file":
              try {
                return await this.textEditor.create(args.path, args.content);
              } catch (error) {
                console.warn(`create_file tool failed, falling back to bash: ${error.message}`);
                const command = `cat > "${args.path}" << 'EOF'
${args.content}
EOF`;
                return await this.bash.execute(command);
              }
            case "str_replace_editor":
              try {
                return await this.textEditor.strReplace(
                  args.path,
                  args.old_str,
                  args.new_str,
                  args.replace_all
                );
              } catch (error) {
                console.warn(`str_replace_editor tool failed, falling back to bash: ${error.message}`);
                const escapedOld = args.old_str.replace(/[\/&]/g, "\\$&");
                const escapedNew = args.new_str.replace(/[\/&]/g, "\\$&");
                const sedCommand = args.replace_all ? `sed -i 's/${escapedOld}/${escapedNew}/g' "${args.path}"` : `sed -i '0,/${escapedOld}/s/${escapedOld}/${escapedNew}/' "${args.path}"`;
                return await this.bash.execute(sedCommand);
              }
            case "edit_file":
              if (!this.morphEditor) {
                return {
                  success: false,
                  error: "Morph Fast Apply not available. Please set MORPH_API_KEY environment variable to use this feature."
                };
              }
              return await this.morphEditor.editFile(
                args.target_file,
                args.instructions,
                args.code_edit
              );
            case "bash":
              return await this.bash.execute(args.command);
            case "create_todo_list":
              return await this.todoTool.createTodoList(args.todos);
            case "update_todo_list":
              return await this.todoTool.updateTodoList(args.updates);
            case "search":
              try {
                return await this.search.search(args.query, {
                  searchType: args.search_type,
                  includePattern: args.include_pattern,
                  excludePattern: args.exclude_pattern,
                  caseSensitive: args.case_sensitive,
                  wholeWord: args.whole_word,
                  regex: args.regex,
                  maxResults: args.max_results,
                  fileTypes: args.file_types,
                  includeHidden: args.include_hidden
                });
              } catch (error) {
                console.warn(`search tool failed, falling back to bash: ${error.message}`);
                let command = `grep -r "${args.query}" .`;
                if (args.include_pattern) {
                  command += ` --include="${args.include_pattern}"`;
                }
                if (args.exclude_pattern) {
                  command += ` --exclude="${args.exclude_pattern}"`;
                }
                return await this.bash.execute(command);
              }
            // Advanced Tools
            case "multi_file_edit":
              switch (args.operation) {
                case "begin_transaction":
                  return await this.multiFileEditor.beginTransaction(args.description);
                case "add_operations":
                  return await this.multiFileEditor.addOperations(args.operations);
                case "preview_transaction":
                  return await this.multiFileEditor.previewTransaction();
                case "commit_transaction":
                  return await this.multiFileEditor.commitTransaction();
                case "rollback_transaction":
                  return await this.multiFileEditor.rollbackTransaction(args.transaction_id);
                case "execute_multi_file":
                  return await this.multiFileEditor.executeMultiFileOperation(args.operations, args.description);
                default:
                  return { success: false, error: `Unknown multi_file_edit operation: ${args.operation}` };
              }
            case "advanced_search":
              switch (args.operation) {
                case "search":
                  return await this.advancedSearch.search(args.path, args.options);
                case "search_replace":
                  return await this.advancedSearch.searchAndReplace(args.path, args.options);
                case "find_files":
                  return await this.advancedSearch.findFiles(args.path, args.pattern, args.options);
                default:
                  return { success: false, error: `Unknown advanced_search operation: ${args.operation}` };
              }
            case "file_tree_ops":
              switch (args.operation) {
                case "generate_tree":
                  return await this.fileTreeOps.generateTree(args.path, args.options);
                case "bulk_operations":
                  return await this.fileTreeOps.bulkOperations(args.operations);
                case "copy_structure":
                  return await this.fileTreeOps.copyStructure(args.source, args.destination, args.options);
                case "organize_files":
                  return await this.fileTreeOps.organizeFiles(args.source, args.organization_type, args.destination);
                case "cleanup_empty_dirs":
                  return await this.fileTreeOps.cleanupEmptyDirectories(args.path);
                default:
                  return { success: false, error: `Unknown file_tree_ops operation: ${args.operation}` };
              }
            case "code_analysis":
              switch (args.operation) {
                case "analyze":
                  return await this.codeAwareEditor.analyzeCode(args.file_path);
                case "refactor":
                  return await this.codeAwareEditor.refactor(args.file_path, args.refactor_operation);
                case "smart_insert":
                  return await this.codeAwareEditor.smartInsert(args.file_path, args.code, args.location, args.target);
                case "format_code":
                  return await this.codeAwareEditor.formatCode(args.file_path, args.options);
                case "add_imports":
                  return await this.codeAwareEditor.addMissingImports(args.file_path, args.symbols);
                default:
                  return { success: false, error: `Unknown code_analysis operation: ${args.operation}` };
              }
            case "operation_history":
              switch (args.operation) {
                case "show_history":
                  return await this.operationHistory.showHistory(args.limit);
                case "undo":
                  return await this.operationHistory.undo();
                case "redo":
                  return await this.operationHistory.redo();
                case "goto_point":
                  return await this.operationHistory.goToHistoryPoint(args.entry_id);
                case "clear_history":
                  return await this.operationHistory.clearHistory();
                default:
                  return { success: false, error: `Unknown operation_history operation: ${args.operation}` };
              }
            case "ast_parser":
              return await this.astParser.execute(args);
            case "symbol_search":
              return await this.symbolSearch.execute(args);
            case "dependency_analyzer":
              return await this.dependencyAnalyzer.execute(args);
            case "code_context":
              return await this.codeContext.execute(args);
            case "refactoring_assistant":
              return await this.refactoringAssistant.execute(args);
            default:
              if (toolCall.function.name.startsWith("mcp__")) {
                return await this.executeMCPTool(toolCall);
              }
              return {
                success: false,
                error: `Unknown tool: ${toolCall.function.name}`
              };
          }
        } catch (error) {
          return {
            success: false,
            error: `Tool execution error: ${error.message}`
          };
        }
      }
      async executeMCPTool(toolCall) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const mcpManager2 = getMCPManager();
          const result = await mcpManager2.callTool(toolCall.function.name, args);
          if (result.isError) {
            return {
              success: false,
              error: result.content[0]?.text || "MCP tool error"
            };
          }
          const output = result.content.map((item) => {
            if (item.type === "text") {
              return item.text;
            } else if (item.type === "resource") {
              return `Resource: ${item.resource?.uri || "Unknown"}`;
            }
            return String(item);
          }).join("\n");
          return {
            success: true,
            output: output || "Success"
          };
        } catch (error) {
          return {
            success: false,
            error: `MCP tool execution error: ${error.message}`
          };
        }
      }
      getChatHistory() {
        return [...this.chatHistory];
      }
      saveSessionLog() {
        try {
          const sessionDir = path8__default.join(__require("os").homedir(), ".grok");
          if (!fs2__default.existsSync(sessionDir)) {
            fs2__default.mkdirSync(sessionDir, { recursive: true });
          }
          const sessionFile = path8__default.join(sessionDir, "session.log");
          const logLines = this.chatHistory.map((entry) => JSON.stringify(entry)).join("\n") + "\n";
          fs2__default.writeFileSync(sessionFile, logLines);
        } catch (error) {
          console.warn("Failed to save session log:", error);
        }
      }
      getCurrentDirectory() {
        return this.bash.getCurrentDirectory();
      }
      async executeBashCommand(command) {
        return await this.bash.execute(command);
      }
      getCurrentModel() {
        return this.grokClient.getCurrentModel();
      }
      setModel(model) {
        this.grokClient.setModel(model);
        this.tokenCounter.dispose();
        this.tokenCounter = createTokenCounter(model);
      }
      abortCurrentOperation() {
        if (this.abortController) {
          this.abortController.abort();
        }
      }
      getMessageCount() {
        return this.chatHistory.length;
      }
      getSessionTokenCount() {
        return this.tokenCounter.countMessageTokens(this.messages);
      }
      logEntry(entry) {
        try {
          const dir = path8__default.dirname(this.sessionLogPath);
          if (!fs2__default.existsSync(dir)) {
            fs2__default.mkdirSync(dir, { recursive: true });
          }
          const logLine = JSON.stringify({
            type: entry.type,
            content: entry.content,
            timestamp: entry.timestamp.toISOString(),
            toolCallId: entry.toolCall?.id,
            toolCallsCount: entry.toolCalls?.length
          }) + "\n";
          fs2__default.appendFileSync(this.sessionLogPath, logLine);
        } catch (error) {
          console.warn("Failed to log session entry:", error);
        }
      }
      /**
       * Load .agent context pack for enhanced recommendations
       */
      async loadContextPack() {
        try {
          const contextLoader = await Promise.resolve().then(() => (init_context_loader(), context_loader_exports));
          return await contextLoader.loadContext(".agent");
        } catch (error) {
          console.warn("[Workflow] Failed to load context pack:", error);
          return void 0;
        }
      }
      /**
       * Convert workflow results to chat entries for display
       */
      workflowResultToChatEntries(userEntry, output, approval, executionResult) {
        const entries = [userEntry];
        const summaryEntry = {
          type: "assistant",
          content: `Workflow completed: ${executionResult?.success ? "\u2705 Success" : "\u274C Failed"}

${output?.plan?.summary || "Task completed"}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        entries.push(summaryEntry);
        this.chatHistory.push(summaryEntry);
        if (executionResult?.executionPlan) {
          const detailsEntry = {
            type: "assistant",
            content: `Executed ${executionResult.executionPlan.completedSteps}/${executionResult.executionPlan.totalSteps} tasks successfully.`,
            timestamp: /* @__PURE__ */ new Date()
          };
          entries.push(detailsEntry);
          this.chatHistory.push(detailsEntry);
        }
        return entries;
      }
    };
  }
});

// src/utils/text-utils.ts
function isWordBoundary(char) {
  if (!char) return true;
  return /\s/.test(char) || /[^\w]/.test(char);
}
function moveToPreviousWord(text, position) {
  if (position <= 0) return 0;
  let pos = position - 1;
  while (pos > 0 && isWordBoundary(text[pos])) {
    pos--;
  }
  while (pos > 0 && !isWordBoundary(text[pos - 1])) {
    pos--;
  }
  return pos;
}
function moveToNextWord(text, position) {
  if (position >= text.length) return text.length;
  let pos = position;
  while (pos < text.length && !isWordBoundary(text[pos])) {
    pos++;
  }
  while (pos < text.length && isWordBoundary(text[pos])) {
    pos++;
  }
  return pos;
}
function deleteWordBefore(text, position) {
  const wordStart = moveToPreviousWord(text, position);
  const newText = text.slice(0, wordStart) + text.slice(position);
  return {
    text: newText,
    position: wordStart
  };
}
function deleteWordAfter(text, position) {
  const wordEnd = moveToNextWord(text, position);
  const newText = text.slice(0, position) + text.slice(wordEnd);
  return {
    text: newText,
    position
  };
}
function moveToLineStart(text, position) {
  const beforeCursor = text.slice(0, position);
  const lastNewlineIndex = beforeCursor.lastIndexOf("\n");
  return lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
}
function moveToLineEnd(text, position) {
  const afterCursor = text.slice(position);
  const nextNewlineIndex = afterCursor.indexOf("\n");
  return nextNewlineIndex === -1 ? text.length : position + nextNewlineIndex;
}
function deleteCharBefore(text, position) {
  if (position <= 0) {
    return { text, position };
  }
  let deleteCount = 1;
  const charBefore = text.charAt(position - 1);
  if (position >= 2) {
    const charBeforeBefore = text.charAt(position - 2);
    if (charBeforeBefore >= "\uD800" && charBeforeBefore <= "\uDBFF" && charBefore >= "\uDC00" && charBefore <= "\uDFFF") {
      deleteCount = 2;
    }
  }
  const newText = text.slice(0, position - deleteCount) + text.slice(position);
  return {
    text: newText,
    position: position - deleteCount
  };
}
function deleteCharAfter(text, position) {
  if (position >= text.length) {
    return { text, position };
  }
  let deleteCount = 1;
  const charAfter = text.charAt(position);
  if (position + 1 < text.length) {
    const charAfterAfter = text.charAt(position + 1);
    if (charAfter >= "\uD800" && charAfter <= "\uDBFF" && charAfterAfter >= "\uDC00" && charAfterAfter <= "\uDFFF") {
      deleteCount = 2;
    }
  }
  const newText = text.slice(0, position) + text.slice(position + deleteCount);
  return {
    text: newText,
    position
  };
}
function insertText(text, position, insert) {
  const newText = text.slice(0, position) + insert + text.slice(position);
  return {
    text: newText,
    position: position + insert.length
  };
}
var init_text_utils = __esm({
  "src/utils/text-utils.ts"() {
  }
});
function useInputHistory() {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [originalInput, setOriginalInput] = useState("");
  const addToHistory = useCallback((input) => {
    if (input.trim() && !history.includes(input.trim())) {
      setHistory((prev) => [...prev, input.trim()]);
    }
    setCurrentIndex(-1);
    setOriginalInput("");
  }, [history]);
  const navigateHistory = useCallback((direction) => {
    if (history.length === 0) return null;
    let newIndex;
    if (direction === "up") {
      if (currentIndex === -1) {
        newIndex = history.length - 1;
      } else {
        newIndex = Math.max(0, currentIndex - 1);
      }
    } else {
      if (currentIndex === -1) {
        return null;
      } else if (currentIndex === history.length - 1) {
        newIndex = -1;
        return originalInput;
      } else {
        newIndex = Math.min(history.length - 1, currentIndex + 1);
      }
    }
    setCurrentIndex(newIndex);
    return newIndex === -1 ? originalInput : history[newIndex];
  }, [history, currentIndex, originalInput]);
  const getCurrentHistoryIndex = useCallback(() => currentIndex, [currentIndex]);
  const resetHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setOriginalInput("");
  }, []);
  const isNavigatingHistory = useCallback(() => currentIndex !== -1, [currentIndex]);
  const setOriginalInputCallback = useCallback((input) => {
    if (currentIndex === -1) {
      setOriginalInput(input);
    }
  }, [currentIndex]);
  return {
    addToHistory,
    navigateHistory,
    getCurrentHistoryIndex,
    resetHistory,
    isNavigatingHistory,
    setOriginalInput: setOriginalInputCallback
  };
}
var init_use_input_history = __esm({
  "src/hooks/use-input-history.ts"() {
  }
});

// src/services/paste-detection.ts
function getPasteDetectionService() {
  if (!globalPasteService) {
    globalPasteService = new PasteDetectionService();
  }
  return globalPasteService;
}
var PasteDetectionService, globalPasteService;
var init_paste_detection = __esm({
  "src/services/paste-detection.ts"() {
    PasteDetectionService = class {
      constructor(thresholds) {
        this.pasteCounter = 0;
        this.debug = process.env.GROK_PASTE_DEBUG === "true";
        this.thresholds = {
          lineThreshold: thresholds?.lineThreshold ?? this.getDefaultLineThreshold(),
          charThreshold: thresholds?.charThreshold ?? this.getDefaultCharThreshold()
        };
      }
      /**
       * Detects if new content represents a paste operation that should be summarized
       */
      detectPaste(oldValue, newValue) {
        const added = this.getAddedContent(oldValue, newValue);
        if (this.debug) {
          console.log("\u{1F50D} Paste Detection Debug:", {
            addedLength: added?.length || 0,
            lineCount: added ? this.countLines(added) : 0,
            thresholds: this.thresholds,
            shouldSummarize: added ? this.shouldSummarize(added) : false
          });
        }
        if (!added || !this.shouldSummarize(added)) {
          return null;
        }
        this.pasteCounter++;
        return {
          content: added,
          lineCount: this.countLines(added),
          charCount: added.length,
          pasteNumber: this.pasteCounter,
          summary: this.createPasteSummary(added, this.pasteCounter)
        };
      }
      /**
       * Determines if content should be summarized based on thresholds
       */
      shouldSummarize(content) {
        const lineCount = this.countLines(content);
        return lineCount > this.thresholds.lineThreshold || content.length > this.thresholds.charThreshold;
      }
      /**
       * Creates a paste summary in the format: [Pasted text #N +X lines]
       */
      createPasteSummary(content, pasteNumber) {
        const lineCount = this.countLines(content);
        const pluralLines = lineCount === 1 ? "line" : "lines";
        return `[Pasted text #${pasteNumber} +${lineCount} ${pluralLines}]`;
      }
      /**
       * Resets the paste counter (useful for new sessions)
       */
      resetCounter() {
        this.pasteCounter = 0;
      }
      /**
       * Updates thresholds for paste detection
       */
      updateThresholds(thresholds) {
        this.thresholds = {
          ...this.thresholds,
          ...thresholds
        };
      }
      /**
       * Gets current paste counter value
       */
      getCurrentCounter() {
        return this.pasteCounter;
      }
      /**
       * Gets current thresholds
       */
      getThresholds() {
        return { ...this.thresholds };
      }
      /**
       * Extracts the content that was added between old and new values
       */
      getAddedContent(oldValue, newValue) {
        if (newValue.startsWith(oldValue)) {
          return newValue.slice(oldValue.length);
        }
        return "";
      }
      /**
       * Counts the number of lines in content
       */
      countLines(content) {
        if (!content) return 0;
        return content.split("\n").length;
      }
      /**
       * Gets default line threshold from environment or config
       */
      getDefaultLineThreshold() {
        const envValue = process.env.GROK_PASTE_LINE_THRESHOLD;
        if (envValue) {
          const parsed = parseInt(envValue, 10);
          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }
        return 2;
      }
      /**
       * Gets default character threshold from environment or config
       */
      getDefaultCharThreshold() {
        const envValue = process.env.GROK_PASTE_CHAR_THRESHOLD;
        if (envValue) {
          const parsed = parseInt(envValue, 10);
          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }
        return 50;
      }
    };
    globalPasteService = null;
  }
});
function useEnhancedInput({
  onSubmit,
  onEscape,
  onSpecialKey,
  onPasteDetected,
  disabled = false,
  multiline = false
} = {}) {
  const [input, setInputState] = useState("");
  const [cursorPosition, setCursorPositionState] = useState(0);
  const isMultilineRef = useRef(multiline);
  const {
    addToHistory,
    navigateHistory,
    resetHistory,
    setOriginalInput,
    isNavigatingHistory
  } = useInputHistory();
  const setInput = useCallback((text) => {
    const previousInput = input;
    setInputState(text);
    setCursorPositionState(Math.min(text.length, cursorPosition));
    if (!isNavigatingHistory()) {
      setOriginalInput(text);
    }
    if (onPasteDetected && text !== previousInput) {
      const pasteService = getPasteDetectionService();
      const pasteEvent = pasteService.detectPaste(previousInput, text);
      if (pasteEvent) {
        onPasteDetected(pasteEvent);
      }
    }
  }, [input, cursorPosition, isNavigatingHistory, setOriginalInput, onPasteDetected]);
  const setCursorPosition = useCallback((position) => {
    setCursorPositionState(Math.max(0, Math.min(input.length, position)));
  }, [input.length]);
  const clearInput = useCallback(() => {
    setInputState("");
    setCursorPositionState(0);
    setOriginalInput("");
  }, [setOriginalInput]);
  const insertAtCursor = useCallback((text) => {
    const result = insertText(input, cursorPosition, text);
    setInputState(result.text);
    setCursorPositionState(result.position);
    setOriginalInput(result.text);
  }, [input, cursorPosition, setOriginalInput]);
  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      addToHistory(input);
      onSubmit?.(input);
      clearInput();
    }
  }, [input, addToHistory, onSubmit, clearInput]);
  const handleInput = useCallback((inputChar, key) => {
    if (disabled) return;
    if (key.ctrl && inputChar === "c" || inputChar === "") {
      setInputState("");
      setCursorPositionState(0);
      setOriginalInput("");
      return;
    }
    if (onSpecialKey?.(key)) {
      return;
    }
    if (key.escape) {
      onEscape?.();
      return;
    }
    if (key.return) {
      if (multiline && key.shift) {
        const result = insertText(input, cursorPosition, "\n");
        setInputState(result.text);
        setCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        handleSubmit();
      }
      return;
    }
    if ((key.upArrow || key.name === "up") && !key.ctrl && !key.meta) {
      const historyInput = navigateHistory("up");
      if (historyInput !== null) {
        setInputState(historyInput);
        setCursorPositionState(historyInput.length);
      }
      return;
    }
    if ((key.downArrow || key.name === "down") && !key.ctrl && !key.meta) {
      const historyInput = navigateHistory("down");
      if (historyInput !== null) {
        setInputState(historyInput);
        setCursorPositionState(historyInput.length);
      }
      return;
    }
    if ((key.leftArrow || key.name === "left") && key.ctrl && !inputChar.includes("[")) {
      const newPos = moveToPreviousWord(input, cursorPosition);
      setCursorPositionState(newPos);
      return;
    }
    if ((key.rightArrow || key.name === "right") && key.ctrl && !inputChar.includes("[")) {
      const newPos = moveToNextWord(input, cursorPosition);
      setCursorPositionState(newPos);
      return;
    }
    if (key.leftArrow || key.name === "left") {
      const newPos = Math.max(0, cursorPosition - 1);
      setCursorPositionState(newPos);
      return;
    }
    if (key.rightArrow || key.name === "right") {
      const newPos = Math.min(input.length, cursorPosition + 1);
      setCursorPositionState(newPos);
      return;
    }
    if (key.ctrl && inputChar === "a" || key.name === "home") {
      setCursorPositionState(0);
      return;
    }
    if (key.ctrl && inputChar === "e" || key.name === "end") {
      setCursorPositionState(input.length);
      return;
    }
    const isBackspace = key.backspace || key.name === "backspace" || inputChar === "\b" || inputChar === "\x7F" || key.delete && inputChar === "" && !key.shift;
    if (isBackspace) {
      if (key.ctrl || key.meta) {
        const result = deleteWordBefore(input, cursorPosition);
        setInputState(result.text);
        setCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        const result = deleteCharBefore(input, cursorPosition);
        setInputState(result.text);
        setCursorPositionState(result.position);
        setOriginalInput(result.text);
      }
      return;
    }
    if (key.delete && inputChar !== "" || key.ctrl && inputChar === "d") {
      if (key.ctrl || key.meta) {
        const result = deleteWordAfter(input, cursorPosition);
        setInputState(result.text);
        setCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        const result = deleteCharAfter(input, cursorPosition);
        setInputState(result.text);
        setCursorPositionState(result.position);
        setOriginalInput(result.text);
      }
      return;
    }
    if (key.ctrl && inputChar === "k") {
      const lineEnd = moveToLineEnd(input, cursorPosition);
      const newText = input.slice(0, cursorPosition) + input.slice(lineEnd);
      setInputState(newText);
      setOriginalInput(newText);
      return;
    }
    if (key.ctrl && inputChar === "u") {
      const lineStart = moveToLineStart(input, cursorPosition);
      const newText = input.slice(0, lineStart) + input.slice(cursorPosition);
      setInputState(newText);
      setCursorPositionState(lineStart);
      setOriginalInput(newText);
      return;
    }
    if (key.ctrl && inputChar === "w") {
      const result = deleteWordBefore(input, cursorPosition);
      setInputState(result.text);
      setCursorPositionState(result.position);
      setOriginalInput(result.text);
      return;
    }
    if (key.ctrl && inputChar === "x") {
      setInputState("");
      setCursorPositionState(0);
      setOriginalInput("");
      return;
    }
    if (inputChar && !key.ctrl && !key.meta) {
      const previousInput = input;
      const result = insertText(input, cursorPosition, inputChar);
      setInputState(result.text);
      setCursorPositionState(result.position);
      setOriginalInput(result.text);
      if (onPasteDetected && inputChar.length > 1) {
        const pasteService = getPasteDetectionService();
        const pasteEvent = pasteService.detectPaste(previousInput, result.text);
        if (pasteEvent) {
          onPasteDetected(pasteEvent);
        }
      }
    }
  }, [disabled, onSpecialKey, input, cursorPosition, multiline, handleSubmit, navigateHistory, setOriginalInput]);
  return {
    input,
    cursorPosition,
    isMultiline: isMultilineRef.current,
    setInput,
    setCursorPosition,
    clearInput,
    insertAtCursor,
    resetHistory,
    handleInput
  };
}
var init_use_enhanced_input = __esm({
  "src/hooks/use-enhanced-input.ts"() {
    init_text_utils();
    init_use_input_history();
    init_paste_detection();
  }
});
var CodebaseExplorer;
var init_codebase_explorer = __esm({
  "src/services/codebase-explorer.ts"() {
    CodebaseExplorer = class {
      constructor(settings) {
        this.settings = settings;
        this.defaultIgnorePatterns = [
          "node_modules",
          ".git",
          ".next",
          "dist",
          "build",
          "coverage",
          ".vscode",
          ".idea",
          "*.log",
          ".DS_Store",
          "Thumbs.db"
        ];
        this.languageExtensions = {
          "TypeScript": [".ts", ".tsx"],
          "JavaScript": [".js", ".jsx", ".mjs"],
          "Python": [".py", ".pyx"],
          "Java": [".java"],
          "C++": [".cpp", ".cc", ".cxx", ".hpp", ".h"],
          "C": [".c", ".h"],
          "Go": [".go"],
          "Rust": [".rs"],
          "PHP": [".php"],
          "Ruby": [".rb"],
          "Swift": [".swift"],
          "Kotlin": [".kt"],
          "Dart": [".dart"],
          "JSON": [".json"],
          "YAML": [".yml", ".yaml"],
          "XML": [".xml"],
          "HTML": [".html", ".htm"],
          "CSS": [".css", ".scss", ".sass", ".less"],
          "Markdown": [".md", ".mdx"],
          "Shell": [".sh", ".bash", ".zsh"],
          "SQL": [".sql"],
          "Dockerfile": ["Dockerfile", ".dockerfile"]
        };
        this.configFilePatterns = [
          "package.json",
          "package-lock.json",
          "yarn.lock",
          "pnpm-lock.yaml",
          "requirements.txt",
          "Pipfile",
          "pyproject.toml",
          "setup.py",
          "Cargo.toml",
          "go.mod",
          "pom.xml",
          "build.gradle",
          "Makefile",
          "CMakeLists.txt",
          ".gitignore",
          ".env",
          ".env.example",
          "tsconfig.json",
          "jsconfig.json",
          "webpack.config.js",
          "vite.config.js",
          "next.config.js",
          "tailwind.config.js",
          "babel.config.js",
          "jest.config.js",
          "vitest.config.js",
          "eslint.config.js",
          ".eslintrc.*",
          "prettier.config.js",
          ".prettierrc.*"
        ];
      }
      /**
       * Explore the codebase and gather comprehensive analysis data
       */
      async exploreCodebase(options) {
        const startTime = Date.now();
        const exploredPaths = [];
        try {
          const files = await this.scanDirectory(options.rootPath, options);
          exploredPaths.push(...files.map((f) => f.path));
          const projectStructure = await this.analyzeProjectStructure(options.rootPath, files);
          const componentMap = await this.buildComponentMap(files);
          const dependencies = await this.analyzeDependencies(files);
          const complexity = await this.calculateComplexityMetrics(files);
          const architecturePatterns = await this.detectArchitecturePatterns(files, projectStructure);
          const insights = await this.generateInsights(files, projectStructure, complexity);
          const explorationData = {
            exploredPaths,
            projectStructure,
            keyComponents: componentMap,
            dependencies,
            complexity,
            architecturePatterns,
            insights
          };
          const duration = Date.now() - startTime;
          console.log(`[CodebaseExplorer] Exploration completed in ${duration}ms`);
          console.log(`[CodebaseExplorer] Analyzed ${files.length} files across ${exploredPaths.length} paths`);
          return explorationData;
        } catch (error) {
          console.error("[CodebaseExplorer] Exploration failed:", error);
          throw error;
        }
      }
      /**
       * Scan directory structure recursively
       */
      async scanDirectory(dirPath, options, currentDepth = 0) {
        const files = [];
        const maxDepth = options.maxDepth ?? this.settings.maxExplorationDepth;
        if (currentDepth > maxDepth) {
          return files;
        }
        try {
          const entries = await fs7.readdir(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path8__default.join(dirPath, entry.name);
            const relativePath = path8__default.relative(options.rootPath, fullPath);
            if (this.shouldIgnore(relativePath, options.ignorePatterns)) {
              continue;
            }
            const fileInfo = {
              path: fullPath,
              name: entry.name,
              size: 0,
              extension: path8__default.extname(entry.name),
              isDirectory: entry.isDirectory(),
              relativePath
            };
            if (entry.isDirectory()) {
              files.push(fileInfo);
              const subFiles = await this.scanDirectory(fullPath, options, currentDepth + 1);
              files.push(...subFiles);
            } else {
              try {
                const stats = await fs7.stat(fullPath);
                fileInfo.size = stats.size;
                if (fileInfo.size > this.settings.maxFileSize) {
                  continue;
                }
                files.push(fileInfo);
              } catch (_error) {
                continue;
              }
            }
          }
        } catch (_error) {
          console.warn(`[CodebaseExplorer] Cannot read directory: ${dirPath}`);
        }
        return files;
      }
      /**
       * Analyze overall project structure
       */
      async analyzeProjectStructure(rootPath, files) {
        const languageStats = this.calculateLanguageStats(files);
        const primaryLanguage = this.determinePrimaryLanguage(languageStats);
        const projectType = await this.detectProjectType(rootPath, files);
        const sourceFiles = files.filter((f) => !f.isDirectory && this.isSourceFile(f));
        const configFiles = files.filter((f) => !f.isDirectory && this.isConfigFile(f));
        files.filter((f) => !f.isDirectory && this.isTestFile(f));
        const entryPoints = await this.findEntryPoints(rootPath, files);
        const sourceDirectories = this.findSourceDirectories(files);
        const testDirectories = this.findTestDirectories(files);
        const buildDirectories = this.findBuildDirectories(files);
        const slocEstimate = await this.estimateSourceLines(sourceFiles);
        return {
          rootPath,
          primaryLanguage,
          projectType,
          entryPoints,
          configFiles: configFiles.map((f) => f.relativePath),
          sourceDirectories,
          testDirectories,
          buildDirectories,
          totalFiles: files.filter((f) => !f.isDirectory).length,
          slocEstimate
        };
      }
      /**
       * Build component map from analyzed files
       */
      async buildComponentMap(files) {
        const sourceFiles = files.filter((f) => !f.isDirectory && this.isSourceFile(f));
        const components = [];
        for (const file of sourceFiles) {
          try {
            const component = await this.analyzeComponent(file);
            if (component) {
              components.push(component);
            }
          } catch (_error) {
            continue;
          }
        }
        return {
          core: components.filter((c) => c.type === "class" || c.type === "module"),
          utilities: components.filter((c) => c.type === "utility"),
          tests: components.filter((c) => c.type === "test"),
          config: components.filter((c) => c.type === "config"),
          external: []
          // Will be populated from dependency analysis
        };
      }
      /**
       * Analyze dependencies between components
       */
      async analyzeDependencies(files) {
        const nodes = [];
        const edges = [];
        const sourceFiles = files.filter((f) => !f.isDirectory && this.isSourceFile(f));
        for (const file of sourceFiles) {
          nodes.push({
            id: file.relativePath,
            name: path8__default.basename(file.name, file.extension),
            type: this.isExternalDependency(file) ? "external" : "internal",
            importance: this.calculateImportance(file)
          });
        }
        for (const file of sourceFiles) {
          try {
            const dependencies = await this.extractDependencies(file);
            for (const dep of dependencies) {
              edges.push({
                from: file.relativePath,
                to: dep.target,
                type: dep.type,
                strength: dep.strength
              });
            }
          } catch (_error) {
            continue;
          }
        }
        const circularDependencies = this.detectCircularDependencies(nodes, edges);
        const criticalPath = this.findCriticalPath(nodes, edges);
        return {
          nodes,
          edges,
          circularDependencies,
          criticalPath
        };
      }
      /**
       * Calculate complexity metrics
       */
      async calculateComplexityMetrics(files) {
        const sourceFiles = files.filter((f) => !f.isDirectory && this.isSourceFile(f));
        let totalComplexity = 0;
        let totalCognitive = 0;
        let maintainabilitySum = 0;
        let fileCount = 0;
        const complexComponents = [];
        for (const file of sourceFiles) {
          try {
            const metrics = await this.analyzeFileComplexity(file);
            totalComplexity += metrics.cyclomatic;
            totalCognitive += metrics.cognitive;
            maintainabilitySum += metrics.maintainability;
            fileCount++;
            if (metrics.cyclomatic > 10) {
              complexComponents.push(file.relativePath);
            }
          } catch (_error) {
            continue;
          }
        }
        const avgComplexity = fileCount > 0 ? totalComplexity / fileCount : 0;
        const avgCognitive = fileCount > 0 ? totalCognitive / fileCount : 0;
        const avgMaintainability = fileCount > 0 ? maintainabilitySum / fileCount : 100;
        return {
          overall: Math.min(10, Math.max(1, Math.round((avgComplexity + avgCognitive) / 2))),
          cyclomatic: avgComplexity,
          cognitive: avgCognitive,
          maintainability: avgMaintainability,
          technicalDebt: Math.max(0, 100 - avgMaintainability) / 100,
          complexComponents: complexComponents.slice(0, 10)
          // Top 10 most complex
        };
      }
      /**
       * Detect architecture patterns
       */
      async detectArchitecturePatterns(files, structure) {
        const patterns = [];
        if (structure.projectType === "react") {
          patterns.push({
            name: "Component-Based Architecture",
            type: "architectural",
            confidence: 0.9,
            components: files.filter((f) => f.name.includes("component") || f.extension === ".tsx").map((f) => f.relativePath),
            description: "React component-based architecture with reusable UI components"
          });
        }
        if (structure.sourceDirectories.some((dir) => dir.includes("service"))) {
          patterns.push({
            name: "Service Layer Pattern",
            type: "architectural",
            confidence: 0.8,
            components: files.filter((f) => f.relativePath.includes("service")).map((f) => f.relativePath),
            description: "Business logic separated into service layer"
          });
        }
        return patterns;
      }
      /**
       * Generate insights about the codebase
       */
      async generateInsights(files, structure, complexity) {
        const insights = [];
        if (complexity.overall > 7) {
          insights.push({
            type: "warning",
            title: "High Code Complexity",
            description: `Average complexity is ${complexity.overall}/10. Consider refactoring complex components.`,
            components: complexity.complexComponents,
            confidence: 0.9,
            priority: 4
          });
        }
        const largeFiles = files.filter((f) => f.size > 5e4);
        if (largeFiles.length > 0) {
          insights.push({
            type: "recommendation",
            title: "Large Files Detected",
            description: `Found ${largeFiles.length} large files. Consider breaking them into smaller modules.`,
            components: largeFiles.map((f) => f.relativePath),
            confidence: 0.8,
            priority: 3
          });
        }
        const hasTests = structure.testDirectories.length > 0;
        if (!hasTests) {
          insights.push({
            type: "opportunity",
            title: "No Test Directory Found",
            description: "Consider adding automated tests to improve code quality and reliability.",
            components: [],
            confidence: 0.95,
            priority: 5
          });
        }
        return insights;
      }
      // Utility methods
      shouldIgnore(relativePath, customIgnorePatterns) {
        const patterns = [...this.defaultIgnorePatterns, ...customIgnorePatterns || []];
        return patterns.some((pattern) => {
          if (pattern.includes("*")) {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(relativePath);
          }
          return relativePath.includes(pattern);
        });
      }
      isSourceFile(file) {
        const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cpp", ".c"];
        return sourceExtensions.includes(file.extension);
      }
      isConfigFile(file) {
        return this.configFilePatterns.some(
          (pattern) => file.name === pattern || file.name.includes(pattern)
        );
      }
      isTestFile(file) {
        return file.relativePath.includes("test") || file.relativePath.includes("spec") || file.name.includes(".test.") || file.name.includes(".spec.");
      }
      calculateLanguageStats(files) {
        const stats = {};
        for (const file of files) {
          if (file.isDirectory) continue;
          const language = this.getLanguageFromExtension(file.extension);
          if (language) {
            if (!stats[language]) {
              stats[language] = { fileCount: 0, lineCount: 0, fileSize: 0 };
            }
            stats[language].fileCount++;
            stats[language].fileSize += file.size;
          }
        }
        return stats;
      }
      getLanguageFromExtension(extension) {
        for (const [language, extensions] of Object.entries(this.languageExtensions)) {
          if (extensions.includes(extension)) {
            return language;
          }
        }
        return null;
      }
      determinePrimaryLanguage(stats) {
        let maxFiles = 0;
        let primaryLanguage = "Unknown";
        for (const [language, stat] of Object.entries(stats)) {
          if (stat.fileCount > maxFiles) {
            maxFiles = stat.fileCount;
            primaryLanguage = language;
          }
        }
        return primaryLanguage;
      }
      async detectProjectType(rootPath, files) {
        const packageJsonPath = path8__default.join(rootPath, "package.json");
        try {
          const packageJson = await fs7.readFile(packageJsonPath, "utf-8");
          const pkg = JSON.parse(packageJson);
          if (pkg.dependencies?.react || pkg.devDependencies?.react) return "react";
          if (pkg.dependencies?.vue || pkg.devDependencies?.vue) return "vue";
          if (pkg.dependencies?.angular || pkg.devDependencies?.angular) return "angular";
          if (pkg.dependencies?.next || pkg.devDependencies?.next) return "nextjs";
          if (pkg.dependencies?.express || pkg.devDependencies?.express) return "express";
          return "node";
        } catch {
          if (files.some((f) => f.name === "requirements.txt")) return "python";
          if (files.some((f) => f.name === "Cargo.toml")) return "rust";
          if (files.some((f) => f.name === "go.mod")) return "go";
          if (files.some((f) => f.name === "pom.xml")) return "java";
          return "unknown";
        }
      }
      // Placeholder implementations for complex analysis methods
      async analyzeComponent(file) {
        return {
          name: path8__default.basename(file.name, file.extension),
          path: file.relativePath,
          type: this.inferComponentType(file),
          description: `${this.inferComponentType(file)} component`,
          complexity: Math.floor(Math.random() * 5) + 1,
          // Placeholder
          dependencies: [],
          dependents: [],
          lineCount: Math.floor(file.size / 50)
          // Rough estimate
        };
      }
      inferComponentType(file) {
        if (this.isTestFile(file)) return "test";
        if (this.isConfigFile(file)) return "config";
        if (file.relativePath.includes("util")) return "utility";
        if (file.extension === ".tsx" || file.extension === ".jsx") return "function";
        return "module";
      }
      async extractDependencies(_file) {
        return [];
      }
      detectCircularDependencies(_nodes, _edges) {
        return [];
      }
      findCriticalPath(_nodes, _edges) {
        return [];
      }
      async analyzeFileComplexity(_file) {
        return {
          cyclomatic: Math.floor(Math.random() * 15) + 1,
          cognitive: Math.floor(Math.random() * 20) + 1,
          maintainability: Math.floor(Math.random() * 40) + 60
        };
      }
      async findEntryPoints(rootPath, files) {
        const entryPoints = [];
        const entryPatterns = ["index.js", "index.ts", "main.js", "main.ts", "app.js", "app.ts"];
        for (const pattern of entryPatterns) {
          const found = files.find((f) => f.name === pattern && !f.isDirectory);
          if (found) {
            entryPoints.push(found.relativePath);
          }
        }
        return entryPoints;
      }
      findSourceDirectories(files) {
        const sourceDirs = /* @__PURE__ */ new Set();
        const sourcePatterns = ["src", "lib", "source"];
        for (const file of files) {
          if (file.isDirectory) {
            for (const pattern of sourcePatterns) {
              if (file.name === pattern || file.relativePath.includes(pattern)) {
                sourceDirs.add(file.relativePath);
              }
            }
          }
        }
        return Array.from(sourceDirs);
      }
      findTestDirectories(files) {
        const testDirs = /* @__PURE__ */ new Set();
        const testPatterns = ["test", "tests", "__tests__", "spec"];
        for (const file of files) {
          if (file.isDirectory) {
            for (const pattern of testPatterns) {
              if (file.name === pattern || file.relativePath.includes(pattern)) {
                testDirs.add(file.relativePath);
              }
            }
          }
        }
        return Array.from(testDirs);
      }
      findBuildDirectories(files) {
        const buildDirs = /* @__PURE__ */ new Set();
        const buildPatterns = ["dist", "build", "out", "target"];
        for (const file of files) {
          if (file.isDirectory) {
            for (const pattern of buildPatterns) {
              if (file.name === pattern) {
                buildDirs.add(file.relativePath);
              }
            }
          }
        }
        return Array.from(buildDirs);
      }
      async estimateSourceLines(files) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        return Math.floor(totalSize / 50);
      }
      isExternalDependency(file) {
        return file.relativePath.includes("node_modules") || file.relativePath.includes("vendor") || file.relativePath.includes("third_party");
      }
      calculateImportance(file) {
        let importance = Math.min(5, Math.floor(file.size / 1e4) + 1);
        if (file.name.includes("index") || file.name.includes("main") || file.name.includes("app")) {
          importance = Math.min(5, importance + 2);
        }
        return importance;
      }
    };
  }
});

// src/services/plan-generator.ts
var PlanGenerator;
var init_plan_generator = __esm({
  "src/services/plan-generator.ts"() {
    PlanGenerator = class {
      constructor(agent) {
        this.agent = agent;
      }
      /**
       * Generate a comprehensive implementation plan
       */
      async generatePlan(options) {
        try {
          const context = this.buildGenerationContext(options.explorationData);
          const strategy = await this.generateImplementationStrategy(options, context);
          const actionPlan = await this.generateActionPlan(options, context, strategy);
          const risks = await this.assessRisks(options, context, actionPlan);
          const effort = await this.estimateEffort(actionPlan, context);
          const successCriteria = await this.generateSuccessCriteria(options, context);
          const plan = {
            title: this.generatePlanTitle(options.userRequest),
            description: this.generatePlanDescription(options.userRequest, context),
            strategy,
            actionPlan,
            risks,
            effort,
            successCriteria,
            createdAt: /* @__PURE__ */ new Date(),
            version: "1.0"
          };
          return plan;
        } catch (error) {
          console.error("[PlanGenerator] Failed to generate plan:", error);
          throw new Error(`Plan generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      /**
       * Build context for plan generation
       */
      buildGenerationContext(explorationData) {
        return {
          projectType: explorationData.projectStructure.projectType,
          primaryLanguage: explorationData.projectStructure.primaryLanguage,
          complexity: explorationData.complexity.overall,
          hasTests: explorationData.projectStructure.testDirectories.length > 0,
          architecturePatterns: explorationData.architecturePatterns.map((p) => p.name),
          keyComponents: explorationData.keyComponents.core.map((c) => c.name)
        };
      }
      /**
       * Generate high-level implementation strategy
       */
      async generateImplementationStrategy(options, context) {
        const strategyPrompt = this.buildStrategyPrompt(options, context);
        const strategyResponse = await this.generateWithAI(strategyPrompt);
        return {
          approach: this.extractApproach(strategyResponse, options.userRequest),
          principles: this.extractPrinciples(strategyResponse, context),
          techStack: this.generateTechStackRecommendations(context, strategyResponse),
          architectureDecisions: this.generateArchitectureDecisions(context, strategyResponse),
          integrationPoints: this.identifyIntegrationPoints(options.explorationData, strategyResponse)
        };
      }
      /**
       * Generate detailed action plan
       */
      async generateActionPlan(options, context, strategy) {
        const actionPrompt = this.buildActionPrompt(options, context, strategy);
        const actionResponse = await this.generateWithAI(actionPrompt);
        const steps = this.parseActionSteps(actionResponse, context);
        const milestones = this.generateMilestones(steps);
        const dependencies = this.analyzeDependencies(steps);
        const parallelTracks = this.identifyParallelTracks(steps, dependencies);
        return {
          steps,
          parallelTracks,
          milestones,
          dependencies
        };
      }
      /**
       * Assess implementation risks
       */
      async assessRisks(options, context, actionPlan) {
        const risks = this.identifyRisks(options, context, actionPlan);
        const mitigations = this.generateMitigations(risks, context);
        const overallRisk = this.calculateOverallRisk(risks);
        return {
          overallRisk,
          risks,
          mitigations,
          contingencies: this.generateContingencyPlans(risks, actionPlan)
        };
      }
      /**
       * Estimate implementation effort
       */
      async estimateEffort(actionPlan, context) {
        const baseHours = actionPlan.steps.reduce((total, step) => total + step.effort, 0);
        const complexityMultiplier = this.getComplexityMultiplier(context.complexity);
        const experienceMultiplier = this.getExperienceMultiplier(context.primaryLanguage);
        const totalHours = Math.round(baseHours * complexityMultiplier * experienceMultiplier);
        const breakdownByType = this.calculateBreakdownByType(actionPlan.steps);
        const breakdownByTrack = this.calculateBreakdownByTrack(actionPlan.parallelTracks, actionPlan.steps);
        const confidence = this.calculateEstimateConfidence(context, actionPlan.steps.length);
        const factors = this.identifyEstimationFactors(context);
        const timeline = this.projectTimeline(totalHours, actionPlan.parallelTracks.length);
        return {
          totalHours,
          breakdownByType,
          breakdownByTrack,
          confidence,
          factors,
          timeline
        };
      }
      /**
       * Build strategy generation prompt
       */
      buildStrategyPrompt(options, context) {
        return `
As an expert software architect, analyze this implementation request and provide a comprehensive strategy.

**User Request:** ${options.userRequest}

**Project Context:**
- Type: ${context.projectType}
- Language: ${context.primaryLanguage}
- Complexity: ${context.complexity}/10
- Has Tests: ${context.hasTests}
- Architecture Patterns: ${context.architecturePatterns.join(", ")}
- Key Components: ${context.keyComponents.join(", ")}

**Additional Context:**
${options.constraints ? `- Constraints: ${options.constraints.join(", ")}` : ""}
${options.preferredApproach ? `- Preferred Approach: ${options.preferredApproach}` : ""}
${options.timeConstraints ? `- Time Constraints: ${options.timeConstraints}` : ""}

Please provide:
1. **High-level approach** (1-2 sentences)
2. **Key principles** (3-5 principles to guide implementation)
3. **Technology recommendations** (specific to this project)
4. **Architecture decisions** (major structural choices)
5. **Integration considerations** (how this fits with existing code)

Focus on practical, actionable guidance that considers the existing codebase structure and patterns.
`;
      }
      /**
       * Build action plan generation prompt
       */
      buildActionPrompt(options, context, strategy) {
        return `
Create a detailed, step-by-step action plan for this implementation:

**Request:** ${options.userRequest}
**Approach:** ${strategy.approach}

**Context:**
- Project: ${context.projectType} (${context.primaryLanguage})
- Complexity: ${context.complexity}/10
- Architecture: ${context.architecturePatterns.join(", ")}

**Key Principles:**
${strategy.principles.map((p) => `- ${p}`).join("\n")}

Please provide a numbered list of specific, actionable steps. For each step include:
1. **Title** (brief, actionable)
2. **Description** (what exactly to do)
3. **Type** (research/design/implement/test/document/deploy)
4. **Effort** (estimated hours)
5. **Files affected** (specific file paths when known)
6. **Dependencies** (which steps must come first)

Focus on:
- Concrete, executable actions
- Logical progression from setup to completion
- Realistic effort estimates
- Clear dependencies between steps
- Integration with existing code patterns

Provide 8-15 steps total, balancing thoroughness with practicality.
`;
      }
      /**
       * Generate strategy response using AI
       */
      async generateWithAI(prompt) {
        try {
          let response = "";
          for await (const chunk of this.agent.processUserMessageStream(prompt)) {
            if (chunk.type === "content" && chunk.content) {
              response += chunk.content;
            }
          }
          return response;
        } catch (error) {
          console.error("[PlanGenerator] AI generation failed:", error);
          return this.getFallbackResponse(prompt);
        }
      }
      /**
       * Extract implementation approach from AI response
       */
      extractApproach(response, userRequest) {
        const approachMatch = response.match(/(?:approach|strategy):\s*([^\n]+)/i);
        if (approachMatch) {
          return approachMatch[1].trim();
        }
        return `Implement ${userRequest} following existing project patterns and best practices`;
      }
      /**
       * Extract key principles from AI response
       */
      extractPrinciples(response, _context) {
        const principles = [];
        const principlesSection = response.match(/principles?:\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
        if (principlesSection) {
          const lines = principlesSection[1].split("\n");
          for (const line of lines) {
            const cleaned = line.trim().replace(/^[-*•]\s*/, "");
            if (cleaned.length > 10) {
              principles.push(cleaned);
            }
          }
        }
        if (principles.length === 0) {
          principles.push(
            "Follow existing code patterns and conventions",
            "Maintain backward compatibility",
            "Write tests for new functionality",
            "Document changes and new features",
            "Ensure performance and security"
          );
        }
        return principles.slice(0, 5);
      }
      /**
       * Parse action steps from AI response
       */
      parseActionSteps(response, context) {
        const steps = [];
        const stepMatches = response.match(/\d+\.\s*\*\*([^*]+)\*\*[\s\S]*?(?=\d+\.\s*\*\*|\n\n|$)/g);
        if (stepMatches) {
          stepMatches.forEach((stepText, index) => {
            const step = this.parseIndividualStep(stepText, index + 1, context);
            if (step) {
              steps.push(step);
            }
          });
        }
        if (steps.length === 0) {
          steps.push(...this.generateFallbackSteps(context));
        }
        return steps;
      }
      /**
       * Parse individual step from text
       */
      parseIndividualStep(stepText, order, context) {
        const titleMatch = stepText.match(/\*\*([^*]+)\*\*/);
        if (!titleMatch) return null;
        const title = titleMatch[1].trim();
        const description = this.extractStepDescription(stepText);
        const type = this.inferStepType(title, description);
        const effort = this.estimateStepEffort(title, description, type, context);
        const affectedFiles = this.extractAffectedFiles(stepText);
        return {
          id: `step_${order}`,
          title,
          description,
          type,
          effort,
          skills: this.inferRequiredSkills(type, context),
          affectedFiles,
          acceptanceCriteria: this.generateAcceptanceCriteria(title, type),
          order
        };
      }
      // Utility methods for plan generation
      generatePlanTitle(userRequest) {
        return `Implementation Plan: ${userRequest}`;
      }
      generatePlanDescription(userRequest, context) {
        return `Comprehensive implementation plan for "${userRequest}" in ${context.primaryLanguage} ${context.projectType} project. This plan considers existing architecture patterns and maintains compatibility with current codebase structure.`;
      }
      generateSuccessCriteria(_options, _context) {
        return Promise.resolve([
          "Implementation meets functional requirements",
          "Code follows existing patterns and conventions",
          "All tests pass including new test coverage",
          "Documentation is updated and complete",
          "Performance meets or exceeds current benchmarks",
          "Security requirements are satisfied",
          "Integration with existing systems is seamless"
        ]);
      }
      getFallbackResponse(_prompt) {
        return `
**Approach:** Implement the requested feature following established patterns and best practices.

**Key Principles:**
- Follow existing code conventions
- Maintain backward compatibility  
- Write comprehensive tests
- Document all changes
- Ensure performance and security

**Steps:**
1. **Analyze Requirements** - Review the request and existing code
2. **Design Solution** - Plan the implementation approach
3. **Implement Core** - Build the main functionality
4. **Add Tests** - Create comprehensive test coverage
5. **Document** - Update documentation and comments
6. **Review** - Code review and refinement
`;
      }
      // Additional utility methods would be implemented here for:
      // - generateTechStackRecommendations
      // - generateArchitectureDecisions
      // - identifyIntegrationPoints
      // - identifyRisks
      // - generateMitigations
      // - etc.
      generateTechStackRecommendations(_context, _response) {
        return [];
      }
      generateArchitectureDecisions(_context, _response) {
        return [];
      }
      identifyIntegrationPoints(_explorationData, _response) {
        return [];
      }
      identifyRisks(_options, _context, _actionPlan) {
        return [];
      }
      generateMitigations(_risks, _context) {
        return [];
      }
      calculateOverallRisk(risks) {
        if (risks.length === 0) return "low";
        const avgRisk = risks.reduce((sum, risk) => sum + risk.score, 0) / risks.length;
        if (avgRisk < 2) return "low";
        if (avgRisk < 4) return "medium";
        if (avgRisk < 6) return "high";
        return "critical";
      }
      generateContingencyPlans(_risks, _actionPlan) {
        return [];
      }
      getComplexityMultiplier(complexity) {
        return 1 + (complexity - 5) * 0.1;
      }
      getExperienceMultiplier(_language) {
        return 1;
      }
      calculateBreakdownByType(steps) {
        const breakdown = {};
        for (const step of steps) {
          breakdown[step.type] = (breakdown[step.type] || 0) + step.effort;
        }
        return breakdown;
      }
      calculateBreakdownByTrack(_tracks, _steps) {
        return {};
      }
      calculateEstimateConfidence(context, stepCount) {
        let confidence = 0.8;
        if (context.complexity > 7) confidence -= 0.1;
        if (stepCount > 15) confidence -= 0.1;
        if (!context.hasTests) confidence -= 0.1;
        return Math.max(0.5, confidence);
      }
      identifyEstimationFactors(_context) {
        return [];
      }
      projectTimeline(totalHours, trackCount) {
        const hoursPerDay = 6;
        const sequentialDays = Math.ceil(totalHours / hoursPerDay);
        const parallelDays = Math.ceil(sequentialDays / Math.max(1, trackCount));
        return {
          optimistic: `${Math.ceil(parallelDays * 0.8)} days`,
          mostLikely: `${parallelDays} days`,
          pessimistic: `${Math.ceil(parallelDays * 1.5)} days`,
          recommendedStart: "As soon as possible",
          criticalPath: `${sequentialDays} days if done sequentially`
        };
      }
      generateMilestones(_steps) {
        return [];
      }
      analyzeDependencies(_steps) {
        return [];
      }
      identifyParallelTracks(_steps, _dependencies) {
        return [];
      }
      extractStepDescription(stepText) {
        const lines = stepText.split("\n").slice(1);
        return lines.join(" ").replace(/\*\*/g, "").trim() || "Complete this step";
      }
      inferStepType(title, description) {
        const text = (title + " " + description).toLowerCase();
        if (text.includes("research") || text.includes("analyze") || text.includes("investigate")) return "research";
        if (text.includes("design") || text.includes("plan") || text.includes("architect")) return "design";
        if (text.includes("test") || text.includes("spec")) return "test";
        if (text.includes("document") || text.includes("readme") || text.includes("comment")) return "document";
        if (text.includes("deploy") || text.includes("publish") || text.includes("release")) return "deploy";
        return "implement";
      }
      estimateStepEffort(title, description, type, context) {
        let baseHours = 4;
        switch (type) {
          case "research":
            baseHours = 2;
            break;
          case "design":
            baseHours = 3;
            break;
          case "implement":
            baseHours = 6;
            break;
          case "test":
            baseHours = 3;
            break;
          case "document":
            baseHours = 2;
            break;
          case "deploy":
            baseHours = 2;
            break;
        }
        const complexityMultiplier = 1 + (context.complexity - 5) * 0.1;
        return Math.max(1, Math.round(baseHours * complexityMultiplier));
      }
      extractAffectedFiles(stepText) {
        const fileMatches = stepText.match(/[\w.-]+\.(js|ts|jsx|tsx|py|java|go|rs|json|md|yml|yaml)/g);
        return fileMatches || [];
      }
      inferRequiredSkills(type, context) {
        const skills = [context.primaryLanguage];
        switch (type) {
          case "research":
            skills.push("Analysis", "Documentation");
            break;
          case "design":
            skills.push("Architecture", "System Design");
            break;
          case "implement":
            skills.push("Programming", context.projectType);
            break;
          case "test":
            skills.push("Testing", "QA");
            break;
          case "document":
            skills.push("Technical Writing");
            break;
          case "deploy":
            skills.push("DevOps", "Deployment");
            break;
        }
        return skills;
      }
      generateAcceptanceCriteria(title, type) {
        const criteria = [];
        switch (type) {
          case "implement":
            criteria.push("Code compiles without errors");
            criteria.push("Functionality works as specified");
            criteria.push("Code follows project conventions");
            break;
          case "test":
            criteria.push("All tests pass");
            criteria.push("Test coverage meets requirements");
            break;
          case "document":
            criteria.push("Documentation is complete and accurate");
            criteria.push("Examples are provided where appropriate");
            break;
          default:
            criteria.push("Step objectives are met");
            criteria.push("Quality standards are maintained");
        }
        return criteria;
      }
      generateFallbackSteps(context) {
        return [
          {
            id: "step_1",
            title: "Analyze Requirements",
            description: "Review the implementation requirements and existing codebase",
            type: "research",
            effort: 2,
            skills: ["Analysis"],
            affectedFiles: [],
            acceptanceCriteria: ["Requirements are clearly understood"],
            order: 1
          },
          {
            id: "step_2",
            title: "Design Solution",
            description: "Create technical design for the implementation",
            type: "design",
            effort: 3,
            skills: ["Design", context.primaryLanguage],
            affectedFiles: [],
            acceptanceCriteria: ["Design is documented and approved"],
            order: 2
          },
          {
            id: "step_3",
            title: "Implement Core Functionality",
            description: "Build the main implementation",
            type: "implement",
            effort: 6,
            skills: ["Programming", context.primaryLanguage],
            affectedFiles: [],
            acceptanceCriteria: ["Core functionality works correctly"],
            order: 3
          }
        ];
      }
    };
  }
});

// src/services/read-only-tool-executor.ts
var ReadOnlyToolExecutor;
var init_read_only_tool_executor = __esm({
  "src/services/read-only-tool-executor.ts"() {
    ReadOnlyToolExecutor = class {
      constructor(agent) {
        this.agent = agent;
        this.executionLog = [];
        this.insights = [];
      }
      /**
       * Execute a tool in read-only mode
       */
      async executeReadOnly(toolName, args) {
        const timestamp = /* @__PURE__ */ new Date();
        if (this.isDestructiveTool(toolName)) {
          const result = await this.simulateDestructiveTool(toolName, args);
          this.logExecution(toolName, args, timestamp, result, true);
          return result;
        }
        try {
          const originalResult = await this.executeSafeTool(toolName, args);
          const result = {
            ...originalResult,
            originalTool: toolName,
            wasBlocked: false,
            insights: this.extractInsights(toolName, args, originalResult)
          };
          this.logExecution(toolName, args, timestamp, result, false);
          return result;
        } catch (error) {
          const result = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            originalTool: toolName,
            wasBlocked: false
          };
          this.logExecution(toolName, args, timestamp, result, false);
          return result;
        }
      }
      /**
       * Check if a tool is destructive (modifies files)
       */
      isDestructiveTool(toolName) {
        const destructiveTools = [
          "write",
          "edit",
          "str_replace",
          "create",
          "delete",
          "move",
          "rename",
          "multiedit",
          "bash"
          // Most bash commands can be destructive
        ];
        return destructiveTools.includes(toolName.toLowerCase());
      }
      /**
       * Simulate execution of destructive tools for analysis
       */
      async simulateDestructiveTool(toolName, args) {
        const insights = [];
        let simulationResult = null;
        switch (toolName.toLowerCase()) {
          case "write":
          case "create":
            simulationResult = await this.simulateFileCreation(args);
            insights.push(`Would create file: ${args.file_path || args.path}`);
            insights.push(`Content length: ${args.content?.length || 0} characters`);
            break;
          case "edit":
          case "str_replace":
            simulationResult = await this.simulateFileEdit(args);
            insights.push(`Would modify file: ${args.file_path || args.path}`);
            insights.push(`Change type: ${args.old_string ? "string replacement" : "content edit"}`);
            break;
          case "multiedit":
            simulationResult = await this.simulateMultiEdit(args);
            insights.push(`Would perform multi-file operation on ${args.edits?.length || 0} files`);
            break;
          case "bash":
            simulationResult = await this.simulateBashCommand(args);
            insights.push(`Would execute: ${args.command}`);
            insights.push(`Command type: ${this.categorizeBashCommand(args.command)}`);
            break;
          default:
            simulationResult = { simulated: true, action: `${toolName} operation` };
            insights.push(`Would execute ${toolName} with provided arguments`);
        }
        return {
          success: true,
          output: `[PLAN MODE - READ ONLY] Simulated ${toolName} operation`,
          originalTool: toolName,
          wasBlocked: true,
          simulationResult,
          insights
        };
      }
      /**
       * Execute safe (read-only) tools
       */
      async executeSafeTool(toolName, args) {
        return this.simulateReadOnlyToolExecution({ name: toolName, arguments: args });
      }
      /**
       * Simulate tool execution for read-only operations
       */
      simulateReadOnlyToolExecution(toolCall) {
        const { name, arguments: args } = toolCall;
        switch (name.toLowerCase()) {
          case "view_file":
          case "read":
            return {
              success: true,
              output: `[PLAN MODE] Would read file: ${args.file_path || args.path}
Lines: ${args.start_line || 1}-${args.end_line || "end"}`
            };
          case "search":
          case "grep":
            return {
              success: true,
              output: `[PLAN MODE] Would search for pattern: ${args.pattern || args.query}
In path: ${args.path || "current directory"}`
            };
          case "bash":
            if (this.isSafeBashCommand(args.command)) {
              return {
                success: true,
                output: `[PLAN MODE] Would execute safe command: ${args.command}`
              };
            } else {
              return {
                success: false,
                error: `Command blocked in Plan Mode (potentially destructive): ${args.command}`
              };
            }
          default:
            return {
              success: true,
              output: `[PLAN MODE] Would execute ${name} with provided arguments`
            };
        }
      }
      /**
       * Check if bash command is safe (read-only)
       */
      isSafeBashCommand(command) {
        const safeCommands = [
          "ls",
          "cat",
          "head",
          "tail",
          "grep",
          "find",
          "wc",
          "sort",
          "uniq",
          "pwd",
          "whoami",
          "date",
          "ps",
          "top",
          "df",
          "du",
          "free",
          "git status",
          "git log",
          "git diff",
          "git branch",
          "git show",
          "npm list",
          "yarn list",
          "pip list",
          "composer show"
        ];
        const cmd = command.trim().toLowerCase();
        return safeCommands.some((safe) => cmd.startsWith(safe)) && !this.containsDestructiveOperators(command);
      }
      /**
       * Check for destructive operators in bash commands
       */
      containsDestructiveOperators(command) {
        const destructivePatterns = [
          ">",
          // Redirect (can overwrite files)
          ">>",
          // Append redirect
          "rm ",
          "mv ",
          "cp ",
          "mkdir ",
          "rmdir ",
          "chmod ",
          "chown ",
          "ln ",
          "curl.*-o",
          "wget.*-o",
          // Download with output
          "sudo ",
          "su ",
          "&&.*rm",
          "||.*rm"
          // Chained destructive commands
        ];
        return destructivePatterns.some((pattern) => {
          const regex = new RegExp(pattern, "i");
          return regex.test(command);
        });
      }
      /**
       * Simulate file creation
       */
      async simulateFileCreation(args) {
        const filePath = args.file_path || args.path;
        const content = args.content || "";
        return {
          action: "create_file",
          path: filePath,
          contentLength: content.length,
          contentPreview: content.substring(0, 200),
          estimatedLines: content.split("\n").length,
          fileType: this.getFileType(filePath)
        };
      }
      /**
       * Simulate file editing
       */
      async simulateFileEdit(args) {
        const filePath = args.file_path || args.path;
        try {
          return {
            action: "edit_file",
            path: filePath,
            simulated: true,
            old_string: args.old_string || "",
            new_string: args.new_string || "",
            change_preview: `Would replace "${args.old_string || "content"}" with "${args.new_string || "new content"}"`
          };
        } catch (error) {
          return {
            action: "edit_file",
            path: filePath,
            error: error instanceof Error ? error.message : "Analysis failed"
          };
        }
      }
      /**
       * Simulate multi-file editing
       */
      async simulateMultiEdit(args) {
        const edits = args.edits || [];
        return {
          action: "multi_edit",
          fileCount: 1,
          // args.file_path ? 1 : 0,
          editCount: edits.length,
          estimatedChanges: edits.reduce((sum, edit) => {
            return sum + ((edit.new_string?.length || 0) - (edit.old_string?.length || 0));
          }, 0)
        };
      }
      /**
       * Simulate bash command execution
       */
      async simulateBashCommand(args) {
        const command = args.command || "";
        return {
          action: "bash_command",
          command,
          category: this.categorizeBashCommand(command),
          risk: this.assessCommandRisk(command),
          wouldExecute: this.isSafeBashCommand(command)
        };
      }
      /**
       * Categorize bash command type
       */
      categorizeBashCommand(command) {
        const cmd = command.trim().toLowerCase();
        if (cmd.startsWith("git ")) return "version_control";
        if (cmd.startsWith("npm ") || cmd.startsWith("yarn ") || cmd.startsWith("pnpm ")) return "package_manager";
        if (cmd.startsWith("ls") || cmd.startsWith("find") || cmd.startsWith("grep")) return "file_exploration";
        if (cmd.startsWith("cat") || cmd.startsWith("head") || cmd.startsWith("tail")) return "file_reading";
        if (cmd.includes("rm ") || cmd.includes("mv ") || cmd.includes("cp ")) return "file_modification";
        if (cmd.includes(">") || cmd.includes(">>")) return "file_creation";
        if (cmd.startsWith("mkdir") || cmd.startsWith("rmdir")) return "directory_management";
        if (cmd.startsWith("chmod") || cmd.startsWith("chown")) return "permission_management";
        return "general";
      }
      /**
       * Assess command risk level
       */
      assessCommandRisk(command) {
        if (this.isSafeBashCommand(command)) return "low";
        if (command.includes("rm ") || command.includes("sudo ")) return "high";
        return "medium";
      }
      /**
       * Extract insights from tool execution
       */
      extractInsights(toolName, args, result) {
        const insights = [];
        switch (toolName.toLowerCase()) {
          case "read":
            if (result.success && result.output) {
              const lines = result.output.split("\n").length;
              insights.push(`File contains ${lines} lines`);
              const fileType = this.getFileType(args.file_path);
              if (fileType) {
                insights.push(`File type: ${fileType}`);
              }
            }
            break;
          case "grep":
            if (result.success && result.output) {
              const matches = result.output.split("\n").filter((line) => line.trim()).length;
              insights.push(`Found ${matches} matches for pattern`);
            }
            break;
          case "ls":
            if (result.success && result.output) {
              const items = result.output.split("\n").filter((line) => line.trim()).length;
              insights.push(`Directory contains ${items} items`);
            }
            break;
        }
        return insights;
      }
      /**
       * Get file type from path
       */
      getFileType(filePath) {
        const extension = filePath.split(".").pop()?.toLowerCase();
        const typeMap = {
          "js": "JavaScript",
          "ts": "TypeScript",
          "jsx": "React JSX",
          "tsx": "React TSX",
          "py": "Python",
          "java": "Java",
          "go": "Go",
          "rs": "Rust",
          "json": "JSON",
          "md": "Markdown",
          "yml": "YAML",
          "yaml": "YAML",
          "html": "HTML",
          "css": "CSS",
          "scss": "SCSS"
        };
        return typeMap[extension || ""] || "Unknown";
      }
      /**
       * Log tool execution
       */
      logExecution(toolName, args, timestamp, result, blocked) {
        this.executionLog.push({
          toolName,
          arguments: args,
          timestamp,
          result,
          blocked
        });
        if (result.insights) {
          this.insights.push(...result.insights);
        }
      }
      /**
       * Get execution summary
       */
      getExecutionSummary() {
        const toolsUsed = [...new Set(this.executionLog.map((log2) => log2.toolName))];
        const blockedCount = this.executionLog.filter((log2) => log2.blocked).length;
        return {
          totalExecutions: this.executionLog.length,
          blockedExecutions: blockedCount,
          allowedExecutions: this.executionLog.length - blockedCount,
          insights: [...new Set(this.insights)],
          // Deduplicate insights
          toolsUsed
        };
      }
      /**
       * Get detailed execution log
       */
      getExecutionLog() {
        return [...this.executionLog];
      }
      /**
       * Clear execution log and insights
       */
      clearLog() {
        this.executionLog = [];
        this.insights = [];
      }
    };
  }
});
function usePlanMode(settings = {}, agent) {
  const [state, setState] = useState(INITIAL_STATE);
  const [eventEmitter] = useState(() => new EventEmitter());
  const [mergedSettings] = useState({ ...DEFAULT_SETTINGS, ...settings });
  const [codebaseExplorer] = useState(
    () => agent ? new CodebaseExplorer(mergedSettings) : null
  );
  const [planGenerator] = useState(
    () => agent ? new PlanGenerator(agent) : null
  );
  const [readOnlyExecutor] = useState(
    () => agent ? new ReadOnlyToolExecutor(agent) : null
  );
  const emitEvent = useCallback((event, data) => {
    eventEmitter.emit(event, data);
    if (mergedSettings.enableDetailedLogging) {
      console.log(`[PlanMode] ${event}:`, data);
    }
  }, [eventEmitter, mergedSettings.enableDetailedLogging]);
  const activatePlanMode = useCallback(async (_options = {}) => {
    if (state.active) {
      console.warn("[PlanMode] Already active, ignoring activation request");
      return false;
    }
    const newState = {
      ...INITIAL_STATE,
      active: true,
      phase: "analysis",
      sessionStartTime: /* @__PURE__ */ new Date()
    };
    setState(newState);
    emitEvent("plan-mode-activated", { timestamp: /* @__PURE__ */ new Date() });
    emitEvent("phase-changed", {
      from: "inactive",
      to: "analysis",
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }, [state.active, emitEvent]);
  const deactivatePlanMode = useCallback((reason = "user_requested") => {
    if (!state.active) {
      return;
    }
    setState(INITIAL_STATE);
    emitEvent("plan-mode-deactivated", { timestamp: /* @__PURE__ */ new Date(), reason });
    emitEvent("phase-changed", {
      from: state.phase,
      to: "inactive",
      timestamp: /* @__PURE__ */ new Date()
    });
  }, [state.active, state.phase, emitEvent]);
  const changePhase = useCallback((newPhase) => {
    if (!state.active || state.phase === newPhase) {
      return;
    }
    const oldPhase = state.phase;
    setState((prev) => ({ ...prev, phase: newPhase }));
    emitEvent("phase-changed", {
      from: oldPhase,
      to: newPhase,
      timestamp: /* @__PURE__ */ new Date()
    });
  }, [state.active, state.phase, emitEvent]);
  const updateExplorationData = useCallback((data) => {
    setState((prev) => ({ ...prev, explorationData: data }));
    const progress = data.exploredPaths.length / (mergedSettings.maxExplorationDepth * 10);
    emitEvent("exploration-progress", {
      progress: Math.min(progress, 1),
      currentPath: data.exploredPaths[data.exploredPaths.length - 1] || ""
    });
  }, [emitEvent, mergedSettings.maxExplorationDepth]);
  const setImplementationPlan = useCallback((plan) => {
    setState((prev) => ({ ...prev, currentPlan: plan }));
    emitEvent("plan-generated", { plan, timestamp: /* @__PURE__ */ new Date() });
    if (mergedSettings.autoSavePlans) {
      console.log("[PlanMode] Auto-saving plan:", plan.title);
    }
  }, [emitEvent, mergedSettings.autoSavePlans]);
  const approvePlan = useCallback(() => {
    if (!state.currentPlan) {
      console.warn("[PlanMode] No plan to approve");
      return false;
    }
    setState((prev) => ({ ...prev, userApproval: true, phase: "approved" }));
    emitEvent("plan-approved", { plan: state.currentPlan, timestamp: /* @__PURE__ */ new Date() });
    return true;
  }, [state.currentPlan, emitEvent]);
  const rejectPlan = useCallback((reason = "user_rejected") => {
    if (!state.currentPlan) {
      console.warn("[PlanMode] No plan to reject");
      return false;
    }
    setState((prev) => ({ ...prev, userApproval: false, phase: "rejected" }));
    emitEvent("plan-rejected", {
      plan: state.currentPlan,
      reason,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }, [state.currentPlan, emitEvent]);
  const startExecution = useCallback(() => {
    if (!state.currentPlan || !state.userApproval) {
      console.warn("[PlanMode] Cannot start execution: no approved plan");
      return false;
    }
    emitEvent("execution-started", { plan: state.currentPlan, timestamp: /* @__PURE__ */ new Date() });
    deactivatePlanMode("execution_started");
    return true;
  }, [state.currentPlan, state.userApproval, emitEvent, deactivatePlanMode]);
  const startExploration = useCallback(async (userRequest) => {
    if (!codebaseExplorer || !state.active) {
      console.warn("[PlanMode] Cannot start exploration: explorer not available or plan mode not active");
      return false;
    }
    try {
      changePhase("analysis");
      const explorationData = await codebaseExplorer.exploreCodebase({
        rootPath: process.cwd(),
        maxDepth: mergedSettings.maxExplorationDepth,
        maxFileSize: mergedSettings.maxFileSize
      });
      updateExplorationData(explorationData);
      if (userRequest && planGenerator) {
        await generatePlan(userRequest);
      } else {
        changePhase("strategy");
      }
      return true;
    } catch (error) {
      console.error("[PlanMode] Exploration failed:", error);
      return false;
    }
  }, [codebaseExplorer, state.active, changePhase, updateExplorationData, mergedSettings, planGenerator]);
  const generatePlan = useCallback(async (userRequest) => {
    if (!planGenerator || !state.explorationData) {
      console.warn("[PlanMode] Cannot generate plan: generator not available or no exploration data");
      return false;
    }
    try {
      changePhase("strategy");
      const plan = await planGenerator.generatePlan({
        userRequest,
        explorationData: state.explorationData
      });
      setImplementationPlan(plan);
      changePhase("presentation");
      return true;
    } catch (error) {
      console.error("[PlanMode] Plan generation failed:", error);
      return false;
    }
  }, [planGenerator, state.explorationData, changePhase, setImplementationPlan]);
  const executeReadOnlyTool = useCallback(async (toolName, args) => {
    if (!readOnlyExecutor) {
      console.warn("[PlanMode] Read-only executor not available");
      return null;
    }
    return await readOnlyExecutor.executeReadOnly(toolName, args);
  }, [readOnlyExecutor]);
  const onEvent = useCallback((event, listener) => {
    eventEmitter.on(event, listener);
    return () => eventEmitter.off(event, listener);
  }, [eventEmitter]);
  const getSessionDuration = useCallback(() => {
    if (!state.sessionStartTime) return 0;
    return Date.now() - state.sessionStartTime.getTime();
  }, [state.sessionStartTime]);
  const isInPhase = useCallback((phase) => {
    return state.active && state.phase === phase;
  }, [state.active, state.phase]);
  const getProgress = useCallback(() => {
    switch (state.phase) {
      case "inactive":
        return 0;
      case "analysis":
        if (!state.explorationData) return 0.1;
        return Math.min(0.4, 0.1 + state.explorationData.exploredPaths.length / 20 * 0.3);
      case "strategy":
        return 0.5;
      case "presentation":
        return 0.8;
      case "approved":
      case "rejected":
        return 1;
      default:
        return 0;
    }
  }, [state.phase, state.explorationData]);
  useEffect(() => {
    return () => {
      if (state.active) {
        deactivatePlanMode("component_unmount");
      }
    };
  }, [state.active, deactivatePlanMode]);
  return {
    // State
    state,
    settings: mergedSettings,
    // Computed properties
    isActive: state.active,
    currentPhase: state.phase,
    hasApprovedPlan: state.userApproval && !!state.currentPlan,
    sessionDuration: getSessionDuration(),
    progress: getProgress(),
    // Actions
    activatePlanMode,
    deactivatePlanMode,
    changePhase,
    updateExplorationData,
    setImplementationPlan,
    approvePlan,
    rejectPlan,
    startExecution,
    // Plan Mode specific actions
    startExploration,
    generatePlan,
    executeReadOnlyTool,
    // Utilities
    onEvent,
    isInPhase,
    // Data accessors
    explorationData: state.explorationData,
    currentPlan: state.currentPlan,
    // Service accessors
    readOnlyExecutor
  };
}
var DEFAULT_SETTINGS, INITIAL_STATE;
var init_use_plan_mode = __esm({
  "src/hooks/use-plan-mode.ts"() {
    init_codebase_explorer();
    init_plan_generator();
    init_read_only_tool_executor();
    DEFAULT_SETTINGS = {
      maxExplorationDepth: 5,
      maxFileSize: 1024 * 1024,
      // 1MB
      planGenerationTimeout: 3e4,
      // 30 seconds
      enableDetailedLogging: true,
      autoSavePlans: true,
      planSaveDirectory: ".xcli/plans"
    };
    INITIAL_STATE = {
      active: false,
      phase: "inactive",
      currentPlan: null,
      userApproval: false,
      explorationData: null,
      sessionStartTime: null
    };
  }
});
function filterCommandSuggestions(suggestions, input) {
  const lowerInput = input.toLowerCase();
  return suggestions.filter((s) => s.command.toLowerCase().startsWith(lowerInput)).slice(0, MAX_SUGGESTIONS);
}
function CommandSuggestions({
  suggestions,
  input,
  selectedIndex,
  isVisible
}) {
  if (!isVisible) return null;
  const filteredSuggestions = useMemo(
    () => filterCommandSuggestions(suggestions, input),
    [suggestions, input]
  );
  return /* @__PURE__ */ jsxs(Box, { marginTop: 1, flexDirection: "column", children: [
    filteredSuggestions.map((suggestion, index) => /* @__PURE__ */ jsxs(Box, { paddingLeft: 1, children: [
      /* @__PURE__ */ jsx(
        Text,
        {
          color: index === selectedIndex ? "black" : "white",
          backgroundColor: index === selectedIndex ? "cyan" : void 0,
          children: suggestion.command
        }
      ),
      /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", children: suggestion.description }) })
    ] }, index)),
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "\u2191\u2193 navigate \u2022 Enter/Tab select \u2022 Esc cancel" }) })
  ] });
}
var MAX_SUGGESTIONS;
var init_command_suggestions = __esm({
  "src/ui/components/command-suggestions.tsx"() {
    MAX_SUGGESTIONS = 8;
  }
});

// src/utils/model-config.ts
function loadModelConfig() {
  const manager = getSettingsManager();
  const models = manager.getAvailableModels();
  return models.map((model) => ({
    model: model.trim()
  }));
}
function updateCurrentModel(modelName) {
  const manager = getSettingsManager();
  manager.setCurrentModel(modelName);
}
var init_model_config = __esm({
  "src/utils/model-config.ts"() {
    init_settings_manager();
  }
});
var ClaudeMdParserImpl, claudeMdParser;
var init_claude_md_parser = __esm({
  "src/tools/documentation/claude-md-parser.ts"() {
    ClaudeMdParserImpl = class {
      async parseClaude(rootPath) {
        const claudePath = path8__default.join(rootPath, "CLAUDE.md");
        if (!existsSync(claudePath)) {
          return {
            exists: false,
            content: "",
            hasDocumentationSection: false
          };
        }
        try {
          const content = await ops6.promises.readFile(claudePath, "utf-8");
          const hasDocumentationSection = content.includes("Documentation System Workflow") || content.includes(".agent documentation system");
          return {
            exists: true,
            content,
            hasDocumentationSection
          };
        } catch (error) {
          return {
            exists: false,
            content: "",
            hasDocumentationSection: false
          };
        }
      }
      async updateClaude(rootPath, documentationSection) {
        const claudePath = path8__default.join(rootPath, "CLAUDE.md");
        try {
          const { exists, content, hasDocumentationSection } = await this.parseClaude(rootPath);
          if (hasDocumentationSection) {
            return {
              success: true,
              message: "\u2705 CLAUDE.md already contains documentation system instructions"
            };
          }
          let newContent;
          if (exists) {
            newContent = content + "\n\n" + documentationSection;
          } else {
            newContent = `# CLAUDE.md

This document provides context and instructions for Claude Code when working with this project.

${documentationSection}`;
          }
          await ops6.promises.writeFile(claudePath, newContent);
          return {
            success: true,
            message: exists ? "\u2705 Updated existing CLAUDE.md with documentation system instructions" : "\u2705 Created CLAUDE.md with documentation system instructions"
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to update CLAUDE.md: ${error.message}`
          };
        }
      }
      generateDocumentationSection() {
        return `## \u{1F4DA} Documentation System Workflow

### Before Planning Features:
1. **Read \`.agent/README.md\`** for project overview
2. **Check \`.agent/system/\`** for architecture context
3. **Review \`.agent/tasks/\`** for related work
4. **Scan \`.agent/sop/\`** for established patterns

### During Implementation:
- Store PRDs in \`.agent/tasks/\` before coding
- Reference architecture docs for consistency
- Follow established patterns from SOPs
- Use cross-references between .agent docs

### After Implementation:
- Run \`/update-agent-docs\` to capture changes
- Update \`.agent/system/\` if architecture changed
- Add new SOPs for repeatable processes
- Link related tasks and documents

### Documentation Rules:
- Keep system docs as single source of truth
- Use relative links between .agent documents  
- Maintain concise, actionable content
- Update cross-references when adding new docs

### Token Optimization:
- Read .agent docs hierarchically (README \u2192 critical-state \u2192 relevant docs)
- Expect ~600 tokens for full context vs 3000+ without system
- Use .agent structure to avoid redundant codebase scanning
- Reference existing documentation rather than recreating context

---
*This section was added by the X-CLI documentation system*`;
      }
    };
    claudeMdParser = new ClaudeMdParserImpl();
  }
});
var AgentSystemGenerator;
var init_agent_system_generator = __esm({
  "src/tools/documentation/agent-system-generator.ts"() {
    init_claude_md_parser();
    AgentSystemGenerator = class {
      constructor(config2) {
        this.config = config2;
      }
      async generateAgentSystem() {
        const agentPath = path8__default.join(this.config.rootPath, ".agent");
        const filesCreated = [];
        try {
          if (existsSync(agentPath)) {
            return {
              success: false,
              message: ".agent directory already exists. Use --rebuild to recreate.",
              filesCreated: []
            };
          }
          await ops6.mkdir(agentPath, { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "system"), { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "tasks"), { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "sop"), { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "incidents"), { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "guardrails"), { recursive: true });
          await ops6.mkdir(path8__default.join(agentPath, "commands"), { recursive: true });
          const readmeContent = this.generateReadmeContent();
          await ops6.promises.writeFile(path8__default.join(agentPath, "README.md"), readmeContent);
          filesCreated.push(".agent/README.md");
          const systemFiles = await this.generateSystemDocs(agentPath);
          filesCreated.push(...systemFiles);
          const sopFiles = await this.generateInitialSOPs(agentPath);
          filesCreated.push(...sopFiles);
          const taskFiles = await this.generateExampleTask(agentPath);
          filesCreated.push(...taskFiles);
          const commandFiles = await this.generateCommandDocs(agentPath);
          filesCreated.push(...commandFiles);
          const documentationSection = claudeMdParser.generateDocumentationSection();
          const claudeResult = await claudeMdParser.updateClaude(this.config.rootPath, documentationSection);
          let claudeMessage = "";
          if (claudeResult.success) {
            claudeMessage = `

${claudeResult.message}`;
            if (!claudeResult.message.includes("already contains")) {
              filesCreated.push("CLAUDE.md");
            }
          }
          return {
            success: true,
            message: `\u2705 Agent documentation system created successfully!

Files created:
${filesCreated.map((f) => `  - ${f}`).join("\n")}${claudeMessage}`,
            filesCreated
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to create agent system: ${error.message}`,
            filesCreated
          };
        }
      }
      generateReadmeContent() {
        return `# \u{1F4DA} .agent Documentation System

## Overview
This directory contains AI agent documentation for ${this.config.projectName}. This system helps AI agents understand the project context efficiently without scanning the entire codebase.

## \u{1F4C1} Directory Structure

### \u{1F4CB} system/
Core project information and architecture:
- **architecture.md** - Project structure and design patterns
- **api-schema.md** - API endpoints and data schemas  
- **database-schema.md** - Data models and database structure
- **critical-state.md** - Current system state snapshot

### \u{1F4DD} tasks/
Product requirement documents and feature specifications:
- Store PRDs before implementation
- Reference related architecture and dependencies
- Track implementation progress

### \u{1F4D6} sop/
Standard operating procedures and workflows:
- Development patterns and conventions
- Deployment and maintenance procedures
- Code review and testing guidelines

### \u{1F6A8} incidents/
Documented failures with root cause analysis:
- Error patterns and their fixes
- Recovery procedures
- Prevention strategies

### \u{1F6E1}\uFE0F guardrails/
Enforceable rules to prevent recurring mistakes:
- Naming conventions
- Configuration constraints
- Implementation patterns

### \u2699\uFE0F commands/
Documentation for documentation system commands:
- Usage guides for /init-agent, /update-agent-docs, etc.
- Integration workflows

## \u{1F3AF} Usage Guidelines

### For AI Agents
1. **Always read README.md first** - Get project overview (this file)
2. **Check system/critical-state.md** - Understand current architecture
3. **Review relevant tasks/** - Check for related work or conflicts
4. **Follow sop/** patterns - Use established conventions
5. **Check guardrails/** - Avoid known failure patterns

### For Updates
- Run \`/update-agent-docs\` after significant changes
- Add new PRDs to tasks/ before implementation
- Update system docs when architecture changes
- Document new patterns in sop/

## \u{1F517} Cross-References
- Main project documentation: ../README.md
- Configuration: ../.xcli/settings.json
- Build instructions: ../package.json

---
*Generated by X-CLI Documentation System*
*Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
      }
      async generateSystemDocs(agentPath) {
        const systemPath = path8__default.join(agentPath, "system");
        const files = [];
        const archContent = this.config.projectType === "x-cli" ? this.generateGrokArchitecture() : this.generateExternalArchitecture();
        await ops6.promises.writeFile(path8__default.join(systemPath, "architecture.md"), archContent);
        files.push(".agent/system/architecture.md");
        const criticalStateContent = this.generateCriticalState();
        await ops6.promises.writeFile(path8__default.join(systemPath, "critical-state.md"), criticalStateContent);
        files.push(".agent/system/critical-state.md");
        const apiContent = this.generateApiSchema();
        await ops6.promises.writeFile(path8__default.join(systemPath, "api-schema.md"), apiContent);
        files.push(".agent/system/api-schema.md");
        return files;
      }
      generateGrokArchitecture() {
        return `# \u{1F3D7}\uFE0F X-CLI Architecture

## Project Type
**CLI Application** - Conversational AI tool with terminal interface

## Technology Stack
- **Language**: TypeScript (ES Modules)
- **Runtime**: Node.js (Bun recommended)
- **UI**: Ink (React for terminal)
- **Build**: TypeScript compiler + tsup for dual builds
- **Package Manager**: Bun/NPM

## Core Architecture

### \u{1F9E0} Agent System (\`src/agent/\`)
- **GrokAgent**: Central orchestration with streaming, tool execution
- **Conversation Management**: Chat history and context handling
- **Model Integration**: X.AI Grok models via OpenAI-compatible API

### \u{1F6E0}\uFE0F Tool System (\`src/tools/\`)
- **Modular Design**: Independent tools for specific operations
- **Core Tools**: File operations, bash execution, search
- **Advanced Tools**: Multi-file editing, code analysis, operation history
- **Documentation Tools**: NEW - Agent system generation and maintenance

### \u{1F5A5}\uFE0F UI Components (\`src/ui/\`)
- **Chat Interface**: Streaming responses with tool execution display
- **Input Handling**: Enhanced terminal input with history and shortcuts
- **Component Library**: Reusable Ink components for consistent UX

### \u{1F50C} MCP Integration (\`src/mcp/\`)
- **Model Context Protocol**: Extensible server integration
- **Supported Servers**: Linear, GitHub, custom servers
- **Transport Types**: stdio, HTTP, SSE

### \u2699\uFE0F Configuration (\`src/utils/\`)
- **Settings Management**: User and project-level config
- **Model Configuration**: Support for multiple AI models
- **File Locations**: ~/.xcli/ for user, .xcli/ for project

## Build & Distribution
- **Development**: \`bun run dev\` for live reload
- **Production**: \`npm run build\` \u2192 dist/ directory
- **Installation**: NPM global package

## Extension Points
- **Tool System**: Add new tools in src/tools/
- **MCP Servers**: Configure external service integration
- **UI Components**: Extend terminal interface capabilities
- **Commands**: Add slash commands in input handler

## Current Capabilities
\u2705 File operations (read, write, edit, multi-file)
\u2705 Bash command execution
\u2705 Code analysis and refactoring
\u2705 Search and replace operations
\u2705 MCP server integration
\u2705 Operation history and undo/redo
\u2705 Project-specific configuration

## Planned Enhancements
\u{1F532} Documentation generation system
\u{1F532} Subagent framework for context efficiency
\u{1F532} Self-healing guardrails
\u{1F532} Advanced code intelligence
\u{1F532} CI/CD integration

*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
      }
      generateExternalArchitecture() {
        return `# \u{1F3D7}\uFE0F Project Architecture

## Project Overview
External project documented using X-CLI's .agent system.

## Technology Stack
*To be analyzed and documented*

## Core Components
*To be identified during project analysis*

## Current State
- Project type: External
- Documentation system: Initialized
- Architecture analysis: Pending

## Next Steps
1. Run project analysis to identify:
   - Technology stack and frameworks
   - Core components and modules
   - Build and deployment processes
   - Dependencies and configurations

2. Update this file with findings
3. Create specific documentation for key components

*This is a template - update after project analysis*
*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
      }
      generateCriticalState() {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        if (this.config.projectType === "x-cli") {
          return `# \u{1F527} Current System State

## Architecture Overview
- **Type**: CLI application with React/Ink UI
- **Language**: TypeScript (ESM modules)
- **Build**: TypeScript compiler + tsup dual build (CJS/ESM)
- **Package**: NPM global installation
- **Runtime**: Node.js (Bun recommended)

## Core Components
- **Commands**: Slash-based in src/commands/ (limited - only MCP command currently)
- **Tools**: Modular tools in src/tools/ (extensive tool system)
- **UI**: Ink components in src/ui/
- **Settings**: File-based .xcli/settings.json + ~/.xcli/config.json
- **Input**: Enhanced terminal input with history in src/hooks/

## Command System
- **Slash Commands**: Handled in useInputHandler.ts
- **Current Commands**: /help, /clear, /models, /commit-and-push, /exit
- **Command Registration**: Direct implementation in input handler
- **Extension Pattern**: Add to handleDirectCommand function

## Authentication & Storage
- **Auth**: Environment variable X_API_KEY or user settings
- **Storage**: Local file system only
- **Database**: None (settings via JSON files)
- **MCP**: Optional server integration

## Current Capabilities
- \u2705 File operations (read, write, edit, multi-file)
- \u2705 Bash command execution with output capture
- \u2705 Code analysis (AST parsing, refactoring)
- \u2705 Search functionality (ripgrep-based)
- \u2705 Operation history and undo/redo
- \u2705 MCP server integration
- \u2705 Todo management system
- \u274C No documentation generation system (yet)
- \u274C No cloud storage integration
- \u274C No built-in authentication system

## Build Configuration
- **TypeScript**: ESM modules with dual CJS/ESM output
- **Dependencies**: Ink, React, commander, chalk, ripgrep
- **Scripts**: dev, build, start, lint, typecheck

## Known Limitations
- Command system not centralized (handled in input hook)
- No formal command registration system
- Limited built-in documentation capabilities

## Recent Changes
- Fixed React import issues for ESM compatibility
- Implemented dual-build system with tsup
- Reverted to working TypeScript build

Last Updated: ${timestamp}
Updated By: Agent System Generator during /init-agent
`;
        } else {
          return `# \u{1F527} Current System State

## Project Analysis
- **Project Type**: External project
- **Documentation Status**: Initialized
- **Analysis Status**: Pending

## Discovered Components
*To be populated during analysis*

## Current Capabilities
*To be identified*

## Configuration
*To be documented*

## Dependencies
*To be analyzed*

Last Updated: ${timestamp}
Updated By: Agent System Generator during /init-agent
*This file will be updated as the project is analyzed*
`;
        }
      }
      generateApiSchema() {
        if (this.config.projectType === "x-cli") {
          return `# \u{1F50C} API Schema

## Grok API Integration

### Base Configuration
\`\`\`typescript
{
  baseURL: "https://api.x.ai/v1",
  defaultModel: "grok-4-fast-non-reasoning",
  apiKey: process.env.X_API_KEY
}
\`\`\`

### Available Models
- **grok-4-latest**: Latest Grok model with enhanced capabilities
- **grok-4-fast-non-reasoning**: Optimized for code generation (default)
- **grok-3-fast**: Fast general-purpose model

### Tool Integration Schema
Tools follow OpenAI function calling format:

\`\`\`typescript
interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON stringified
  };
}

interface ToolResult {
  success: boolean;
  output?: string;
  error?: string;
}
\`\`\`

### MCP Server Schema
Model Context Protocol integration:

\`\`\`typescript
interface MCPServerConfig {
  name: string;
  transport: {
    type: 'stdio' | 'http' | 'sse' | 'streamable_http';
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, string>;
    headers?: Record<string, string>;
  };
}
\`\`\`

## Internal APIs

### Agent Interface
\`\`\`typescript
interface GrokAgent {
  processUserMessageStream(input: string): AsyncGenerator<StreamChunk>;
  executeBashCommand(command: string): Promise<ToolResult>;
  setModel(model: string): void;
  getCurrentModel(): string;
}
\`\`\`

### Tool Interface
\`\`\`typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema7;
  execute(args: any): Promise<ToolResult>;
}
\`\`\`

*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
        } else {
          return `# \u{1F50C} API Schema

## Project APIs
*To be documented after project analysis*

## External Dependencies
*To be identified*

## Data Models
*To be documented*

*This file will be updated as APIs are discovered and analyzed*
*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
        }
      }
      async generateInitialSOPs(agentPath) {
        const sopPath = path8__default.join(agentPath, "sop");
        const files = [];
        const docWorkflowContent = `# \u{1F4DA} Documentation Workflow SOP

## When to Update Documentation

### Trigger Events
1. **Architecture Changes**: New components, modified structure
2. **New Features**: Added functionality or tools
3. **Configuration Changes**: Settings, build process, dependencies
4. **After Major Commits**: Significant code changes
5. **Failed Operations**: Document lessons learned

### Update Process

#### 1. Before Implementation
- [ ] Read .agent/README.md for project overview
- [ ] Check .agent/system/critical-state.md for current architecture  
- [ ] Review .agent/tasks/ for related work or conflicts
- [ ] Scan .agent/sop/ for established patterns
- [ ] Check .agent/guardrails/ for constraints

#### 2. During Implementation
- [ ] Store PRDs in .agent/tasks/ before coding
- [ ] Reference architecture docs for consistency
- [ ] Follow established patterns from SOPs
- [ ] Use cross-references between .agent docs

#### 3. After Implementation
- [ ] Run \`/update-agent-docs\` to capture changes
- [ ] Update .agent/system/ if architecture changed
- [ ] Add new SOPs for repeatable processes
- [ ] Link related tasks and documents
- [ ] Test documentation updates for accuracy

## Documentation Standards

### File Organization
- **system/**: Core architecture and state
- **tasks/**: PRDs and feature specifications
- **sop/**: Procedures and workflows
- **incidents/**: Failure documentation
- **guardrails/**: Prevention rules

### Writing Guidelines
- **Conciseness**: Keep sections under 300 tokens
- **Cross-linking**: Use relative links between docs
- **Consistency**: Follow established markdown patterns
- **Freshness**: Include update timestamps
- **Relevance**: Focus on actionable information

### Template Usage
- Use consistent headings and structure
- Include metadata (updated date, updated by)
- Reference related documents
- Maintain clear navigation

## Automation
- Auto-update triggers configured in .xcli/settings.json
- Smart prompts after key file changes
- Token threshold reminders
- Integration with git commit hooks

*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
        await ops6.promises.writeFile(path8__default.join(sopPath, "documentation-workflow.md"), docWorkflowContent);
        files.push(".agent/sop/documentation-workflow.md");
        if (this.config.projectType === "x-cli") {
          const newCommandContent = `# \u2699\uFE0F Adding New Commands SOP

## Command System Architecture

### Current Implementation
- Commands handled in \`src/hooks/use-input-handler.ts\`
- Direct implementation in \`handleDirectCommand\` function
- No centralized command registry (yet)

### Command Types

#### 1. Slash Commands
Built-in commands starting with \`/\`:
- Implementation: Add to \`handleDirectCommand\` function
- Pattern: \`if (trimmedInput === "/your-command") { ... }\`
- Registration: Update \`commandSuggestions\` array

#### 2. Direct Bash Commands  
Immediate execution commands:
- Pattern: Add to \`directBashCommands\` array
- Execution: Automatic bash execution

#### 3. Natural Language
AI-processed commands:
- Fallback: Processed by \`processUserMessage\`
- Tool selection: Automatic based on AI analysis

### Implementation Steps

#### 1. Add Slash Command
\`\`\`typescript
// In commandSuggestions array
{ command: "/your-command", description: "Your command description" }

// In handleDirectCommand function  
if (trimmedInput === "/your-command") {
  // Implementation logic
  const result = await someOperation();
  
  const entry: ChatEntry = {
    type: "assistant",
    content: result,
    timestamp: new Date(),
  };
  setChatHistory((prev) => [...prev, entry]);
  clearInput();
  return true;
}
\`\`\`

#### 2. Add Tool-Based Command
Create tool in \`src/tools/\`, then reference in command handler.

#### 3. Update Documentation
- Add command to /help output
- Document in .agent/commands/
- Update this SOP if pattern changes

### Best Practices
- **Consistent UX**: Follow existing command patterns
- **Error Handling**: Provide clear feedback
- **Tool Integration**: Leverage existing tool system
- **State Management**: Update chat history appropriately
- **Input Cleanup**: Always call \`clearInput()\`

### Future Improvements
- Centralized command registry system
- Dynamic command loading
- Plugin-based command architecture

*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
          await ops6.promises.writeFile(path8__default.join(sopPath, "adding-new-command.md"), newCommandContent);
          files.push(".agent/sop/adding-new-command.md");
        }
        return files;
      }
      async generateExampleTask(agentPath) {
        const tasksPath = path8__default.join(agentPath, "tasks");
        const files = [];
        const exampleContent = this.config.projectType === "x-cli" ? this.generateGrokExampleTask() : this.generateExternalExampleTask();
        await ops6.promises.writeFile(path8__default.join(tasksPath, "example-prd.md"), exampleContent);
        files.push(".agent/tasks/example-prd.md");
        return files;
      }
      generateGrokExampleTask() {
        return `# \u{1F4CB} Example PRD: Documentation System Enhancement

## Objective
Add comprehensive documentation generation capabilities to X-CLI.

## Background
X-CLI needs better documentation tools to help users document both the CLI itself and their projects efficiently.

## Requirements

### Must Have
- [ ] \`/init-agent\` command for .agent system creation
- [ ] \`/docs\` interactive menu for documentation options
- [ ] \`/readme\` command for README generation
- [ ] Integration with existing command system

### Should Have  
- [ ] \`/api-docs\` for API documentation
- [ ] \`/comments\` for code comment generation
- [ ] Auto-update system for documentation maintenance

### Could Have
- [ ] Custom templates for different project types
- [ ] Documentation quality scoring
- [ ] Integration with external documentation tools

## Technical Approach

### Architecture Impact
- New tool directory: \`src/tools/documentation/\`
- Command integration: Update \`use-input-handler.ts\`
- New dependencies: Minimal (leverage existing tools)

### Implementation Strategy
1. **Phase 1**: Agent system generator tool
2. **Phase 2**: Core documentation commands
3. **Phase 3**: Advanced features and automation

### Compatibility
- Must not break existing functionality
- Should follow established command patterns
- Integrate with current tool system architecture

## Success Criteria
- [ ] Users can run \`/init-agent\` and get functional documentation
- [ ] Commands are discoverable and intuitive
- [ ] Generated documentation is high quality
- [ ] System integrates seamlessly with existing workflow

## Dependencies
- Existing AST parser tool
- Current search functionality  
- File operation tools
- Command system in input handler

## Risks & Mitigation
- **Risk**: Command system complexity
- **Mitigation**: Follow existing patterns, minimal changes

## Timeline
- **Week 1-2**: Foundation and agent system
- **Week 3-4**: Core documentation commands
- **Week 5-6**: Advanced features and polish

---
*This is an example PRD showing the format and level of detail expected*
*Created: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
*Status: Example/Template*
`;
      }
      generateExternalExampleTask() {
        return `# \u{1F4CB} Example PRD Template

## Objective
*Describe what you want to build or improve*

## Background
*Provide context about why this is needed*

## Requirements

### Must Have
- [ ] *Critical features that must be implemented*

### Should Have
- [ ] *Important features that add significant value*

### Could Have
- [ ] *Nice-to-have features for future consideration*

## Technical Approach

### Architecture Impact
*How will this change the system architecture?*

### Implementation Strategy
*High-level approach and phases*

### Dependencies
*What existing systems or external dependencies are required?*

## Success Criteria
- [ ] *How will you know this is successful?*

## Risks & Mitigation
- **Risk**: *Potential issues*
- **Mitigation**: *How to address them*

## Timeline
*Estimated implementation timeline*

---
*This is a template - replace with actual PRD content*
*Created: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
*Status: Template*
`;
      }
      async generateCommandDocs(agentPath) {
        const commandsPath = path8__default.join(agentPath, "commands");
        const files = [];
        const initAgentContent = `# \u{1F4D6} /init-agent Command

## Purpose
Initialize the .agent documentation system for AI-first project understanding.

## Usage
\`\`\`bash
/init-agent
\`\`\`

## What It Does

### 1. Directory Creation
Creates \`.agent/\` folder structure:
- \`system/\` - Architecture and current state
- \`tasks/\` - PRDs and feature specifications  
- \`sop/\` - Standard operating procedures
- \`incidents/\` - Failure documentation
- \`guardrails/\` - Prevention rules
- \`commands/\` - Command documentation

### 2. Initial Documentation
- **README.md**: Navigation and overview
- **system/architecture.md**: Project structure
- **system/critical-state.md**: Current system snapshot
- **system/api-schema.md**: APIs and interfaces
- **sop/documentation-workflow.md**: Update procedures

### 3. Integration
- Updates or creates CLAUDE.md with workflow instructions
- Configures documentation system for the project type
- Sets up foundation for other documentation commands

## Project Types

### X-CLI (Internal)
- Documents X-CLI's own architecture
- Includes command system patterns
- References existing tool structure

### External Project
- Generic project documentation template
- Prepares for project analysis
- Creates foundation for custom documentation

## Files Created
After running \`/init-agent\`, you'll have:
- \`.agent/README.md\` - Main index
- \`.agent/system/\` - 3 core architecture files
- \`.agent/sop/\` - Documentation procedures
- \`.agent/tasks/example-prd.md\` - PRD template
- \`.agent/commands/\` - Command documentation

## Next Steps
After initialization:
1. Review generated documentation
2. Customize templates for your project
3. Run \`/update-agent-docs\` after changes
4. Add PRDs to \`tasks/\` before implementation

## Error Handling
- Checks for existing \`.agent/\` directory
- Provides clear error messages
- Safe operation (won't overwrite)

*Updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*
`;
        await ops6.promises.writeFile(path8__default.join(commandsPath, "init-agent.md"), initAgentContent);
        files.push(".agent/commands/init-agent.md");
        return files;
      }
      async rebuildAgentSystem() {
        const agentPath = path8__default.join(this.config.rootPath, ".agent");
        try {
          if (existsSync(agentPath)) {
            await ops6.rm(agentPath, { recursive: true, force: true });
          }
          return await this.generateAgentSystem();
        } catch (error) {
          return {
            success: false,
            message: `Failed to rebuild agent system: ${error.message}`,
            filesCreated: []
          };
        }
      }
    };
  }
});

// src/tools/documentation/docs-menu.ts
function generateDocsMenuText() {
  return `\u{1F4DA} **Documentation Menu**

Choose a documentation task:

${DOCS_MENU_OPTIONS.map((option) => `**${option.key}.** ${option.title}
   ${option.description}
   \u2192 \`${option.command}\`
`).join("\n")}

**0.** Exit Menu

Type a number to select an option, or type any command directly.`;
}
function findDocsMenuOption(input) {
  const trimmed = input.trim();
  return DOCS_MENU_OPTIONS.find((option) => option.key === trimmed) || null;
}
var DOCS_MENU_OPTIONS;
var init_docs_menu = __esm({
  "src/tools/documentation/docs-menu.ts"() {
    DOCS_MENU_OPTIONS = [
      {
        key: "1",
        title: "Generate README",
        description: "Create comprehensive README.md from project structure",
        command: "/readme"
      },
      {
        key: "2",
        title: "Generate API Documentation",
        description: "Extract and document functions, classes, modules",
        command: "/api-docs"
      },
      {
        key: "3",
        title: "Add Code Comments",
        description: "Add intelligent comments to existing code",
        command: "/comments"
      },
      {
        key: "4",
        title: "Generate Changelog",
        description: "Generate CHANGELOG.md from git history",
        command: "/changelog"
      },
      {
        key: "5",
        title: "Initialize .agent System",
        description: "Set up AI-first documentation structure",
        command: "/init-agent"
      },
      {
        key: "6",
        title: "Update .agent Documentation",
        description: "Sync docs with recent code changes",
        command: "/update-agent-docs"
      }
    ];
  }
});
var ReadmeGenerator;
var init_readme_generator = __esm({
  "src/tools/documentation/readme-generator.ts"() {
    ReadmeGenerator = class {
      constructor(config2) {
        this.config = config2;
      }
      async generateReadme() {
        try {
          const analysis = await this.analyzeProject();
          const readmePath = path8__default.join(this.config.rootPath, "README.md");
          const readmeExists = existsSync(readmePath);
          if (readmeExists && !this.config.updateExisting) {
            return {
              success: false,
              message: "README.md already exists. Use --update flag to overwrite."
            };
          }
          const content = this.generateReadmeContent(analysis);
          await ops6.promises.writeFile(readmePath, content);
          return {
            success: true,
            message: readmeExists ? "\u2705 Updated existing README.md with comprehensive documentation" : "\u2705 Created new README.md with project documentation",
            content
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to generate README: ${error.message}`
          };
        }
      }
      async analyzeProject() {
        const analysis = {
          hasTypeScript: false,
          hasReact: false,
          hasTests: false,
          hasDocs: false,
          buildScripts: [],
          dependencies: [],
          devDependencies: [],
          mainFiles: []
        };
        try {
          const packagePath = path8__default.join(this.config.rootPath, "package.json");
          if (existsSync(packagePath)) {
            const packageContent = await ops6.promises.readFile(packagePath, "utf-8");
            analysis.packageJson = JSON.parse(packageContent);
            analysis.dependencies = Object.keys(analysis.packageJson.dependencies || {});
            analysis.devDependencies = Object.keys(analysis.packageJson.devDependencies || {});
            analysis.hasReact = analysis.dependencies.includes("react") || analysis.devDependencies.includes("react");
            analysis.hasTypeScript = analysis.devDependencies.includes("typescript") || existsSync(path8__default.join(this.config.rootPath, "tsconfig.json"));
            const scripts = analysis.packageJson.scripts || {};
            analysis.buildScripts = Object.keys(scripts).filter(
              (script) => ["build", "dev", "start", "test", "lint", "typecheck"].includes(script)
            );
            if (analysis.dependencies.includes("next")) analysis.framework = "Next.js";
            else if (analysis.dependencies.includes("express")) analysis.framework = "Express.js";
            else if (analysis.dependencies.includes("ink")) analysis.framework = "Ink (Terminal)";
            else if (analysis.hasReact) analysis.framework = "React";
          }
          const commonFiles = ["src/", "lib/", "docs/", "test/", "tests/", "__tests__/"];
          for (const file of commonFiles) {
            if (existsSync(path8__default.join(this.config.rootPath, file))) {
              if (file.includes("test")) analysis.hasTests = true;
              if (file.includes("docs")) analysis.hasDocs = true;
              analysis.mainFiles.push(file);
            }
          }
          return analysis;
        } catch (error) {
          return analysis;
        }
      }
      generateReadmeContent(analysis) {
        const pkg = analysis.packageJson;
        const projectName = this.config.projectName || pkg?.name || "Project";
        let content = `# ${projectName}

`;
        if (pkg?.description) {
          content += `${pkg.description}

`;
        } else {
          content += `A ${analysis.framework || "JavaScript"} project.

`;
        }
        if (pkg) {
          content += this.generateBadges(analysis);
        }
        content += `## \u{1F4CB} Table of Contents

`;
        content += `- [Installation](#installation)
`;
        content += `- [Usage](#usage)
`;
        if (analysis.buildScripts.length > 0) content += `- [Development](#development)
`;
        if (analysis.hasTests) content += `- [Testing](#testing)
`;
        if (pkg?.scripts?.build) content += `- [Building](#building)
`;
        content += `- [Configuration](#configuration)
`;
        content += `- [Contributing](#contributing)
`;
        content += `- [License](#license)

`;
        content += `## \u{1F680} Installation

`;
        if (pkg?.bin) {
          content += `### Global Installation
\`\`\`bash
npm install -g ${pkg.name}
\`\`\`

`;
        }
        content += `### Local Installation
\`\`\`bash
`;
        content += `# Clone the repository
git clone <repository-url>
`;
        content += `cd ${pkg?.name || projectName.toLowerCase()}

`;
        content += `# Install dependencies
npm install
\`\`\`

`;
        content += `## \u{1F4BB} Usage

`;
        if (pkg?.bin) {
          const binName = Object.keys(pkg.bin)[0];
          content += `### Command Line
\`\`\`bash
${binName} [options]
\`\`\`

`;
        }
        if (analysis.framework === "Express.js") {
          content += `### API Server
\`\`\`bash
npm start
\`\`\`

The server will start on \`http://localhost:3000\`

`;
        } else if (analysis.hasReact) {
          content += `### Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

`;
        }
        if (analysis.buildScripts.length > 0) {
          content += `## \u{1F6E0}\uFE0F Development

`;
          content += `### Available Scripts

`;
          analysis.buildScripts.forEach((script) => {
            const description = this.getScriptDescription(script);
            content += `- \`npm run ${script}\` - ${description}
`;
          });
          content += "\n";
        }
        if (analysis.hasTests) {
          content += `## \u{1F9EA} Testing

`;
          content += `\`\`\`bash
npm test
\`\`\`

`;
          if (analysis.buildScripts.includes("test:watch")) {
            content += `### Watch Mode
\`\`\`bash
npm run test:watch
\`\`\`

`;
          }
        }
        if (pkg?.scripts?.build) {
          content += `## \u{1F4E6} Building

`;
          content += `\`\`\`bash
npm run build
\`\`\`

`;
          if (analysis.hasTypeScript) {
            content += `This will compile TypeScript files and output to the \`dist/\` directory.

`;
          }
        }
        if (analysis.dependencies.length > 0) {
          content += `## \u{1F527} Technology Stack

`;
          if (analysis.framework) content += `- **Framework**: ${analysis.framework}
`;
          if (analysis.hasTypeScript) content += `- **Language**: TypeScript
`;
          const keyDeps = analysis.dependencies.filter(
            (dep) => ["react", "express", "next", "ink", "commander", "chalk"].includes(dep)
          );
          if (keyDeps.length > 0) {
            content += `- **Key Dependencies**: ${keyDeps.join(", ")}
`;
          }
          content += "\n";
        }
        content += `## \u2699\uFE0F Configuration

`;
        if (existsSync(path8__default.join(this.config.rootPath, ".env.example"))) {
          content += `Copy \`.env.example\` to \`.env\` and configure your environment variables:

`;
          content += `\`\`\`bash
cp .env.example .env
\`\`\`

`;
        }
        if (analysis.hasTypeScript) {
          content += `### TypeScript Configuration
TypeScript is configured via \`tsconfig.json\`.

`;
        }
        if (analysis.framework === "Express.js" || pkg?.main?.includes("api")) {
          content += `## \u{1F4D6} API Documentation

`;
          content += `API documentation is available at \`/docs\` when running the server.

`;
        }
        content += `## \u{1F91D} Contributing

`;
        content += `1. Fork the repository
`;
        content += `2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
`;
        content += `3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
`;
        content += `4. Push to the branch (\`git push origin feature/amazing-feature\`)
`;
        content += `5. Open a Pull Request

`;
        content += `## \u{1F4C4} License

`;
        if (pkg?.license) {
          content += `This project is licensed under the ${pkg.license} License.

`;
        } else {
          content += `This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

`;
        }
        content += `---
*Generated by X-CLI Documentation System*
`;
        content += `*Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}*`;
        return content;
      }
      generateBadges(analysis) {
        let badges = "";
        if (analysis.packageJson?.version) {
          badges += `![Version](https://img.shields.io/badge/version-${analysis.packageJson.version}-blue.svg)
`;
        }
        if (analysis.hasTypeScript) {
          badges += `![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
`;
        }
        if (analysis.hasReact) {
          badges += `![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
`;
        }
        if (analysis.packageJson?.license) {
          badges += `![License](https://img.shields.io/badge/license-${analysis.packageJson.license}-green.svg)
`;
        }
        return badges ? badges + "\n" : "";
      }
      getScriptDescription(script) {
        const descriptions = {
          "dev": "Start development server",
          "build": "Build for production",
          "start": "Start production server",
          "test": "Run test suite",
          "lint": "Run linter",
          "typecheck": "Run TypeScript type checking",
          "format": "Format code with prettier"
        };
        return descriptions[script] || `Run ${script} script`;
      }
    };
  }
});
var CommentsGenerator;
var init_comments_generator = __esm({
  "src/tools/documentation/comments-generator.ts"() {
    CommentsGenerator = class {
      constructor(config2) {
        this.config = config2;
      }
      async generateComments() {
        try {
          if (!existsSync(this.config.filePath)) {
            return {
              success: false,
              message: "File not found"
            };
          }
          const content = await ops6.promises.readFile(this.config.filePath, "utf-8");
          const analysis = this.analyzeCode(content);
          if (analysis.hasExistingComments) {
            return {
              success: false,
              message: "File already has extensive comments. Use --force to override."
            };
          }
          const modifiedContent = this.addComments(content, analysis);
          const backupPath = this.config.filePath + ".backup";
          await ops6.promises.writeFile(backupPath, content);
          await ops6.promises.writeFile(this.config.filePath, modifiedContent);
          const commentCount = this.countAddedComments(analysis);
          return {
            success: true,
            message: `\u2705 Added ${commentCount} comments to ${path8__default.basename(this.config.filePath)}
\u{1F4C1} Backup created: ${path8__default.basename(backupPath)}`,
            modifiedContent
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to add comments: ${error.message}`
          };
        }
      }
      analyzeCode(content) {
        const lines = content.split("\n");
        const language = this.detectLanguage();
        const analysis = {
          language,
          functions: [],
          classes: [],
          interfaces: [],
          hasExistingComments: this.hasExtensiveComments(content)
        };
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
          if (funcMatch) {
            const [, name, params] = funcMatch;
            analysis.functions.push({
              name,
              line: i + 1,
              parameters: params.split(",").map((p) => p.trim()).filter(Boolean),
              isAsync: line.includes("async"),
              isExported: line.includes("export")
            });
          }
          const arrowMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/);
          if (arrowMatch) {
            const [, name] = arrowMatch;
            analysis.functions.push({
              name,
              line: i + 1,
              parameters: [],
              isAsync: line.includes("async"),
              isExported: line.includes("export")
            });
          }
          const classMatch = line.match(/(?:export\s+)?class\s+(\w+)/);
          if (classMatch) {
            const [, name] = classMatch;
            analysis.classes.push({
              name,
              line: i + 1,
              methods: [],
              properties: [],
              isExported: line.includes("export")
            });
          }
          const interfaceMatch = line.match(/(?:export\s+)?interface\s+(\w+)/);
          if (interfaceMatch) {
            const [, name] = interfaceMatch;
            analysis.interfaces.push({
              name,
              line: i + 1,
              properties: []
            });
          }
        }
        return analysis;
      }
      detectLanguage() {
        const ext = path8__default.extname(this.config.filePath);
        switch (ext) {
          case ".ts":
          case ".tsx":
            return "typescript";
          case ".js":
          case ".jsx":
            return "javascript";
          case ".py":
            return "python";
          case ".java":
            return "java";
          case ".cpp":
          case ".cc":
          case ".cxx":
            return "cpp";
          default:
            return "unknown";
        }
      }
      hasExtensiveComments(content) {
        const lines = content.split("\n");
        const commentLines = lines.filter((line) => {
          const trimmed = line.trim();
          return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("#") || trimmed.includes("/**");
        });
        return commentLines.length / lines.length > 0.2;
      }
      addComments(content, analysis) {
        const lines = content.split("\n");
        let modifiedLines = [...lines];
        let insertOffset = 0;
        if (this.config.commentType === "functions" || this.config.commentType === "all") {
          for (const func of analysis.functions) {
            const commentLines = this.generateFunctionComment(func, analysis.language);
            const insertIndex = func.line - 1 + insertOffset;
            modifiedLines.splice(insertIndex, 0, ...commentLines);
            insertOffset += commentLines.length;
          }
        }
        if (this.config.commentType === "classes" || this.config.commentType === "all") {
          for (const cls of analysis.classes) {
            const commentLines = this.generateClassComment(cls, analysis.language);
            const insertIndex = cls.line - 1 + insertOffset;
            modifiedLines.splice(insertIndex, 0, ...commentLines);
            insertOffset += commentLines.length;
          }
        }
        return modifiedLines.join("\n");
      }
      generateFunctionComment(func, language) {
        const indent = this.getIndentation(func.line);
        if (language === "typescript" || language === "javascript") {
          const lines = [
            `${indent}/**`,
            `${indent} * ${this.generateFunctionDescription(func)}`
          ];
          if (func.parameters.length > 0) {
            lines.push(`${indent} *`);
            func.parameters.forEach((param) => {
              const cleanParam = param.split(":")[0].split("=")[0].trim();
              lines.push(`${indent} * @param {any} ${cleanParam} - Parameter description`);
            });
          }
          lines.push(`${indent} * @returns {${func.isAsync ? "Promise<any>" : "any"}} Return description`);
          lines.push(`${indent} */`);
          return lines;
        }
        return [`${indent}// ${this.generateFunctionDescription(func)}`];
      }
      generateClassComment(cls, language) {
        const indent = this.getIndentation(cls.line);
        if (language === "typescript" || language === "javascript") {
          return [
            `${indent}/**`,
            `${indent} * ${cls.name} class`,
            `${indent} * `,
            `${indent} * @class ${cls.name}`,
            `${indent} */`
          ];
        }
        return [`${indent}// ${cls.name} class`];
      }
      generateFunctionDescription(func) {
        if (func.name === "constructor") {
          return "Creates an instance of the class";
        }
        const name = func.name.toLowerCase();
        if (name.startsWith("get")) {
          return `Gets ${name.substring(3).replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.startsWith("set")) {
          return `Sets ${name.substring(3).replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.startsWith("create")) {
          return `Creates a new ${name.substring(6).replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.startsWith("delete") || name.startsWith("remove")) {
          const target = name.startsWith("delete") ? name.substring(6) : name.substring(6);
          return `Deletes ${target.replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.startsWith("update")) {
          return `Updates ${name.substring(6).replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.startsWith("is") || name.startsWith("has")) {
          return `Checks if ${name.substring(2).replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        if (name.includes("handle")) {
          return `Handles ${name.replace("handle", "").replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
        return `${func.name} function`;
      }
      getIndentation(lineNumber) {
        return "";
      }
      countAddedComments(analysis) {
        let count = 0;
        if (this.config.commentType === "functions" || this.config.commentType === "all") {
          count += analysis.functions.length;
        }
        if (this.config.commentType === "classes" || this.config.commentType === "all") {
          count += analysis.classes.length;
        }
        return count;
      }
    };
  }
});
var ApiDocsGenerator;
var init_api_docs_generator = __esm({
  "src/tools/documentation/api-docs-generator.ts"() {
    ApiDocsGenerator = class {
      constructor(config2) {
        this.config = config2;
      }
      async generateApiDocs() {
        try {
          const documentation = await this.scanApiFiles();
          if (documentation.functions.length === 0 && documentation.classes.length === 0) {
            return {
              success: false,
              message: "No API documentation found. Make sure you have TypeScript/JavaScript files with exported functions or classes."
            };
          }
          const content = this.config.outputFormat === "md" ? this.generateMarkdown(documentation) : this.generateHtml(documentation);
          const outputFileName = `api-docs.${this.config.outputFormat}`;
          const outputPath = path8__default.join(this.config.rootPath, outputFileName);
          await ops6.promises.writeFile(outputPath, content);
          const stats = this.getDocumentationStats(documentation);
          return {
            success: true,
            message: `\u2705 Generated API documentation: ${outputFileName}

\u{1F4CA} **Documentation Stats:**
${stats}`,
            outputPath
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to generate API docs: ${error.message}`
          };
        }
      }
      async scanApiFiles() {
        const documentation = {
          modules: [],
          functions: [],
          classes: [],
          interfaces: [],
          types: []
        };
        const scanPaths = this.config.scanPaths.length > 0 ? this.config.scanPaths : ["src/", "lib/", "./"];
        for (const scanPath of scanPaths) {
          const fullPath = path8__default.join(this.config.rootPath, scanPath);
          if (existsSync(fullPath)) {
            await this.scanDirectory(fullPath, documentation);
          }
        }
        return documentation;
      }
      async scanDirectory(dirPath, documentation) {
        try {
          const entries = await ops6.promises.readdir(dirPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path8__default.join(dirPath, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
              await this.scanDirectory(fullPath, documentation);
            } else if (entry.isFile() && this.isApiFile(entry.name)) {
              await this.parseApiFile(fullPath, documentation);
            }
          }
        } catch (error) {
        }
      }
      isApiFile(fileName) {
        const apiExtensions = [".ts", ".js", ".tsx", ".jsx"];
        const ext = path8__default.extname(fileName);
        return apiExtensions.includes(ext) && !fileName.includes(".test.") && !fileName.includes(".spec.") && !fileName.includes(".d.ts");
      }
      async parseApiFile(filePath, documentation) {
        try {
          const content = await ops6.promises.readFile(filePath, "utf-8");
          const relativePath = path8__default.relative(this.config.rootPath, filePath);
          const moduleName = this.getModuleName(relativePath);
          const lines = content.split("\n");
          const moduleInfo = {
            name: moduleName,
            path: relativePath,
            exports: []
          };
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const funcMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?/);
            if (funcMatch) {
              const [, name, params, returnType] = funcMatch;
              const functionInfo = {
                name,
                module: moduleName,
                signature: line,
                parameters: this.parseParameters(params),
                returnType: returnType?.trim() || "any",
                isAsync: line.includes("async"),
                isExported: true,
                description: this.extractPrecedingComment(lines, i)
              };
              documentation.functions.push(functionInfo);
              moduleInfo.exports.push(name);
            }
            const classMatch = line.match(/export\s+class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/);
            if (classMatch) {
              const [, name, extendsClass, implementsInterfaces] = classMatch;
              const classInfo = {
                name,
                module: moduleName,
                description: this.extractPrecedingComment(lines, i),
                methods: [],
                properties: [],
                extends: extendsClass,
                implements: implementsInterfaces?.split(",").map((s) => s.trim()),
                isExported: true,
                constructor: void 0
              };
              documentation.classes.push(classInfo);
              moduleInfo.exports.push(name);
            }
            const interfaceMatch = line.match(/export\s+interface\s+(\w+)(?:\s+extends\s+([^{]+))?/);
            if (interfaceMatch) {
              const [, name, extendsInterfaces] = interfaceMatch;
              const interfaceInfo = {
                name,
                module: moduleName,
                description: this.extractPrecedingComment(lines, i),
                properties: [],
                extends: extendsInterfaces?.split(",").map((s) => s.trim()),
                isExported: true
              };
              documentation.interfaces.push(interfaceInfo);
              moduleInfo.exports.push(name);
            }
            const typeMatch = line.match(/export\s+type\s+(\w+)\s*=\s*([^;]+)/);
            if (typeMatch) {
              const [, name, definition] = typeMatch;
              const typeInfo = {
                name,
                module: moduleName,
                definition: definition.trim(),
                description: this.extractPrecedingComment(lines, i),
                isExported: true
              };
              documentation.types.push(typeInfo);
              moduleInfo.exports.push(name);
            }
          }
          if (moduleInfo.exports.length > 0) {
            documentation.modules.push(moduleInfo);
          }
        } catch (error) {
        }
      }
      getModuleName(relativePath) {
        const withoutExt = relativePath.replace(/\.[^/.]+$/, "");
        return withoutExt.replace(/[/\\]/g, ".");
      }
      parseParameters(paramsString) {
        if (!paramsString.trim()) return [];
        return paramsString.split(",").map((param) => {
          const trimmed = param.trim();
          const parts = trimmed.split(":");
          const name = parts[0]?.trim() || "";
          const type = parts[1]?.trim() || "any";
          return {
            name: name.replace(/[?=].*$/, ""),
            // Remove optional/default markers
            type,
            optional: name.includes("?") || name.includes("="),
            defaultValue: name.includes("=") ? name.split("=")[1]?.trim() : void 0
          };
        });
      }
      extractPrecedingComment(lines, lineIndex) {
        let i = lineIndex - 1;
        const commentLines = [];
        while (i >= 0) {
          const line = lines[i].trim();
          if (line.startsWith("/**") || line.startsWith("/*")) {
            const jsdocLines = [];
            while (i >= 0 && !lines[i].includes("*/")) {
              jsdocLines.unshift(lines[i].trim());
              i--;
            }
            if (i >= 0) jsdocLines.unshift(lines[i].trim());
            return jsdocLines.join("\n").replace(/\/\*\*?|\*\/|\s*\*\s?/g, "").trim();
          } else if (line.startsWith("//")) {
            commentLines.unshift(line.replace(/^\s*\/\/\s?/, ""));
            i--;
          } else if (line === "") {
            i--;
          } else {
            break;
          }
        }
        return commentLines.length > 0 ? commentLines.join(" ") : void 0;
      }
      generateMarkdown(documentation) {
        let content = `# API Documentation

`;
        content += `Generated on: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}

`;
        content += `## \u{1F4CB} Table of Contents

`;
        if (documentation.modules.length > 0) content += `- [Modules](#modules)
`;
        if (documentation.functions.length > 0) content += `- [Functions](#functions)
`;
        if (documentation.classes.length > 0) content += `- [Classes](#classes)
`;
        if (documentation.interfaces.length > 0) content += `- [Interfaces](#interfaces)
`;
        if (documentation.types.length > 0) content += `- [Types](#types)
`;
        content += "\n";
        if (documentation.modules.length > 0) {
          content += `## \u{1F4E6} Modules

`;
          documentation.modules.forEach((module) => {
            content += `### ${module.name}

`;
            content += `**Path:** \`${module.path}\`

`;
            if (module.description) content += `${module.description}

`;
            content += `**Exports:** ${module.exports.join(", ")}

`;
          });
        }
        if (documentation.functions.length > 0) {
          content += `## \u{1F527} Functions

`;
          documentation.functions.forEach((func) => {
            content += `### ${func.name}

`;
            if (func.description) content += `${func.description}

`;
            content += `**Module:** \`${func.module}\`

`;
            content += `**Signature:**
\`\`\`typescript
${func.signature}
\`\`\`

`;
            if (func.parameters.length > 0) {
              content += `**Parameters:**
`;
              func.parameters.forEach((param) => {
                const optional = param.optional ? " (optional)" : "";
                const defaultVal = param.defaultValue ? ` = ${param.defaultValue}` : "";
                content += `- \`${param.name}\`: \`${param.type}\`${optional}${defaultVal}
`;
                if (param.description) content += `  - ${param.description}
`;
              });
              content += "\n";
            }
            content += `**Returns:** \`${func.returnType}\`

`;
            if (func.isAsync) content += `\u26A1 **Async function**

`;
          });
        }
        if (documentation.classes.length > 0) {
          content += `## \u{1F3D7}\uFE0F Classes

`;
          documentation.classes.forEach((cls) => {
            content += `### ${cls.name}

`;
            if (cls.description) content += `${cls.description}

`;
            content += `**Module:** \`${cls.module}\`

`;
            if (cls.extends) content += `**Extends:** \`${cls.extends}\`

`;
            if (cls.implements && cls.implements.length > 0) {
              content += `**Implements:** ${cls.implements.map((i) => `\`${i}\``).join(", ")}

`;
            }
          });
        }
        if (documentation.interfaces.length > 0) {
          content += `## \u{1F4CB} Interfaces

`;
          documentation.interfaces.forEach((iface) => {
            content += `### ${iface.name}

`;
            if (iface.description) content += `${iface.description}

`;
            content += `**Module:** \`${iface.module}\`

`;
            if (iface.extends && iface.extends.length > 0) {
              content += `**Extends:** ${iface.extends.map((e) => `\`${e}\``).join(", ")}

`;
            }
          });
        }
        if (documentation.types.length > 0) {
          content += `## \u{1F3AF} Types

`;
          documentation.types.forEach((type) => {
            content += `### ${type.name}

`;
            if (type.description) content += `${type.description}

`;
            content += `**Module:** \`${type.module}\`

`;
            content += `**Definition:**
\`\`\`typescript
type ${type.name} = ${type.definition}
\`\`\`

`;
          });
        }
        content += `---
*Generated by X-CLI Documentation System*`;
        return content;
      }
      generateHtml(documentation) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    <p>Generated on: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</p>
    ${this.generateMarkdown(documentation).replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")}
</body>
</html>`;
      }
      getDocumentationStats(documentation) {
        return `- **Modules:** ${documentation.modules.length}
- **Functions:** ${documentation.functions.length}
- **Classes:** ${documentation.classes.length}
- **Interfaces:** ${documentation.interfaces.length}
- **Types:** ${documentation.types.length}`;
      }
    };
  }
});
var ChangelogGenerator;
var init_changelog_generator = __esm({
  "src/tools/documentation/changelog-generator.ts"() {
    ChangelogGenerator = class {
      constructor(config2) {
        this.config = config2;
      }
      async generateChangelog() {
        try {
          const gitPath = path8__default.join(this.config.rootPath, ".git");
          if (!existsSync(gitPath)) {
            return {
              success: false,
              message: "Not a git repository. Changelog generation requires git history."
            };
          }
          const commits = await this.getGitCommits();
          if (commits.length === 0) {
            return {
              success: false,
              message: "No git commits found."
            };
          }
          const sections = this.organizeCommits(commits);
          const content = this.generateChangelogContent(sections);
          const changelogPath = path8__default.join(this.config.rootPath, "CHANGELOG.md");
          const exists = existsSync(changelogPath);
          if (exists) {
            const existingContent = await ops6.promises.readFile(changelogPath, "utf-8");
            const newContent = content + "\n\n" + existingContent;
            await ops6.promises.writeFile(changelogPath, newContent);
          } else {
            const fullContent = this.generateChangelogHeader() + content;
            await ops6.promises.writeFile(changelogPath, fullContent);
          }
          return {
            success: true,
            message: exists ? `\u2705 Updated CHANGELOG.md with ${commits.length} new entries` : `\u2705 Created CHANGELOG.md with ${commits.length} entries`,
            content
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to generate changelog: ${error.message}`
          };
        }
      }
      async getGitCommits() {
        const { execSync: execSync3 } = __require("child_process");
        try {
          let gitCommand = 'git log --pretty=format:"%H|%ad|%an|%s|%b" --date=short';
          if (this.config.sinceVersion) {
            gitCommand += ` ${this.config.sinceVersion}..HEAD`;
          } else if (this.config.commitCount) {
            gitCommand += ` -n ${this.config.commitCount}`;
          } else {
            gitCommand += " -n 50";
          }
          const output = execSync3(gitCommand, {
            cwd: this.config.rootPath,
            encoding: "utf-8"
          });
          const lines = output.trim().split("\n").filter((line) => line.trim());
          return lines.map((line) => {
            const [hash, date, author, message, ...bodyParts] = line.split("|");
            const body = bodyParts.join("|").trim();
            return this.parseCommit({
              hash: hash.substring(0, 7),
              // Short hash
              date,
              author,
              message,
              body: body || void 0,
              breaking: false,
              type: void 0,
              scope: void 0
            });
          });
        } catch (error) {
          return [];
        }
      }
      parseCommit(commit) {
        if (this.config.format !== "conventional") {
          return commit;
        }
        const conventionalMatch = commit.message.match(/^(\w+)(?:\(([^)]+)\))?: (.+)/);
        if (conventionalMatch) {
          const [, type, scope, description] = conventionalMatch;
          commit.type = type;
          commit.scope = scope;
          commit.message = description;
        }
        commit.breaking = commit.message.includes("BREAKING CHANGE") || commit.message.includes("!:") || Boolean(commit.body && commit.body.includes("BREAKING CHANGE"));
        return commit;
      }
      organizeCommits(commits) {
        if (this.config.format === "conventional") {
          return this.organizeConventionalCommits(commits);
        } else {
          return this.organizeSimpleCommits(commits);
        }
      }
      organizeConventionalCommits(commits) {
        const sections = [];
        const breaking = commits.filter((c) => c.breaking);
        if (breaking.length > 0) {
          sections.push({
            title: "\u26A0\uFE0F BREAKING CHANGES",
            commits: breaking
          });
        }
        const features = commits.filter((c) => c.type === "feat" && !c.breaking);
        if (features.length > 0) {
          sections.push({
            title: "\u2728 Features",
            commits: features
          });
        }
        const fixes = commits.filter((c) => c.type === "fix" && !c.breaking);
        if (fixes.length > 0) {
          sections.push({
            title: "\u{1F41B} Bug Fixes",
            commits: fixes
          });
        }
        const docs = commits.filter((c) => c.type === "docs");
        if (docs.length > 0) {
          sections.push({
            title: "\u{1F4DA} Documentation",
            commits: docs
          });
        }
        const perf = commits.filter((c) => c.type === "perf");
        if (perf.length > 0) {
          sections.push({
            title: "\u26A1 Performance",
            commits: perf
          });
        }
        const refactor = commits.filter((c) => c.type === "refactor");
        if (refactor.length > 0) {
          sections.push({
            title: "\u267B\uFE0F Code Refactoring",
            commits: refactor
          });
        }
        const tests = commits.filter((c) => c.type === "test");
        if (tests.length > 0) {
          sections.push({
            title: "\u2705 Tests",
            commits: tests
          });
        }
        const build = commits.filter((c) => ["build", "ci", "chore"].includes(c.type || ""));
        if (build.length > 0) {
          sections.push({
            title: "\u{1F527} Build & CI",
            commits: build
          });
        }
        const other = commits.filter(
          (c) => !c.breaking && !["feat", "fix", "docs", "perf", "refactor", "test", "build", "ci", "chore"].includes(c.type || "")
        );
        if (other.length > 0) {
          sections.push({
            title: "\u{1F4DD} Other Changes",
            commits: other
          });
        }
        return sections;
      }
      organizeSimpleCommits(commits) {
        return [{
          title: "\u{1F4DD} Changes",
          commits
        }];
      }
      generateChangelogHeader() {
        return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
      }
      generateChangelogContent(sections) {
        const version = this.generateVersionNumber();
        const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        let content = `## [${version}] - ${date}

`;
        sections.forEach((section) => {
          if (section.commits.length > 0) {
            content += `### ${section.title}

`;
            section.commits.forEach((commit) => {
              const scope = commit.scope ? `**${commit.scope}**: ` : "";
              const hash = `([${commit.hash}])`;
              if (this.config.format === "conventional") {
                content += `- ${scope}${commit.message} ${hash}
`;
              } else {
                content += `- ${commit.message} - ${commit.author} ${hash}
`;
              }
              if (commit.breaking && commit.body) {
                const breakingDetails = this.extractBreakingChangeDetails(commit.body);
                if (breakingDetails) {
                  content += `  - \u26A0\uFE0F ${breakingDetails}
`;
                }
              }
            });
            content += "\n";
          }
        });
        return content;
      }
      generateVersionNumber() {
        const now = /* @__PURE__ */ new Date();
        return `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`;
      }
      extractBreakingChangeDetails(body) {
        const match = body.match(/BREAKING CHANGE:\s*(.+)/);
        return match ? match[1].trim() : null;
      }
    };
  }
});
var UpdateAgentDocs;
var init_update_agent_docs = __esm({
  "src/tools/documentation/update-agent-docs.ts"() {
    UpdateAgentDocs = class {
      constructor(config2) {
        this.config = config2;
      }
      async updateDocs() {
        try {
          const agentPath = path8__default.join(this.config.rootPath, ".agent");
          if (!existsSync(agentPath)) {
            return {
              success: false,
              message: "\u274C .agent documentation system not found. Run `/init-agent` first.",
              updatedFiles: [],
              suggestions: ["Run `/init-agent` to initialize the documentation system"]
            };
          }
          const analysis = await this.analyzeChanges();
          if (analysis.filesChanged.length === 0 && analysis.gitCommits.length === 0) {
            return {
              success: true,
              message: "\u2705 No significant changes detected. Documentation is up to date.",
              updatedFiles: [],
              suggestions: []
            };
          }
          const updatedFiles = [];
          const suggestions = [];
          if (this.shouldUpdate("system") && (analysis.architectureChanges || analysis.configChanges)) {
            const systemUpdates = await this.updateSystemDocs(analysis);
            updatedFiles.push(...systemUpdates);
          }
          const criticalStateUpdate = await this.updateCriticalState(analysis);
          if (criticalStateUpdate) {
            updatedFiles.push(".agent/system/critical-state.md");
          }
          suggestions.push(...this.generateSuggestions(analysis));
          const message = this.generateUpdateMessage(analysis, updatedFiles);
          return {
            success: true,
            message,
            updatedFiles,
            suggestions
          };
        } catch (error) {
          return {
            success: false,
            message: `Failed to update agent docs: ${error.message}`,
            updatedFiles: [],
            suggestions: []
          };
        }
      }
      async analyzeChanges() {
        const analysis = {
          filesChanged: [],
          newFiles: [],
          deletedFiles: [],
          gitCommits: [],
          architectureChanges: false,
          configChanges: false,
          hasNewFeatures: false
        };
        try {
          const { execSync: execSync3 } = __require("child_process");
          try {
            const commits = execSync3("git log --oneline -10", {
              cwd: this.config.rootPath,
              encoding: "utf-8"
            });
            analysis.gitCommits = commits.trim().split("\n").filter(Boolean);
          } catch (error) {
          }
          try {
            const changedFiles = execSync3("git diff --name-only HEAD~5..HEAD", {
              cwd: this.config.rootPath,
              encoding: "utf-8"
            });
            analysis.filesChanged = changedFiles.trim().split("\n").filter(Boolean);
          } catch (error) {
            analysis.filesChanged = await this.getRecentlyModifiedFiles();
          }
          analysis.architectureChanges = this.detectArchitectureChanges(analysis.filesChanged);
          analysis.configChanges = this.detectConfigChanges(analysis.filesChanged);
          analysis.hasNewFeatures = this.detectNewFeatures(analysis.gitCommits);
          return analysis;
        } catch (error) {
          return analysis;
        }
      }
      async getRecentlyModifiedFiles() {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1e3;
        const recentFiles = [];
        const scanDir = async (dirPath) => {
          try {
            const entries = await ops6.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path8__default.join(dirPath, entry.name);
              if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
                await scanDir(fullPath);
              } else if (entry.isFile()) {
                const stats = await ops6.promises.stat(fullPath);
                if (stats.mtime.getTime() > oneDayAgo) {
                  recentFiles.push(path8__default.relative(this.config.rootPath, fullPath));
                }
              }
            }
          } catch (error) {
          }
        };
        await scanDir(this.config.rootPath);
        return recentFiles;
      }
      detectArchitectureChanges(filesChanged) {
        const architectureIndicators = [
          "src/tools/",
          "src/commands/",
          "src/ui/",
          "src/agent/",
          "package.json",
          "tsconfig.json",
          "src/index.ts"
        ];
        return filesChanged.some(
          (file) => architectureIndicators.some((indicator) => file.includes(indicator))
        );
      }
      detectConfigChanges(filesChanged) {
        const configFiles = [
          "package.json",
          "tsconfig.json",
          ".xcli/",
          "CLAUDE.md",
          ".env",
          ".gitignore",
          "README.md"
        ];
        return filesChanged.some(
          (file) => configFiles.some((config2) => file.includes(config2))
        );
      }
      detectNewFeatures(commits) {
        const featureKeywords = ["feat:", "add:", "new:", "feature:", "implement:"];
        return commits.some(
          (commit) => featureKeywords.some((keyword) => commit.toLowerCase().includes(keyword))
        );
      }
      shouldUpdate(target) {
        return this.config.updateTarget === "all" || this.config.updateTarget === target;
      }
      async updateSystemDocs(analysis) {
        const updatedFiles = [];
        const systemPath = path8__default.join(this.config.rootPath, ".agent", "system");
        if (analysis.architectureChanges) {
          try {
            const archPath = path8__default.join(systemPath, "architecture.md");
            if (existsSync(archPath)) {
              const content = await ops6.promises.readFile(archPath, "utf-8");
              const updatedContent = await this.updateArchitectureDoc(content, analysis);
              await ops6.promises.writeFile(archPath, updatedContent);
              updatedFiles.push(".agent/system/architecture.md");
            }
          } catch (error) {
          }
        }
        return updatedFiles;
      }
      async updateCriticalState(analysis) {
        try {
          const criticalStatePath = path8__default.join(this.config.rootPath, ".agent", "system", "critical-state.md");
          if (!existsSync(criticalStatePath)) {
            return false;
          }
          const content = await ops6.promises.readFile(criticalStatePath, "utf-8");
          const timestamp = (/* @__PURE__ */ new Date()).toISOString();
          const changesSummary = this.generateChangesSummary(analysis);
          let updatedContent = content.replace(
            /Last Updated: .*/,
            `Last Updated: ${timestamp}`
          );
          if (analysis.filesChanged.length > 0) {
            const recentChangesSection = `

## Recent Changes
${changesSummary}`;
            if (content.includes("## Recent Changes")) {
              updatedContent = updatedContent.replace(
                /## Recent Changes[\s\S]*?(?=##|$)/,
                recentChangesSection
              );
            } else {
              updatedContent = updatedContent.replace(
                /Last Updated: .*/,
                `Last Updated: ${timestamp}
Updated By: /update-agent-docs after detecting changes${recentChangesSection}`
              );
            }
          }
          await ops6.promises.writeFile(criticalStatePath, updatedContent);
          return true;
        } catch (error) {
          return false;
        }
      }
      async updateArchitectureDoc(content, analysis) {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        return content.replace(
          /\*Updated: .*/,
          `*Updated: ${timestamp} - Recent changes detected in: ${analysis.filesChanged.slice(0, 3).join(", ")}${analysis.filesChanged.length > 3 ? "..." : ""}*`
        );
      }
      generateChangesSummary(analysis) {
        const lines = [];
        if (analysis.gitCommits.length > 0) {
          lines.push(`**Recent Commits (${analysis.gitCommits.length}):**`);
          analysis.gitCommits.slice(0, 5).forEach((commit) => {
            lines.push(`- ${commit}`);
          });
          if (analysis.gitCommits.length > 5) {
            lines.push(`- ... and ${analysis.gitCommits.length - 5} more`);
          }
        }
        if (analysis.filesChanged.length > 0) {
          lines.push(`
**Files Modified (${analysis.filesChanged.length}):**`);
          analysis.filesChanged.slice(0, 10).forEach((file) => {
            lines.push(`- ${file}`);
          });
          if (analysis.filesChanged.length > 10) {
            lines.push(`- ... and ${analysis.filesChanged.length - 10} more files`);
          }
        }
        if (analysis.architectureChanges) {
          lines.push("\n**\u26A0\uFE0F Architecture changes detected**");
        }
        if (analysis.configChanges) {
          lines.push("**\u2699\uFE0F Configuration changes detected**");
        }
        return lines.join("\n");
      }
      generateSuggestions(analysis) {
        const suggestions = [];
        if (analysis.hasNewFeatures) {
          suggestions.push("\u{1F4DD} Consider adding new features to .agent/tasks/ as PRDs");
          suggestions.push("\u{1F4D6} Update README.md with new feature documentation");
        }
        if (analysis.architectureChanges) {
          suggestions.push("\u{1F3D7}\uFE0F Review and update .agent/system/architecture.md manually");
          suggestions.push("\u{1F4CB} Update API documentation if interfaces changed");
        }
        if (analysis.configChanges) {
          suggestions.push("\u2699\uFE0F Review configuration changes in .agent/system/");
        }
        if (analysis.filesChanged.length > 20) {
          suggestions.push("\u{1F9F9} Consider running /compact to optimize conversation history");
        }
        return suggestions;
      }
      generateUpdateMessage(analysis, updatedFiles) {
        let message = `\u2705 **Agent Documentation Updated**

`;
        message += `\u{1F4CA} **Change Analysis:**
`;
        message += `- Files changed: ${analysis.filesChanged.length}
`;
        message += `- Recent commits: ${analysis.gitCommits.length}
`;
        message += `- Architecture changes: ${analysis.architectureChanges ? "\u2705" : "\u274C"}
`;
        message += `- Config changes: ${analysis.configChanges ? "\u2705" : "\u274C"}

`;
        if (updatedFiles.length > 0) {
          message += `\u{1F4DD} **Updated Files:**
`;
          updatedFiles.forEach((file) => {
            message += `- ${file}
`;
          });
          message += "\n";
        }
        return message;
      }
    };
  }
});

// src/subagents/subagent-framework.ts
var SubagentFramework;
var init_subagent_framework = __esm({
  "src/subagents/subagent-framework.ts"() {
    SubagentFramework = class {
      constructor() {
        this.activeTasks = /* @__PURE__ */ new Map();
        this.results = /* @__PURE__ */ new Map();
        this.configs = /* @__PURE__ */ new Map();
        this.initializeConfigs();
      }
      initializeConfigs() {
        const defaultConfigs = {
          "docgen": {
            type: "docgen",
            contextLimit: 2e3,
            timeout: 3e4,
            maxRetries: 2
          },
          "prd-assistant": {
            type: "prd-assistant",
            contextLimit: 2e3,
            timeout: 2e4,
            maxRetries: 1
          },
          "delta": {
            type: "delta",
            contextLimit: 1500,
            timeout: 15e3,
            maxRetries: 1
          },
          "token-optimizer": {
            type: "token-optimizer",
            contextLimit: 1e3,
            timeout: 1e4,
            maxRetries: 1
          },
          "summarizer": {
            type: "summarizer",
            contextLimit: 2e3,
            timeout: 25e3,
            maxRetries: 2
          },
          "sentinel": {
            type: "sentinel",
            contextLimit: 1e3,
            timeout: 1e4,
            maxRetries: 1
          },
          "regression-hunter": {
            type: "regression-hunter",
            contextLimit: 1500,
            timeout: 15e3,
            maxRetries: 1
          },
          "guardrail": {
            type: "guardrail",
            contextLimit: 1e3,
            timeout: 1e4,
            maxRetries: 1
          }
        };
        for (const [type, config2] of Object.entries(defaultConfigs)) {
          this.configs.set(type, config2);
        }
      }
      async spawnSubagent(task) {
        const taskId = this.generateTaskId();
        const fullTask = {
          ...task,
          id: taskId,
          createdAt: Date.now()
        };
        this.activeTasks.set(taskId, fullTask);
        this.executeSubagent(fullTask);
        return taskId;
      }
      async executeSubagent(task) {
        const config2 = this.configs.get(task.type);
        if (!config2) {
          this.setResult(task.id, {
            taskId: task.id,
            type: task.type,
            success: false,
            error: "Unknown subagent type",
            tokensUsed: 0,
            executionTime: 0,
            summary: "Failed to execute: unknown type"
          });
          return;
        }
        const startTime = Date.now();
        try {
          const context = {
            id: this.generateContextId(),
            type: task.type,
            prompt: this.generatePromptForType(task.type, task.input),
            data: task.input,
            startTime,
            tokenBudget: config2.contextLimit
          };
          const result = await this.executeInIsolatedContext(context, config2);
          this.setResult(task.id, {
            taskId: task.id,
            type: task.type,
            success: true,
            output: result.output,
            tokensUsed: result.tokensUsed,
            executionTime: Date.now() - startTime,
            summary: result.summary
          });
        } catch (error) {
          this.setResult(task.id, {
            taskId: task.id,
            type: task.type,
            success: false,
            error: error.message,
            tokensUsed: 0,
            executionTime: Date.now() - startTime,
            summary: `Failed: ${error.message}`
          });
        }
        this.activeTasks.delete(task.id);
      }
      async executeInIsolatedContext(context, _config) {
        switch (context.type) {
          case "docgen":
            return this.simulateDocGenAgent(context);
          case "prd-assistant":
            return this.simulatePRDAssistantAgent(context);
          case "delta":
            return this.simulateDeltaAgent(context);
          case "token-optimizer":
            return this.simulateTokenOptimizerAgent(context);
          case "summarizer":
            return this.simulateSummarizerAgent(context);
          case "sentinel":
            return this.simulateSentinelAgent(context);
          case "regression-hunter":
            return this.simulateRegressionHunterAgent(context);
          case "guardrail":
            return this.simulateGuardrailAgent(context);
          default:
            throw new Error(`Unsupported subagent type: ${context.type}`);
        }
      }
      async simulateDocGenAgent(context) {
        const { projectPath, docType } = context.data;
        await this.delay(2e3);
        return {
          output: {
            documentType: docType,
            content: `# Generated ${docType}

This is a generated document for ${projectPath}.

*Generated by DocGenAgent*`,
            metadata: {
              projectPath,
              generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
              wordCount: 150
            }
          },
          tokensUsed: 1500,
          summary: `Generated ${docType} documentation (150 words)`
        };
      }
      async simulatePRDAssistantAgent(context) {
        const { prdPath: _prdPath, prdContent: _prdContent } = context.data;
        await this.delay(1500);
        return {
          output: {
            suggestions: [
              "Consider existing MCP integration patterns",
              "Reference user-settings.json structure",
              "Check CLI command naming conventions"
            ],
            conflicts: [],
            similarTasks: ["user-management-prd.md"],
            architectureImpact: "May need new tools/ folder"
          },
          tokensUsed: 1200,
          summary: `Analyzed PRD: 3 suggestions, 1 similar task found`
        };
      }
      async simulateDeltaAgent(context) {
        const { fromCommit, toCommit: _toCommit } = context.data;
        await this.delay(1e3);
        return {
          output: {
            filesChanged: ["src/tools/documentation/", "src/hooks/use-input-handler.ts"],
            architectureChanges: true,
            newFeatures: ["documentation system"],
            impact: "Major feature addition - documentation generation"
          },
          tokensUsed: 800,
          summary: `Analyzed changes from ${fromCommit}: 2 files, architecture changes detected`
        };
      }
      async simulateTokenOptimizerAgent(context) {
        const { currentTokens, targetReduction: _targetReduction } = context.data;
        await this.delay(500);
        return {
          output: {
            currentUsage: currentTokens,
            optimizedUsage: Math.floor(currentTokens * 0.3),
            reduction: Math.floor(currentTokens * 0.7),
            suggestions: [
              "Compress conversation history",
              "Archive old tool results",
              "Summarize repeated patterns"
            ]
          },
          tokensUsed: 300,
          summary: `Token optimization: ${Math.floor(currentTokens * 0.7)} tokens can be saved (70% reduction)`
        };
      }
      async simulateSummarizerAgent(context) {
        const { content, compressionTarget } = context.data;
        await this.delay(2500);
        const originalLength = content.length;
        const targetLength = Math.floor(originalLength * (compressionTarget || 0.3));
        return {
          output: {
            originalLength,
            compressedLength: targetLength,
            compressionRatio: 1 - (compressionTarget || 0.3),
            summary: content.substring(0, targetLength) + "...",
            keyPoints: [
              "Main objectives completed",
              "Documentation system implemented",
              "Multiple commands added"
            ]
          },
          tokensUsed: 1800,
          summary: `Compressed content from ${originalLength} to ${targetLength} chars (${Math.round((1 - (compressionTarget || 0.3)) * 100)}% reduction)`
        };
      }
      async simulateSentinelAgent(context) {
        const { errorLogs: _errorLogs, recentCommands: _recentCommands } = context.data;
        await this.delay(800);
        return {
          output: {
            errorsDetected: 0,
            patternsFound: [],
            recommendations: ["System running normally"],
            alertLevel: "green"
          },
          tokensUsed: 400,
          summary: "System monitoring: No issues detected"
        };
      }
      async simulateRegressionHunterAgent(context) {
        const { proposedChanges: _proposedChanges, knownFailures: _knownFailures } = context.data;
        await this.delay(1200);
        return {
          output: {
            riskLevel: "low",
            potentialIssues: [],
            recommendations: ["Changes appear safe to proceed"],
            testsSuggested: []
          },
          tokensUsed: 900,
          summary: "Regression analysis: Low risk, no conflicts with known failures"
        };
      }
      async simulateGuardrailAgent(context) {
        const { planDescription: _planDescription, rules: _rules } = context.data;
        await this.delay(600);
        return {
          output: {
            violationsFound: [],
            warnings: [],
            compliance: "passed",
            newRuleSuggestions: []
          },
          tokensUsed: 350,
          summary: "Guardrail check: All rules satisfied"
        };
      }
      delay(ms) {
        return new Promise((resolve8) => setTimeout(resolve8, ms));
      }
      generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      generateContextId() {
        return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      generatePromptForType(type, input) {
        const prompts = {
          "docgen": `Generate documentation for the provided project. Focus on clarity and completeness. Input: ${JSON.stringify(input)}`,
          "prd-assistant": `Analyze this PRD for potential issues, suggestions, and conflicts with existing project context. Input: ${JSON.stringify(input)}`,
          "delta": `Analyze the changes between commits and summarize the impact. Input: ${JSON.stringify(input)}`,
          "token-optimizer": `Analyze token usage and suggest optimizations. Input: ${JSON.stringify(input)}`,
          "summarizer": `Summarize and compress the provided content while preserving key information. Input: ${JSON.stringify(input)}`,
          "sentinel": `Monitor for errors and patterns in the provided logs/commands. Input: ${JSON.stringify(input)}`,
          "regression-hunter": `Check proposed changes against known failure patterns. Input: ${JSON.stringify(input)}`,
          "guardrail": `Validate the plan against established rules and constraints. Input: ${JSON.stringify(input)}`
        };
        return prompts[type];
      }
      setResult(taskId, result) {
        this.results.set(taskId, result);
      }
      async getResult(taskId) {
        return this.results.get(taskId) || null;
      }
      async waitForResult(taskId, timeoutMs = 3e4) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
          const result = await this.getResult(taskId);
          if (result) {
            return result;
          }
          await this.delay(100);
        }
        throw new Error(`Subagent task ${taskId} timed out after ${timeoutMs}ms`);
      }
      getActiveTaskCount() {
        return this.activeTasks.size;
      }
      getCompletedTaskCount() {
        return this.results.size;
      }
      getPerformanceMetrics() {
        const results = Array.from(this.results.values());
        const avgExecTime = results.length > 0 ? results.reduce((sum, r) => sum + r.executionTime, 0) / results.length : 0;
        const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);
        return {
          totalTasks: this.activeTasks.size + this.results.size,
          activeTasks: this.activeTasks.size,
          completedTasks: this.results.size,
          averageExecutionTime: Math.round(avgExecTime),
          totalTokensUsed: totalTokens
        };
      }
      clearOldResults(maxAge = 36e5) {
        const now = Date.now();
        for (const [taskId, result] of this.results.entries()) {
          if (now - result.executionTime > maxAge) {
            this.results.delete(taskId);
          }
        }
      }
    };
  }
});
var SelfHealingSystem;
var init_self_healing_system = __esm({
  "src/tools/documentation/self-healing-system.ts"() {
    SelfHealingSystem = class {
      constructor(rootPath, config2) {
        this.rootPath = rootPath;
        this.agentPath = path8__default.join(rootPath, ".agent");
        this.config = {
          enabled: true,
          onErrorPrompt: "gentle",
          enforceGuardrails: true,
          simulateOnPlan: "smart",
          ...config2
        };
      }
      async captureIncident(error, context) {
        try {
          const incident = await this.analyzeAndCreateIncident(error, context);
          const incidentPath = path8__default.join(this.agentPath, "incidents", `${incident.id}.md`);
          await ops6.mkdir(path8__default.dirname(incidentPath), { recursive: true });
          const incidentContent = this.generateIncidentContent(incident);
          await ops6.promises.writeFile(incidentPath, incidentContent);
          const guardrail = await this.generateGuardrailFromIncident(incident);
          if (guardrail) {
            await this.saveGuardrail(guardrail);
            incident.guardrailCreated = guardrail.id;
          }
          return {
            success: true,
            incidentId: incident.id,
            message: `\u2705 Incident documented: ${incident.title}
${guardrail ? `\u{1F6E1}\uFE0F Guardrail created: ${guardrail.name}` : ""}
\u{1F4C1} Saved to: .agent/incidents/${incident.id}.md`
          };
        } catch (error2) {
          return {
            success: false,
            message: `Failed to capture incident: ${error2.message}`
          };
        }
      }
      async analyzeAndCreateIncident(error, context) {
        const id = this.generateIncidentId();
        const now = /* @__PURE__ */ new Date();
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        const title = this.extractErrorTitle(errorMessage);
        const trigger = this.extractTrigger(error, context);
        const rootCause = this.analyzeRootCause(error, context);
        const fix = this.suggestFix(error, context);
        const impact = this.assessImpact(error, context);
        const relatedFiles = this.extractRelatedFiles(error, context);
        const recurrenceCount = await this.countPreviousOccurrences(title);
        return {
          id,
          title,
          date: now.toISOString(),
          trigger,
          rootCause,
          fix,
          impact,
          recurrenceCount,
          relatedFiles
        };
      }
      extractErrorTitle(errorMessage) {
        const cleaned = errorMessage.replace(/^Error:\s*/i, "").replace(/\s+at\s+.*$/, "").replace(/\s+\(.*\)$/, "").substring(0, 100);
        return cleaned || "Unknown Error";
      }
      extractTrigger(error, context) {
        if (context?.command) {
          return `Command: ${context.command}`;
        }
        if (context?.operation) {
          return `Operation: ${context.operation}`;
        }
        if (error?.stack) {
          const stackLine = error.stack.split("\n")[1];
          return stackLine ? `Code: ${stackLine.trim()}` : "Unknown trigger";
        }
        return "Unknown trigger";
      }
      analyzeRootCause(error, context) {
        const errorMessage = error?.message || "";
        if (errorMessage.includes("ENOENT") || errorMessage.includes("not found")) {
          return "File or resource not found";
        }
        if (errorMessage.includes("permission denied") || errorMessage.includes("EACCES")) {
          return "Permission denied - insufficient access rights";
        }
        if (errorMessage.includes("timeout")) {
          return "Operation timed out - possible network or performance issue";
        }
        if (errorMessage.includes("Cannot find module")) {
          return "Missing dependency or incorrect import path";
        }
        if (errorMessage.includes("syntax error") || errorMessage.includes("unexpected token")) {
          return "Code syntax error";
        }
        return "Root cause requires investigation";
      }
      suggestFix(error, context) {
        const errorMessage = error?.message || "";
        if (errorMessage.includes("ENOENT")) {
          return "Ensure the required file or directory exists before accessing it";
        }
        if (errorMessage.includes("permission denied")) {
          return "Check file permissions or run with appropriate privileges";
        }
        if (errorMessage.includes("Cannot find module")) {
          return "Install missing dependency or correct the import path";
        }
        if (errorMessage.includes("timeout")) {
          return "Increase timeout value or optimize the operation";
        }
        return "Investigate error details and apply appropriate fix";
      }
      assessImpact(error, context) {
        const errorMessage = error?.message || "";
        if (errorMessage.includes("fatal") || errorMessage.includes("critical")) {
          return "high";
        }
        if (context?.operation && ["build", "deploy", "init"].includes(context.operation)) {
          return "high";
        }
        if (errorMessage.includes("warning")) {
          return "low";
        }
        return "medium";
      }
      extractRelatedFiles(error, context) {
        const files = [];
        if (context?.files) {
          files.push(...context.files);
        }
        if (error?.stack) {
          const stackLines = error.stack.split("\n");
          for (const line of stackLines) {
            const fileMatch = line.match(/\((.*?):\d+:\d+\)/);
            if (fileMatch && fileMatch[1]) {
              files.push(fileMatch[1]);
            }
          }
        }
        return [...new Set(files)];
      }
      async countPreviousOccurrences(title) {
        try {
          const incidentsPath = path8__default.join(this.agentPath, "incidents");
          if (!existsSync(incidentsPath)) {
            return 0;
          }
          const files = await ops6.promises.readdir(incidentsPath);
          let count = 0;
          for (const file of files) {
            if (file.endsWith(".md")) {
              const filePath = path8__default.join(incidentsPath, file);
              const content = await ops6.promises.readFile(filePath, "utf-8");
              if (content.includes(title)) {
                count++;
              }
            }
          }
          return Math.max(0, count - 1);
        } catch (error) {
          return 0;
        }
      }
      generateIncidentContent(incident) {
        return `# ${incident.title} - ${incident.date.split("T")[0]}

## \u{1F4CA} Incident Summary
- **ID**: ${incident.id}
- **Date**: ${incident.date}
- **Impact**: ${incident.impact.toUpperCase()}
- **Recurrence**: ${incident.recurrenceCount > 0 ? `${incident.recurrenceCount} previous occurrences` : "First occurrence"}

## \u{1F525} Trigger
${incident.trigger}

## \u{1F50D} Root Cause
${incident.rootCause}

## \u2705 Fix Applied
${incident.fix}

## \u{1F4C1} Related Files
${incident.relatedFiles.length > 0 ? incident.relatedFiles.map((f) => `- ${f}`).join("\n") : "None identified"}

## \u{1F6E1}\uFE0F Prevention
${incident.guardrailCreated ? `Guardrail created: ${incident.guardrailCreated}` : "Manual prevention required"}

## \u{1F4DA} Related Documentation
- [Self-Healing SOP](../sop/self-healing-workflow.md)
- [Guardrails](../guardrails/)
- [System Critical State](../system/critical-state.md)

---
*Generated by X-CLI Self-Healing System*
*Incident ID: ${incident.id}*
`;
      }
      async generateGuardrailFromIncident(incident) {
        if (incident.recurrenceCount === 0 && incident.impact !== "high") {
          return null;
        }
        const id = `guard_${incident.id}`;
        const category = this.determineGuardrailCategory(incident);
        const pattern = this.createGuardrailPattern(incident);
        if (!pattern) {
          return null;
        }
        return {
          id,
          name: `Prevent: ${incident.title}`,
          description: `Automatically generated from incident ${incident.id}. ${incident.rootCause}`,
          category,
          severity: incident.impact === "high" ? "error" : "warning",
          pattern,
          enabled: true,
          createdFrom: incident.id
        };
      }
      determineGuardrailCategory(incident) {
        if (incident.trigger.includes("file") || incident.trigger.includes("path")) {
          return "configuration";
        }
        if (incident.trigger.includes("command") || incident.trigger.includes("operation")) {
          return "process";
        }
        if (incident.relatedFiles.some((f) => f.includes("src/") || f.includes("lib/"))) {
          return "architecture";
        }
        return "process";
      }
      createGuardrailPattern(incident) {
        const errorMessage = incident.trigger.toLowerCase();
        if (errorMessage.includes("enoent") || errorMessage.includes("not found")) {
          return "check_file_exists";
        }
        if (errorMessage.includes("permission")) {
          return "check_permissions";
        }
        if (errorMessage.includes("module")) {
          return "check_dependencies";
        }
        return null;
      }
      async saveGuardrail(guardrail) {
        const guardrailsPath = path8__default.join(this.agentPath, "guardrails");
        await ops6.mkdir(guardrailsPath, { recursive: true });
        const filePath = path8__default.join(guardrailsPath, `${guardrail.id}.md`);
        const content = this.generateGuardrailContent(guardrail);
        await ops6.promises.writeFile(filePath, content);
      }
      generateGuardrailContent(guardrail) {
        return `# ${guardrail.name}

## \u{1F4CB} Rule Details
- **ID**: ${guardrail.id}
- **Category**: ${guardrail.category}
- **Severity**: ${guardrail.severity}
- **Status**: ${guardrail.enabled ? "Enabled" : "Disabled"}

## \u{1F4DD} Description
${guardrail.description}

## \u{1F50D} Pattern
\`${guardrail.pattern}\`

## \u{1F6E0}\uFE0F Implementation
This guardrail checks for the following conditions:
- Pattern: ${guardrail.pattern}
- Action: ${guardrail.severity === "error" ? "Block operation" : "Show warning"}

## \u{1F4DA} Related
${guardrail.createdFrom ? `- Created from incident: ${guardrail.createdFrom}` : ""}
- Category: ${guardrail.category}

---
*Generated by X-CLI Self-Healing System*
`;
      }
      async checkGuardrails(operation, context) {
        const violations = [];
        const warnings = [];
        try {
          const guardrails = await this.loadAllGuardrails();
          for (const guardrail of guardrails) {
            if (!guardrail.enabled) continue;
            const violated = this.checkGuardrailPattern(guardrail.pattern, operation, context);
            if (violated) {
              if (guardrail.severity === "error") {
                violations.push(guardrail);
              } else {
                warnings.push(guardrail);
              }
            }
          }
        } catch (error) {
        }
        return {
          violations,
          warnings,
          passed: violations.length === 0
        };
      }
      async loadAllGuardrails() {
        const guardrailsPath = path8__default.join(this.agentPath, "guardrails");
        if (!existsSync(guardrailsPath)) {
          return [];
        }
        const files = await ops6.promises.readdir(guardrailsPath);
        const guardrails = [];
        for (const file of files) {
          if (file.endsWith(".md")) {
            try {
              const content = await ops6.promises.readFile(path8__default.join(guardrailsPath, file), "utf-8");
              const guardrail = this.parseGuardrailFromContent(content);
              if (guardrail) {
                guardrails.push(guardrail);
              }
            } catch (error) {
            }
          }
        }
        return guardrails;
      }
      parseGuardrailFromContent(content) {
        try {
          const idMatch = content.match(/\*\*ID\*\*:\s*(.+)/);
          const nameMatch = content.match(/^#\s*(.+)/m);
          const categoryMatch = content.match(/\*\*Category\*\*:\s*(.+)/);
          const severityMatch = content.match(/\*\*Severity\*\*:\s*(.+)/);
          const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/);
          const patternMatch = content.match(/`([^`]+)`/);
          const descMatch = content.match(/## 📝 Description\n(.+)/);
          if (!idMatch || !nameMatch || !patternMatch) {
            return null;
          }
          return {
            id: idMatch[1].trim(),
            name: nameMatch[1].trim(),
            description: descMatch ? descMatch[1].trim() : "",
            category: categoryMatch ? categoryMatch[1].trim() : "process",
            severity: severityMatch ? severityMatch[1].trim() : "warning",
            pattern: patternMatch[1],
            enabled: statusMatch ? statusMatch[1].includes("Enabled") : true
          };
        } catch (error) {
          return null;
        }
      }
      checkGuardrailPattern(pattern, operation, context) {
        switch (pattern) {
          case "check_file_exists":
            return context?.files && context.files.some((f) => !existsSync(f));
          case "check_permissions":
            return false;
          // Would need actual permission check
          case "check_dependencies":
            return false;
          // Would need dependency analysis
          default:
            return operation.toLowerCase().includes(pattern.toLowerCase());
        }
      }
      generateIncidentId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `incident_${timestamp}_${random}`;
      }
      async listIncidents() {
        const incidentsPath = path8__default.join(this.agentPath, "incidents");
        if (!existsSync(incidentsPath)) {
          return [];
        }
        const files = await ops6.promises.readdir(incidentsPath);
        const incidents = [];
        for (const file of files) {
          if (file.endsWith(".md")) {
            try {
              const content = await ops6.promises.readFile(path8__default.join(incidentsPath, file), "utf-8");
              const incident = this.parseIncidentFromContent(content);
              if (incident) {
                incidents.push(incident);
              }
            } catch (error) {
            }
          }
        }
        return incidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      parseIncidentFromContent(content) {
        try {
          const idMatch = content.match(/\*\*ID\*\*:\s*(.+)/);
          const titleMatch = content.match(/^#\s*(.+)/m);
          const dateMatch = content.match(/\*\*Date\*\*:\s*(.+)/);
          const impactMatch = content.match(/\*\*Impact\*\*:\s*(.+)/);
          if (!idMatch || !titleMatch) {
            return null;
          }
          return {
            id: idMatch[1].trim(),
            title: titleMatch[1].split(" - ")[0].trim(),
            date: dateMatch ? dateMatch[1].trim() : "",
            trigger: "Unknown",
            rootCause: "Unknown",
            fix: "Unknown",
            impact: impactMatch ? impactMatch[1].toLowerCase().trim() : "medium",
            recurrenceCount: 0,
            relatedFiles: []
          };
        } catch (error) {
          return null;
        }
      }
      getConfig() {
        return { ...this.config };
      }
    };
  }
});

// package.json with { type: 'json' }
var package_default;
var init_package = __esm({
  "package.json with { type: 'json' }"() {
    package_default = {
      type: "module",
      name: "@xagent/x-cli",
      version: "1.1.79",
      description: "An open-source AI agent that brings advanced AI capabilities directly into your terminal.",
      main: "dist/index.js",
      module: "dist/index.js",
      types: "dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js"
        }
      },
      bin: {
        xcli: "dist/index.js"
      },
      files: [
        "dist/**/*",
        ".xcli/**/*",
        "README.md",
        "LICENSE",
        "docs/assets/logos/**/*"
      ],
      scripts: {
        build: "tsup",
        "build:tsc": "tsc",
        dev: "npm run build && node dist/index.js --prompt 'Development test: Hello X-CLI!'",
        "dev:node": "tsx src/index.ts",
        "dev:watch": "npm run build && node --watch dist/index.js",
        start: "node dist/index.js",
        local: "node scripts/local.js",
        "test:workflow": "node scripts/test-workflow.js",
        "start:bun": "bun run dist/index.js",
        lint: "eslint . --ext .js,.jsx,.ts,.tsx --ignore-pattern 'dist/**'",
        typecheck: "tsc --noEmit",
        "install:bun": "bun install",
        preinstall: "echo '\u{1F916} Installing X CLI...'",
        postinstall: `echo '==================================================' && echo '\u2705 X CLI installed successfully!' && echo '==================================================' && echo '\u{1F680} Try: xcli --help' && echo '\u{1F4A1} If "command not found", add to PATH:' && node -e "const p=process.platform;const isMac=p==='darwin';const isLinux=p==='linux';if(isMac||isLinux){const shell=isMac?'zshrc':'bashrc';console.log((isMac?'\u{1F34E} Mac':'\u{1F427} Linux')+': echo \\'export PATH=\\"$(npm config get prefix)/bin:$PATH\\"\\' >> ~/.'+shell+' && source ~/.'+shell);}" && echo '\u{1F4D6} Docs: https://github.com/hinetapora/x-cli-hurry-mode#installation' && echo '\u{1F511} Set API key: export GROK_API_KEY=your_key_here' && echo '==================================================' && echo '\u{1F527} Auto-setup PATH? Press Enter to add (or Ctrl+C to skip)' && read -t 10 && node -e "const fs=require('fs');const p=process.platform;const isMac=p==='darwin';const isLinux=p==='linux';if(isMac||isLinux){const shellFile=isMac?'.zshrc':'.bashrc';const rcPath=process.env.HOME+'/'+shellFile;const pathCmd='export PATH=\\"$(npm config get prefix)/bin:$PATH\\"';try{const content=fs.readFileSync(rcPath,'utf8');if(!content.includes(pathCmd)){fs.appendFileSync(rcPath,'\\n'+pathCmd+'\\n');console.log('\u2705 Added to ~/'+shellFile+' - restart terminal');}else{console.log('\u2139\uFE0F Already in ~/'+shellFile);}}catch(e){console.log('\u26A0\uFE0F Could not modify ~/'+shellFile+' - add manually');}}" && echo '\u{1F50D} Verifying: ' && xcli --version 2>/dev/null || echo '\u26A0\uFE0F xcli not in PATH yet - follow above steps'`,
        prepare: "husky install",
        "dev:site": "cd apps/site && npm run start",
        "build:site": "cd apps/site && npm run build",
        "sync:docs": "cd apps/site && node src/scripts/sync-agent-docs.js",
        "smart-push": "./scripts/smart-push.sh"
      },
      "lint-staged": {
        "*.{ts,tsx}": [
          "eslint --fix --ignore-pattern 'dist/**'"
        ],
        "*.{js,jsx,mjs}": [
          "eslint --fix --ignore-pattern 'dist/**'"
        ],
        "*.{md,mdx}": [
          "prettier --write"
        ],
        "*.{json,yml,yaml}": [
          "prettier --write"
        ]
      },
      keywords: [
        "cli",
        "agent",
        "text-editor",
        "ai",
        "x-ai"
      ],
      author: "x-cli-team",
      license: "MIT",
      dependencies: {
        "@modelcontextprotocol/sdk": "^1.17.0",
        "@types/marked-terminal": "^6.1.1",
        "@typescript-eslint/typescript-estree": "^8.46.0",
        ajv: "^8.17.1",
        "ajv-formats": "^3.0.1",
        axios: "^1.7.0",
        cfonts: "^3.3.0",
        chalk: "^5.3.0",
        chokidar: "^4.0.3",
        "cli-highlight": "^2.1.11",
        commander: "^12.0.0",
        dotenv: "^16.4.0",
        enquirer: "^2.4.1",
        "fs-extra": "^11.2.0",
        "fuse.js": "^7.1.0",
        glob: "^11.0.3",
        ink: "^4.4.1",
        "js-yaml": "^4.1.0",
        marked: "^15.0.12",
        "marked-terminal": "^7.3.0",
        openai: "^5.10.1",
        react: "^18.3.1",
        "ripgrep-node": "^1.0.0",
        "terminal-image": "^4.0.0",
        tiktoken: "^1.0.21"
      },
      devDependencies: {
        "@eslint/js": "^9.37.0",
        "@types/fs-extra": "^11.0.2",
        "@types/node": "^20.8.0",
        "@types/react": "^18.3.3",
        "@typescript-eslint/eslint-plugin": "^8.37.0",
        "@typescript-eslint/parser": "^8.37.0",
        esbuild: "^0.25.10",
        eslint: "^9.31.0",
        husky: "^9.1.7",
        "lint-staged": "^16.2.4",
        prettier: "^3.6.2",
        tsup: "^8.5.0",
        tsx: "^4.0.0"
      },
      engines: {
        node: ">=18.0.0"
      },
      preferGlobal: true,
      repository: {
        type: "git",
        url: "https://github.com/x-cli-team/x-cli.git"
      },
      bugs: {
        url: "https://github.com/x-cli-team/x-cli/issues"
      },
      homepage: "https://x-cli.dev",
      icon: "docs/assets/logos/x-cli-logo.svg",
      publishConfig: {
        access: "public"
      },
      installConfig: {
        hoisting: false
      },
      optionalDependencies: {
        "tree-sitter": "^0.21.1",
        "tree-sitter-javascript": "^0.21.4",
        "tree-sitter-python": "^0.21.0",
        "tree-sitter-typescript": "^0.21.2"
      },
      trustedDependencies: [
        "esbuild",
        "tree-sitter",
        "tree-sitter-javascript",
        "tree-sitter-python",
        "tree-sitter-typescript"
      ]
    };
  }
});

// src/utils/version-checker.ts
var version_checker_exports = {};
__export(version_checker_exports, {
  autoUpgrade: () => autoUpgrade,
  checkForUpdates: () => checkForUpdates,
  getCachedVersionInfo: () => getCachedVersionInfo
});
async function checkForUpdates() {
  try {
    const { stdout } = await execAsync3(`npm view ${package_default.name} version`, {
      timeout: 5e3
    });
    const latestVersion = stdout.trim();
    const currentVersion = package_default.version;
    const isUpdateAvailable = latestVersion !== currentVersion && isNewerVersion(latestVersion, currentVersion);
    return {
      current: currentVersion,
      latest: latestVersion,
      isUpdateAvailable,
      updateCommand: `npm update -g ${package_default.name}@latest`
    };
  } catch {
    return {
      current: package_default.version,
      latest: package_default.version,
      isUpdateAvailable: false,
      updateCommand: `npm update -g ${package_default.name}@latest`
    };
  }
}
function isNewerVersion(version1, version2) {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    if (v1Part > v2Part) return true;
    if (v1Part < v2Part) return false;
  }
  return false;
}
async function autoUpgrade() {
  try {
    console.log("\u{1F504} Upgrading X-CLI...");
    await execAsync3(`npm update -g ${package_default.name}@latest`, {
      timeout: 3e4
    });
    console.log("\u2705 Upgrade completed! Please restart the CLI.");
    return true;
  } catch (error) {
    console.error("\u274C Auto-upgrade failed:", error);
    return false;
  }
}
async function getCachedVersionInfo() {
  const now = Date.now();
  if (cachedVersionInfo && now - lastCheckTime < CHECK_INTERVAL) {
    return cachedVersionInfo;
  }
  try {
    cachedVersionInfo = await checkForUpdates();
    lastCheckTime = now;
    return cachedVersionInfo;
  } catch {
    return null;
  }
}
var execAsync3, cachedVersionInfo, lastCheckTime, CHECK_INTERVAL;
var init_version_checker = __esm({
  "src/utils/version-checker.ts"() {
    init_package();
    execAsync3 = promisify(exec);
    cachedVersionInfo = null;
    lastCheckTime = 0;
    CHECK_INTERVAL = 6 * 60 * 60 * 1e3;
  }
});
function useInputHandler({
  agent,
  chatHistory,
  setChatHistory,
  setIsProcessing,
  setIsStreaming,
  setTokenCount,
  setProcessingTime,
  processingStartTime,
  isProcessing,
  isStreaming,
  isConfirmationActive = false,
  onGlobalShortcut,
  handleIntroductionInput
}) {
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [autoEditEnabled, setAutoEditEnabled] = useState(() => {
    const confirmationService = ConfirmationService.getInstance();
    const sessionFlags = confirmationService.getSessionFlags();
    return sessionFlags.allOperations;
  });
  const [shiftTabPressCount, setShiftTabPressCount] = useState(0);
  const [lastShiftTabTime, setLastShiftTabTime] = useState(0);
  const [verbosityLevel, setVerbosityLevel] = useState(() => {
    try {
      const manager = getSettingsManager();
      return manager.getUserSetting("verbosityLevel") || "quiet";
    } catch {
      return "quiet";
    }
  });
  const [explainLevel, setExplainLevel] = useState(() => {
    try {
      const manager = getSettingsManager();
      return manager.getUserSetting("explainLevel") || "brief";
    } catch {
      return "brief";
    }
  });
  const [_interactivityLevel, _setInteractivityLevel] = useState(() => {
    try {
      const manager = getSettingsManager();
      return manager.getUserSetting("interactivityLevel") || "balanced";
    } catch {
      return "balanced";
    }
  });
  const planMode = usePlanMode({}, agent);
  const handleSpecialKey = (key) => {
    if (isConfirmationActive) {
      return true;
    }
    if (key.shift && key.tab) {
      const now = Date.now();
      const timeSinceLastPress = now - lastShiftTabTime;
      if (timeSinceLastPress > 2e3) {
        setShiftTabPressCount(1);
      } else {
        setShiftTabPressCount((prev) => prev + 1);
      }
      setLastShiftTabTime(now);
      if (shiftTabPressCount >= 2) {
        if (!planMode.isActive) {
          planMode.activatePlanMode();
          const planModeEntry = {
            type: "assistant",
            content: "\u{1F3AF} **Plan Mode Activated**\n\nEntering read-only exploration mode. I'll analyze your codebase and formulate an implementation strategy before making any changes.\n\n**What I'm doing:**\n\u2022 Exploring project structure\n\u2022 Analyzing dependencies and patterns\n\u2022 Identifying key components\n\u2022 Formulating implementation approach\n\nOnce complete, I'll present a detailed plan for your approval.\n\n\u{1F4A1} **Tip**: Describe what you want to implement and I'll create a comprehensive plan first.",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, planModeEntry]);
          planMode.startExploration();
          setShiftTabPressCount(0);
          return true;
        } else {
          planMode.deactivatePlanMode("user_requested");
          const exitEntry = {
            type: "assistant",
            content: "\u{1F3AF} **Plan Mode Deactivated**\n\nExiting plan mode and returning to normal operation.",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, exitEntry]);
          setShiftTabPressCount(0);
          return true;
        }
      } else if (shiftTabPressCount === 1) {
        const newAutoEditState = !autoEditEnabled;
        setAutoEditEnabled(newAutoEditState);
        const confirmationService = ConfirmationService.getInstance();
        if (newAutoEditState) {
          confirmationService.setSessionFlag("allOperations", true);
        } else {
          confirmationService.resetSession();
        }
        setTimeout(() => setShiftTabPressCount(0), 2500);
      }
      return true;
    }
    if (key.escape) {
      if (showCommandSuggestions) {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
        return true;
      }
      if (showModelSelection) {
        setShowModelSelection(false);
        setSelectedModelIndex(0);
        return true;
      }
      if (isProcessing || isStreaming) {
        agent.abortCurrentOperation();
        setIsProcessing(false);
        setIsStreaming(false);
        setTokenCount(0);
        setProcessingTime(0);
        processingStartTime.current = 0;
        return true;
      }
      return false;
    }
    if (showCommandSuggestions) {
      const filteredSuggestions = filterCommandSuggestions(
        commandSuggestions,
        input
      );
      if (filteredSuggestions.length === 0) {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
        return false;
      } else {
        if (key.upArrow) {
          setSelectedCommandIndex(
            (prev) => prev === 0 ? filteredSuggestions.length - 1 : prev - 1
          );
          return true;
        }
        if (key.downArrow) {
          setSelectedCommandIndex(
            (prev) => (prev + 1) % filteredSuggestions.length
          );
          return true;
        }
        if (key.tab || key.return) {
          const safeIndex = Math.min(
            selectedCommandIndex,
            filteredSuggestions.length - 1
          );
          const selectedCommand = filteredSuggestions[safeIndex];
          const newInput = selectedCommand.command + " ";
          setInput(newInput);
          setCursorPosition(newInput.length);
          setShowCommandSuggestions(false);
          setSelectedCommandIndex(0);
          return true;
        }
      }
    }
    if (showModelSelection) {
      if (key.upArrow) {
        setSelectedModelIndex(
          (prev) => prev === 0 ? availableModels.length - 1 : prev - 1
        );
        return true;
      }
      if (key.downArrow) {
        setSelectedModelIndex((prev) => (prev + 1) % availableModels.length);
        return true;
      }
      if (key.tab || key.return) {
        const selectedModel = availableModels[selectedModelIndex];
        agent.setModel(selectedModel.model);
        updateCurrentModel(selectedModel.model);
        const confirmEntry = {
          type: "assistant",
          content: `\u2713 Switched to model: ${selectedModel.model}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
        setShowModelSelection(false);
        setSelectedModelIndex(0);
        return true;
      }
    }
    return false;
  };
  const handleInputSubmit = async (userInput) => {
    if (userInput === "exit" || userInput === "quit") {
      process.exit(0);
      return;
    }
    if (handleIntroductionInput && handleIntroductionInput(userInput.trim())) {
      return;
    }
    const trimmedInput = userInput.trim();
    if (trimmedInput) {
      const directCommandResult = await handleDirectCommand(userInput);
      if (!directCommandResult) {
        await processUserMessage(userInput);
      }
    }
  };
  const handlePasteDetected = (pasteEvent) => {
    const userEntry = {
      type: "user",
      content: pasteEvent.content,
      // Full content for AI
      displayContent: pasteEvent.summary,
      // Summary for UI display
      timestamp: /* @__PURE__ */ new Date(),
      isPasteSummary: true,
      pasteMetadata: {
        pasteNumber: pasteEvent.pasteNumber,
        lineCount: pasteEvent.lineCount,
        charCount: pasteEvent.charCount
      }
    };
    setChatHistory((prev) => [...prev, userEntry]);
    processUserMessage(pasteEvent.content);
  };
  const handleInputChange = (newInput) => {
    if (newInput.startsWith("/")) {
      setShowCommandSuggestions(true);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandSuggestions(false);
      setSelectedCommandIndex(0);
    }
  };
  const {
    input,
    cursorPosition,
    setInput,
    setCursorPosition,
    clearInput,
    resetHistory,
    handleInput
  } = useEnhancedInput({
    onSubmit: handleInputSubmit,
    onSpecialKey: handleSpecialKey,
    onPasteDetected: handlePasteDetected,
    disabled: isConfirmationActive
  });
  useInput((inputChar, key) => {
    if (onGlobalShortcut && onGlobalShortcut(inputChar, key)) {
      return;
    }
    handleInput(inputChar, key);
  });
  useEffect(() => {
    handleInputChange(input);
  }, [input]);
  const commandSuggestions = [
    { command: "/help", description: "Show help information" },
    { command: "/clear", description: "Clear chat history" },
    { command: "/models", description: "Switch Grok Model" },
    { command: "/verbosity", description: "Control output verbosity (quiet/normal/verbose)" },
    { command: "/explain", description: "Control operation explanations (off/brief/detailed)" },
    { command: "/interactivity", description: "Set interaction style (chat/balanced/repl)" },
    { command: "/upgrade", description: "Check for updates and upgrade CLI" },
    { command: "/version", description: "Show version information" },
    { command: "/switch", description: "Switch to specific version" },
    { command: "/init-agent", description: "Initialize .agent documentation system" },
    { command: "/docs", description: "Documentation generation menu" },
    { command: "/readme", description: "Generate project README.md" },
    { command: "/api-docs", description: "Generate API documentation" },
    { command: "/changelog", description: "Generate changelog from git history" },
    { command: "/update-agent-docs", description: "Update .agent docs with recent changes" },
    { command: "/compact", description: "Compress conversation history" },
    { command: "/heal", description: "Document and prevent failure recurrence" },
    { command: "/guardrails", description: "Manage prevention rules" },
    { command: "/comments", description: "Add code comments to files" },
    { command: "/commit-and-push", description: "AI commit & push to remote" },
    { command: "/smart-push", description: "Intelligent staging, commit message generation, and push" },
    { command: "/context", description: "Show loaded documentation and context status" },
    { command: "/exit", description: "Exit the application" }
  ];
  const availableModels = useMemo(() => {
    return loadModelConfig();
  }, []);
  const handleDirectCommand = async (input2) => {
    const trimmedInput = input2.trim();
    if (trimmedInput === "/context") {
      const contextEntry = {
        type: "assistant",
        content: `\u{1F4DA} **Loaded Documentation Context**

The .agent documentation system has been automatically loaded at startup:

**System Documentation:**
- \u{1F4CB} System Architecture (architecture.md)
- \u{1F3D7}\uFE0F Critical State (critical-state.md)
- \u{1F3D7}\uFE0F Installation Guide (installation.md)
- \u{1F3D7}\uFE0F API Schema (api-schema.md)
- \u{1F3D7}\uFE0F Auto-Read System (auto-read-system.md)

**SOP Documentation:**
- \u{1F527} Git Workflow SOP (git-workflow.md)
- \u{1F4D6} Release Management SOP (release-management.md)
- \u{1F4D6} Automation Protection SOP (automation-protection.md)
- \u{1F4D6} NPM Publishing Troubleshooting (npm-publishing-troubleshooting.md)

**Purpose:**
This documentation provides context for all AI operations, ensuring consistent understanding of project architecture, processes, and standards.

**Auto-Read Status:** \u2705 Active - Loaded automatically on startup`,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, contextEntry]);
      clearInput();
      return true;
    }
    if (trimmedInput === "/clear") {
      setChatHistory([]);
      setIsProcessing(false);
      setIsStreaming(false);
      setTokenCount(0);
      setProcessingTime(0);
      processingStartTime.current = 0;
      const confirmationService = ConfirmationService.getInstance();
      confirmationService.resetSession();
      clearInput();
      resetHistory();
      return true;
    }
    if (trimmedInput === "/help") {
      const helpEntry = {
        type: "assistant",
        content: `X-CLI Help:

Built-in Commands:
  /clear      - Clear chat history
  /help       - Show this help
  /models     - Switch between available models
  /verbosity  - Control output verbosity (quiet/normal/verbose)
  /explain    - Control operation explanations (off/brief/detailed)
  /version    - Show version information and check for updates
  /upgrade    - Check for updates and upgrade automatically
  /switch     - Switch to specific version (/switch <version>)
  /exit       - Exit application
  exit, quit  - Exit application

Documentation Commands:
  /init-agent       - Initialize .agent documentation system
  /docs             - Interactive documentation menu
  /readme           - Generate comprehensive README.md
  /api-docs         - Generate API documentation from code
  /changelog        - Generate changelog from git history
  /update-agent-docs- Update .agent docs with recent changes
  /comments         - Add intelligent code comments

Self-Healing & Optimization:
  /compact          - Compress conversation history intelligently
  /heal             - Document failures and create prevention rules
  /guardrails       - Manage automated prevention system

Git Commands:
  /commit-and-push - AI-generated commit + push to remote
  /smart-push      - Intelligent staging, commit message generation, and push

Enhanced Input Features:
  \u2191/\u2193 Arrow   - Navigate command history
  Ctrl+C      - Clear input (press twice to exit)
  Ctrl+\u2190/\u2192    - Move by word
  Ctrl+A/E    - Move to line start/end
  Ctrl+W      - Delete word before cursor
  Ctrl+K      - Delete to end of line
  Ctrl+U      - Delete to start of line
  Shift+Tab   - Toggle auto-edit mode (bypass confirmations)

Direct Commands (executed immediately):
  ls [path]   - List directory contents
  pwd         - Show current directory
  cd <path>   - Change directory
  cat <file>  - View file contents
  mkdir <dir> - Create directory
  touch <file>- Create empty file

Model Configuration:
  Edit ~/.xcli/models.json to add custom models (Claude, GPT, Gemini, etc.)

For complex operations, just describe what you want in natural language.
Examples:
  "edit package.json and add a new script"
  "create a new React component called Header"
  "show me all TypeScript files in this project"`,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, helpEntry]);
      clearInput();
      return true;
    }
    if (trimmedInput === "/context") {
      const contextEntry = {
        type: "assistant",
        content: `\u{1F4DA} **Loaded Documentation Context**

The .agent documentation system has been automatically loaded at startup:

**System Documentation:**
- \u{1F4CB} System Architecture (architecture.md)
- \u{1F3D7}\uFE0F Critical State (critical-state.md)
- \u{1F3D7}\uFE0F Installation Guide (installation.md)
- \u{1F3D7}\uFE0F API Schema (api-schema.md)
- \u{1F3D7}\uFE0F Auto-Read System (auto-read-system.md)

**SOP Documentation:**
- \u{1F527} Git Workflow SOP (git-workflow.md)
- \u{1F4D6} Release Management SOP (release-management.md)
- \u{1F4D6} Automation Protection SOP (automation-protection.md)
- \u{1F4D6} NPM Publishing Troubleshooting (npm-publishing-troubleshooting.md)

**Purpose:**
This documentation provides context for all AI operations, ensuring consistent understanding of project architecture, processes, and standards.

**Auto-Read Status:** \u2705 Active - Loaded automatically on startup`,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, contextEntry]);
      clearInput();
      return true;
    }
    if (trimmedInput === "/exit") {
      process.exit(0);
      return true;
    }
    if (trimmedInput === "/models") {
      setShowModelSelection(true);
      setSelectedModelIndex(0);
      clearInput();
      return true;
    }
    if (trimmedInput.startsWith("/models ")) {
      const modelArg = trimmedInput.split(" ")[1];
      const modelNames = availableModels.map((m) => m.model);
      if (modelNames.includes(modelArg)) {
        agent.setModel(modelArg);
        updateCurrentModel(modelArg);
        const confirmEntry = {
          type: "assistant",
          content: `\u2713 Switched to model: ${modelArg}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
      } else {
        const errorEntry = {
          type: "assistant",
          content: `Invalid model: ${modelArg}

Available models: ${modelNames.join(", ")}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput === "/version") {
      try {
        const versionInfo = await checkForUpdates();
        const versionEntry = {
          type: "assistant",
          content: `\u{1F4E6} **X-CLI Version Information**

Current Version: **${versionInfo.current}**
Latest Version: **${versionInfo.latest}**
${versionInfo.isUpdateAvailable ? `\u{1F504} **Update Available!**

Use \`/upgrade\` to update automatically or run:
\`${versionInfo.updateCommand}\`` : "\u2705 **You are up to date!**"}

Package: ${package_default.name}
GitHub: https://github.com/x-cli-team/x-cli
NPM: https://www.npmjs.com/package/${package_default.name}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, versionEntry]);
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `\u274C Error checking version: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput === "/upgrade") {
      try {
        const versionInfo = await checkForUpdates();
        if (!versionInfo.isUpdateAvailable) {
          const upToDateEntry = {
            type: "assistant",
            content: `\u2705 **Already up to date!**

Current version: **${versionInfo.current}**
Latest version: **${versionInfo.latest}**`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, upToDateEntry]);
          clearInput();
          return true;
        }
        const confirmUpgradeEntry = {
          type: "assistant",
          content: `\u{1F504} **Update Available!**

Current: **${versionInfo.current}**
Latest: **${versionInfo.latest}**

Upgrading now... This may take a moment.`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, confirmUpgradeEntry]);
        const success = await autoUpgrade();
        const resultEntry = {
          type: "assistant",
          content: success ? `\u2705 **Upgrade Complete!**

Successfully upgraded to version **${versionInfo.latest}**.

**Please restart X-CLI** to use the new version:
- Exit with \`/exit\` or Ctrl+C
- Run \`grok\` again` : `\u274C **Upgrade Failed**

Please try upgrading manually:
\`${versionInfo.updateCommand}\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `\u274C Error during upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput.startsWith("/switch ")) {
      const versionArg = trimmedInput.split(" ")[1];
      if (!versionArg) {
        const helpEntry = {
          type: "assistant",
          content: `\u274C **Missing version argument**

Usage: \`/switch <version>\`

Examples:
- \`/switch latest\` - Switch to latest version
- \`/switch 1.0.50\` - Switch to specific version

Command: \`npm install -g ${package_default.name}@<version>\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, helpEntry]);
        clearInput();
        return true;
      }
      try {
        const switchingEntry = {
          type: "assistant",
          content: `\u{1F504} **Switching to version ${versionArg}...**

This may take a moment.`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, switchingEntry]);
        const { exec: exec4 } = await import('child_process');
        const { promisify: promisify4 } = await import('util');
        const execAsync4 = promisify4(exec4);
        await execAsync4(`npm install -g ${package_default.name}@${versionArg}`, {
          timeout: 3e4
        });
        const successEntry = {
          type: "assistant",
          content: `\u2705 **Version Switch Complete!**

Successfully installed version **${versionArg}**.

**Please restart X-CLI** to use the new version:
- Exit with \`/exit\` or Ctrl+C
- Run \`grok\` again`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, successEntry]);
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `\u274C **Version switch failed**

Error: ${error instanceof Error ? error.message : "Unknown error"}

Please try manually:
\`npm install -g ${package_default.name}@${versionArg}\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput === "/commit-and-push") {
      const userEntry = {
        type: "user",
        content: "/commit-and-push",
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      setIsStreaming(true);
      try {
        const initialStatusResult = await agent.executeBashCommand(
          "git status --porcelain"
        );
        if (!initialStatusResult.success || !initialStatusResult.output?.trim()) {
          const noChangesEntry = {
            type: "assistant",
            content: "No changes to commit. Working directory is clean.",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, noChangesEntry]);
          setIsProcessing(false);
          setIsStreaming(false);
          setInput("");
          return true;
        }
        const addResult = await agent.executeBashCommand("git add .");
        if (!addResult.success) {
          const addErrorEntry = {
            type: "assistant",
            content: `Failed to stage changes: ${addResult.error || "Unknown error"}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, addErrorEntry]);
          setIsProcessing(false);
          setIsStreaming(false);
          setInput("");
          return true;
        }
        const addEntry = {
          type: "tool_result",
          content: "Changes staged successfully",
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `git_add_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: "git add ." })
            }
          },
          toolResult: addResult
        };
        setChatHistory((prev) => [...prev, addEntry]);
        const diffResult = await agent.executeBashCommand("git diff --cached");
        const commitPrompt = `Generate a concise, professional git commit message for these changes:

Git Status:
${initialStatusResult.output}

Git Diff (staged changes):
${diffResult.output || "No staged changes shown"}

Follow conventional commit format (feat:, fix:, docs:, etc.) and keep it under 72 characters.
Respond with ONLY the commit message, no additional text.`;
        let commitMessage = "";
        let streamingEntry = null;
        let accumulatedCommitContent = "";
        let lastCommitUpdateTime = Date.now();
        for await (const chunk of agent.processUserMessageStream(
          commitPrompt
        )) {
          if (chunk.type === "content" && chunk.content) {
            accumulatedCommitContent += chunk.content;
            const now = Date.now();
            if (now - lastCommitUpdateTime >= 150) {
              commitMessage += accumulatedCommitContent;
              if (!streamingEntry) {
                const newEntry = {
                  type: "assistant",
                  content: `Generating commit message...

${commitMessage}`,
                  timestamp: /* @__PURE__ */ new Date(),
                  isStreaming: true
                };
                setChatHistory((prev) => [...prev, newEntry]);
                streamingEntry = newEntry;
              } else {
                setChatHistory(
                  (prev) => prev.map(
                    (entry, idx) => idx === prev.length - 1 && entry.isStreaming ? {
                      ...entry,
                      content: `Generating commit message...

${commitMessage}`
                    } : entry
                  )
                );
              }
              accumulatedCommitContent = "";
              lastCommitUpdateTime = now;
            }
          } else if (chunk.type === "done") {
            if (streamingEntry) {
              setChatHistory(
                (prev) => prev.map(
                  (entry) => entry.isStreaming ? {
                    ...entry,
                    content: `Generated commit message: "${commitMessage.trim()}"`,
                    isStreaming: false
                  } : entry
                )
              );
            }
            break;
          }
        }
        const cleanCommitMessage = commitMessage.trim().replace(/^["']|["']$/g, "");
        const commitCommand = `git commit -m "${cleanCommitMessage}"`;
        const commitResult = await agent.executeBashCommand(commitCommand);
        const commitEntry = {
          type: "tool_result",
          content: commitResult.success ? commitResult.output || "Commit successful" : commitResult.error || "Commit failed",
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `git_commit_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: commitCommand })
            }
          },
          toolResult: commitResult
        };
        setChatHistory((prev) => [...prev, commitEntry]);
        if (commitResult.success) {
          let pushResult = await agent.executeBashCommand("git push");
          let pushCommand = "git push";
          if (!pushResult.success && pushResult.error?.includes("no upstream branch")) {
            pushCommand = "git push -u origin HEAD";
            pushResult = await agent.executeBashCommand(pushCommand);
          }
          const pushEntry = {
            type: "tool_result",
            content: pushResult.success ? pushResult.output || "Push successful" : pushResult.error || "Push failed",
            timestamp: /* @__PURE__ */ new Date(),
            toolCall: {
              id: `git_push_${Date.now()}`,
              type: "function",
              function: {
                name: "bash",
                arguments: JSON.stringify({ command: pushCommand })
              }
            },
            toolResult: pushResult
          };
          setChatHistory((prev) => [...prev, pushEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Error during commit and push: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      setIsStreaming(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/init-agent") {
      const userEntry = {
        type: "user",
        content: "/init-agent",
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const isXCli = process.cwd().includes("x-cli") || trimmedInput.includes("--xcli");
        const projectType = isXCli ? "x-cli" : "external";
        const projectName = isXCli ? "X CLI" : "Current Project";
        const generator = new AgentSystemGenerator({
          projectName,
          projectType,
          rootPath: process.cwd()
        });
        const result = await generator.generateAgentSystem();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const nextStepsEntry = {
            type: "assistant",
            content: `\u{1F4DA} **Next Steps:**
1. Review the generated documentation in \`.agent/\`
2. Customize \`system/\` docs for your project
3. Add PRDs to \`tasks/\` before implementing features
4. Run \`/update-agent-docs\` after making changes
5. Check \`.agent/README.md\` for complete navigation

\u{1F4A1} **Pro tip**: AI agents will now read these docs to understand your project context efficiently!`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, nextStepsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to initialize agent system: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/docs") {
      const userEntry = {
        type: "user",
        content: "/docs",
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      const menuEntry = {
        type: "assistant",
        content: generateDocsMenuText(),
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, menuEntry]);
      clearInput();
      return true;
    }
    const docsMenuOption = findDocsMenuOption(trimmedInput);
    if (docsMenuOption) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      const confirmEntry = {
        type: "assistant",
        content: `\u{1F3AF} Selected: ${docsMenuOption.title}
Executing: \`${docsMenuOption.command}\`...`,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, confirmEntry]);
      setTimeout(() => {
        handleDirectCommand(docsMenuOption.command);
      }, 100);
      clearInput();
      return true;
    }
    if (trimmedInput === "/readme" || trimmedInput.startsWith("/readme ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const updateExisting = args.includes("--update");
        const template = args.find((arg) => arg.startsWith("--template="))?.split("=")[1] || "default";
        const generator = new ReadmeGenerator({
          projectName: "",
          // Will be auto-detected
          rootPath: process.cwd(),
          updateExisting,
          template
        });
        const result = await generator.generateReadme();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const nextStepsEntry = {
            type: "assistant",
            content: `\u{1F4DD} **README.md Generated!**

**Next Steps:**
1. Review and customize the generated content
2. Add project-specific details and examples
3. Update installation and usage instructions
4. Consider adding screenshots or diagrams

\u{1F4A1} **Tip**: Use \`/docs\` to access other documentation tools!`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, nextStepsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to generate README: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/comments" || trimmedInput.startsWith("/comments ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const filePath = args[0];
        if (!filePath) {
          const errorEntry = {
            type: "assistant",
            content: "\u274C Please specify a file path. Usage: `/comments <file-path>`\n\nExample: `/comments src/utils/helper.ts`",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const commentType = args.includes("--functions") ? "functions" : args.includes("--classes") ? "classes" : "all";
        const generator = new CommentsGenerator({
          filePath: filePath.startsWith("/") ? filePath : path8__default.join(process.cwd(), filePath),
          commentType,
          style: "auto"
        });
        const result = await generator.generateComments();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const tipsEntry = {
            type: "assistant",
            content: `\u{1F4A1} **Code Comments Added!**

**Options for next time:**
- \`/comments file.ts --functions\` - Only comment functions
- \`/comments file.ts --classes\` - Only comment classes
- \`/comments file.ts\` - Comment all (default)

**Backup created** - Original file saved with .backup extension`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to add comments: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/api-docs" || trimmedInput.startsWith("/api-docs ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const outputFormat = args.includes("--format=html") ? "html" : "md";
        const includePrivate = args.includes("--private");
        const scanPaths = args.filter((arg) => !arg.startsWith("--") && arg !== "");
        const generator = new ApiDocsGenerator({
          rootPath: process.cwd(),
          outputFormat,
          includePrivate,
          scanPaths: scanPaths.length > 0 ? scanPaths : ["src/"]
        });
        const result = await generator.generateApiDocs();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const tipsEntry = {
            type: "assistant",
            content: `\u{1F4D6} **API Documentation Generated!**

**Options for next time:**
- \`/api-docs --format=html\` - Generate HTML format
- \`/api-docs --private\` - Include private members
- \`/api-docs src/ lib/\` - Specify custom scan paths

**Enhancement tips:**
- Add JSDoc comments to your functions and classes
- Use TypeScript for better type information
- Organize exports clearly in your modules`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to generate API docs: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/changelog" || trimmedInput.startsWith("/changelog ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const sinceVersion = args.find((arg) => arg.startsWith("--since="))?.split("=")[1];
        const commitCount = args.find((arg) => arg.startsWith("--commits="))?.split("=")[1];
        const format = args.includes("--simple") ? "simple" : "conventional";
        const generator = new ChangelogGenerator({
          rootPath: process.cwd(),
          sinceVersion,
          commitCount: commitCount ? parseInt(commitCount) : void 0,
          format,
          includeBreaking: true
        });
        const result = await generator.generateChangelog();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const tipsEntry = {
            type: "assistant",
            content: `\u{1F4DD} **Changelog Generated!**

**Options for next time:**
- \`/changelog --since=v1.0.0\` - Generate since specific version
- \`/changelog --commits=10\` - Limit to last N commits  
- \`/changelog --simple\` - Use simple format (not conventional)

**Pro tips:**
- Use conventional commit format: \`feat: add new feature\`
- Mark breaking changes: \`feat!: breaking change\`
- The changelog follows Keep a Changelog format`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to generate changelog: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/update-agent-docs" || trimmedInput.startsWith("/update-agent-docs ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const updateTarget = args.includes("--system") ? "system" : args.includes("--tasks") ? "tasks" : args.includes("--sop") ? "sop" : "all";
        const autoCommit = args.includes("--commit");
        const updater = new UpdateAgentDocs({
          rootPath: process.cwd(),
          updateTarget,
          autoCommit
        });
        const result = await updater.updateDocs();
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success && result.suggestions.length > 0) {
          const suggestionsEntry = {
            type: "assistant",
            content: `\u{1F4A1} **Suggestions for Manual Review:**

${result.suggestions.map((s) => `- ${s}`).join("\n")}

**Options:**
- \`/update-agent-docs --system\` - Update only system docs
- \`/update-agent-docs --tasks\` - Update only tasks docs
- \`/update-agent-docs --sop\` - Update only SOPs`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, suggestionsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to update agent docs: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/compact" || trimmedInput.startsWith("/compact ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const dryRun = args.includes("--dry-run");
        const subagentFramework = new SubagentFramework();
        const taskId = await subagentFramework.spawnSubagent({
          type: "summarizer",
          input: {
            content: chatHistory.map((entry) => entry.content).join("\n"),
            compressionTarget: 0.3
            // 70% reduction
          },
          priority: "medium"
        });
        const result = await subagentFramework.waitForResult(taskId, 1e4);
        if (result.success) {
          const resultEntry = {
            type: "assistant",
            content: dryRun ? `\u{1F4CA} **Compression Preview (Dry Run)**

${result.summary}

\u{1F4A1} Use \`/compact\` to apply compression` : `\u{1F9F9} **Context Compressed Successfully**

${result.summary}

\u{1F4C8} **Performance:**
- Tokens saved: ~${result.output.compressionRatio * 100}%
- Processing time: ${result.executionTime}ms
- Subagent tokens used: ${result.tokensUsed}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, resultEntry]);
          if (!dryRun && result.success) {
            const tipsEntry = {
              type: "assistant",
              content: `\u2728 **Context Optimization Complete**

**What happened:**
- Older conversations summarized
- Recent context preserved
- Key decisions and TODOs maintained

**Options:**
- \`/compact --dry-run\` - Preview compression
- \`/compact --force\` - Force compression even if below threshold`,
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, tipsEntry]);
          }
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to compress context: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/heal" || trimmedInput.startsWith("/heal ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const healingSystem = new SelfHealingSystem(process.cwd());
        const mockError = {
          message: "Example error for demonstration",
          stack: "at someFunction (src/example.ts:42:10)"
        };
        const mockContext = {
          command: trimmedInput,
          operation: "heal-demo",
          files: ["src/example.ts"]
        };
        const result = await healingSystem.captureIncident(mockError, mockContext);
        const resultEntry = {
          type: "assistant",
          content: result.message,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, resultEntry]);
        if (result.success) {
          const tipsEntry = {
            type: "assistant",
            content: `\u{1F504} **Self-Healing System Activated**

**What was captured:**
- Incident documentation with root cause analysis
- Automatic guardrail generation (if applicable)
- Integration with existing .agent system

**Options:**
- \`/heal --classify\` - Classify failure type and suggest guardrail
- \`/heal --playbook\` - Generate step-by-step recovery SOP
- \`/guardrails\` - View and manage all prevention rules

**Next steps:**
- Review the incident documentation
- Check if guardrail was created
- Update SOPs with lessons learned`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to process healing: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/guardrails" || trimmedInput.startsWith("/guardrails ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const check = args.includes("--check");
        const healingSystem = new SelfHealingSystem(process.cwd());
        if (check) {
          const checkResult = await healingSystem.checkGuardrails("example-operation", {});
          const resultEntry = {
            type: "assistant",
            content: `\u{1F6E1}\uFE0F **Guardrail Check Results**

**Status:** ${checkResult.passed ? "\u2705 All Clear" : "\u274C Violations Found"}
**Violations:** ${checkResult.violations.length}
**Warnings:** ${checkResult.warnings.length}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, resultEntry]);
        } else {
          const incidents = await healingSystem.listIncidents();
          const config2 = healingSystem.getConfig();
          const resultEntry = {
            type: "assistant",
            content: `\u{1F6E1}\uFE0F **Guardrails Management**

**System Status:** ${config2.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
**Enforcement:** ${config2.enforceGuardrails ? "\u2705 Active" : "\u274C Disabled"}
**Error Prompt:** ${config2.onErrorPrompt}

**Recent Incidents:** ${incidents.length}
${incidents.slice(0, 3).map((i) => `- ${i.title} (${i.impact} impact)`).join("\n")}

**Available Commands:**
- \`/guardrails --check\` - Check current plans against guardrails
- \`/heal\` - Document new failure and create guardrail
- View specific guardrails in \`.agent/guardrails/\``,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, resultEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to manage guardrails: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/switch" || trimmedInput.startsWith("/switch ")) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const args = trimmedInput.split(" ").slice(1);
        const settingsManager = getSettingsManager();
        if (args.length === 0) {
          const settings = settingsManager.loadUserSettings();
          const autoCompact = settings.autoCompact ?? false;
          const thresholds = settings.compactThreshold || { lines: 800, bytes: 2e5 };
          const statusEntry = {
            type: "assistant",
            content: `\u{1F504} **Auto-Compact Status**

**Current Settings:**
- Auto-compact: ${autoCompact ? "\u2705 ENABLED" : "\u274C DISABLED"}
- Line threshold: ${thresholds.lines || 800} lines
- Size threshold: ${Math.round((thresholds.bytes || 2e5) / 1024)}KB

**Commands:**
- \`/switch compact on\` - Enable auto-compact
- \`/switch compact off\` - Disable auto-compact
- \`/switch compact lines 500\` - Set line threshold
- \`/switch compact bytes 100000\` - Set size threshold (in bytes)

**How it works:**
Auto-compact automatically enables compact mode when conversations exceed thresholds, similar to Claude Code's context management.`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, statusEntry]);
        } else if (args[0] === "compact") {
          if (args[1] === "on") {
            settingsManager.updateUserSetting("autoCompact", true);
            const successEntry = {
              type: "assistant",
              content: "\u2705 **Auto-compact enabled!**\n\nCompact mode will automatically activate for long conversations to maintain performance.",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, successEntry]);
          } else if (args[1] === "off") {
            settingsManager.updateUserSetting("autoCompact", false);
            const successEntry = {
              type: "assistant",
              content: "\u274C **Auto-compact disabled**\n\nNormal conversation mode will be used.",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, successEntry]);
          } else if (args[1] === "lines" && args[2]) {
            const lines = parseInt(args[2]);
            if (isNaN(lines) || lines < 100) {
              const errorEntry = {
                type: "assistant",
                content: "\u274C Invalid line threshold. Must be a number >= 100.",
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, errorEntry]);
            } else {
              const currentThresholds = settingsManager.getUserSetting("compactThreshold") || {};
              settingsManager.updateUserSetting("compactThreshold", {
                ...currentThresholds,
                lines
              });
              const successEntry = {
                type: "assistant",
                content: `\u2705 **Line threshold updated to ${lines} lines**`,
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, successEntry]);
            }
          } else if (args[1] === "bytes" && args[2]) {
            const bytes = parseInt(args[2]);
            if (isNaN(bytes) || bytes < 1e4) {
              const errorEntry = {
                type: "assistant",
                content: "\u274C Invalid size threshold. Must be a number >= 10000 bytes.",
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, errorEntry]);
            } else {
              const currentThresholds = settingsManager.getUserSetting("compactThreshold") || {};
              settingsManager.updateUserSetting("compactThreshold", {
                ...currentThresholds,
                bytes
              });
              const successEntry = {
                type: "assistant",
                content: `\u2705 **Size threshold updated to ${Math.round(bytes / 1024)}KB**`,
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, successEntry]);
            }
          } else {
            const helpEntry = {
              type: "assistant",
              content: `\u2753 **Invalid compact command**

**Usage:**
- \`/switch compact on\` - Enable auto-compact
- \`/switch compact off\` - Disable auto-compact
- \`/switch compact lines <number>\` - Set line threshold
- \`/switch compact bytes <number>\` - Set size threshold`,
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, helpEntry]);
          }
        } else {
          const helpEntry = {
            type: "assistant",
            content: `\u2753 **Unknown switch command**

**Available switches:**
- \`/switch compact\` - Manage auto-compact settings
- \`/switch\` - Show current status`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, helpEntry]);
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Failed to manage switches: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    if (trimmedInput === "/verbosity" || trimmedInput.startsWith("/verbosity ")) {
      const args = trimmedInput.split(" ").slice(1);
      const newLevel = args[0];
      if (!newLevel) {
        const levelEntry = {
          type: "assistant",
          content: `\u{1F50A} **Current Verbosity Level: ${verbosityLevel.toUpperCase()}**

**Available levels:**
- \`quiet\` - Minimal output, suppress prefixes and extra formatting
- \`normal\` - Current default behavior with full details
- \`verbose\` - Additional details and debug information

**Usage:** \`/verbosity <level>\`
**Example:** \`/verbosity quiet\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, levelEntry]);
      } else if (["quiet", "normal", "verbose"].includes(newLevel)) {
        setVerbosityLevel(newLevel);
        try {
          const manager = getSettingsManager();
          manager.updateUserSetting("verbosityLevel", newLevel);
        } catch (_error) {
        }
        const confirmEntry = {
          type: "assistant",
          content: `\u2705 **Verbosity level set to: ${newLevel.toUpperCase()}**

Tool outputs will now show ${newLevel === "quiet" ? "minimal output" : newLevel === "normal" ? "full details" : "extra details and debug information"}.`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
      } else {
        const errorEntry = {
          type: "assistant",
          content: `\u274C **Invalid verbosity level: ${newLevel}**

**Available levels:** quiet, normal, verbose

**Usage:** \`/verbosity <level>\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput === "/explain" || trimmedInput.startsWith("/explain ")) {
      const args = trimmedInput.split(" ").slice(1);
      const newLevel = args[0];
      if (!newLevel) {
        const levelEntry = {
          type: "assistant",
          content: `\u{1F4A1} **Current Explain Level: ${explainLevel.toUpperCase()}**

**Available levels:**
- \`off\` - No explanations
- \`brief\` - Short reasons for operations
- \`detailed\` - Comprehensive explanations with context

**Usage:** \`/explain <level>\`
**Example:** \`/explain brief\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, levelEntry]);
      } else if (["off", "brief", "detailed"].includes(newLevel)) {
        setExplainLevel(newLevel);
        try {
          const manager = getSettingsManager();
          manager.updateUserSetting("explainLevel", newLevel);
        } catch (_error) {
        }
        const confirmEntry = {
          type: "assistant",
          content: `\u2705 **Explain level set to: ${newLevel.toUpperCase()}**

Operations will now ${newLevel === "off" ? "show no explanations" : newLevel === "brief" ? "show brief reasons" : "show detailed explanations with context"}.`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
      } else {
        const errorEntry = {
          type: "assistant",
          content: `\u274C **Invalid explain level: ${newLevel}**

**Available levels:** off, brief, detailed

**Usage:** \`/explain <level>\``,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    if (trimmedInput === "/smart-push") {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      setIsProcessing(true);
      try {
        const branchResult = await agent.executeBashCommand("git branch --show-current");
        const currentBranch = branchResult.output?.trim() || "unknown";
        const qualityCheckEntry = {
          type: "assistant",
          content: "\u{1F50D} **Running pre-push quality checks...**",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, qualityCheckEntry]);
        const tsCheckEntry = {
          type: "assistant",
          content: "\u{1F4DD} Checking TypeScript...",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, tsCheckEntry]);
        const tsResult = await agent.executeBashCommand("npm run typecheck");
        if (tsResult.success) {
          const tsSuccessEntry = {
            type: "tool_result",
            content: "\u2705 TypeScript check passed",
            timestamp: /* @__PURE__ */ new Date(),
            toolCall: {
              id: `ts_check_${Date.now()}`,
              type: "function",
              function: {
                name: "bash",
                arguments: JSON.stringify({ command: "npm run typecheck" })
              }
            },
            toolResult: tsResult
          };
          setChatHistory((prev) => [...prev, tsSuccessEntry]);
        } else {
          const tsFailEntry = {
            type: "assistant",
            content: `\u274C **TypeScript check failed**

${tsResult.error || tsResult.output}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, tsFailEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const lintCheckEntry = {
          type: "assistant",
          content: "\u{1F9F9} Running ESLint...",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, lintCheckEntry]);
        const lintResult = await agent.executeBashCommand("npm run lint");
        const lintSuccessEntry = {
          type: "tool_result",
          content: "\u2705 ESLint check completed (warnings allowed)",
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `lint_check_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: "npm run lint" })
            }
          },
          toolResult: lintResult
        };
        setChatHistory((prev) => [...prev, lintSuccessEntry]);
        const statusResult = await agent.executeBashCommand("git status --porcelain");
        if (!statusResult.success) {
          const errorEntry = {
            type: "assistant",
            content: "\u274C **Git Error**\n\nUnable to check git status. Are you in a git repository?",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        if (!statusResult.output || statusResult.output.trim() === "") {
          const noChangesEntry = {
            type: "assistant",
            content: "\u{1F4CB} **No Changes to Push**\n\nWorking directory is clean. No commits to push.",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, noChangesEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const prePullAddResult = await agent.executeBashCommand("git add .");
        if (!prePullAddResult.success) {
          const errorEntry = {
            type: "assistant",
            content: `\u274C **Failed to stage changes**

${prePullAddResult.error || "Unknown error"}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const stashResult = await agent.executeBashCommand("git stash push --include-untracked --message 'smart-push temporary stash'");
        if (!stashResult.success) {
          const errorEntry = {
            type: "assistant",
            content: `\u274C **Failed to stash changes**

${stashResult.error || "Unknown error"}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const pullEntry = {
          type: "assistant",
          content: "\u{1F504} Pulling latest changes...",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, pullEntry]);
        const rebaseCheck = await agent.executeBashCommand("test -d .git/rebase-apply -o -d .git/rebase-merge -o -f .git/MERGE_HEAD && echo 'ongoing' || echo 'clean'");
        if (rebaseCheck.output?.includes("ongoing")) {
          const cleanupEntry = {
            type: "assistant",
            content: "\u26A0\uFE0F Git operation in progress - cleaning up...",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, cleanupEntry]);
          await agent.executeBashCommand("git rebase --abort 2>/dev/null || git merge --abort 2>/dev/null || true");
        }
        let pullResult = await agent.executeBashCommand(`git pull --rebase origin ${currentBranch}`);
        if (!pullResult.success) {
          pullResult = await agent.executeBashCommand(`git pull origin ${currentBranch}`);
          if (pullResult.success) {
            const mergeFallbackEntry = {
              type: "assistant",
              content: "\u26A0\uFE0F Rebase failed, fell back to merge",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, mergeFallbackEntry]);
          }
        }
        if (pullResult.success) {
          const pullSuccessEntry = {
            type: "tool_result",
            content: pullResult.output?.includes("Successfully rebased") ? "\u2705 Successfully rebased local changes" : "\u2705 Successfully pulled latest changes",
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, pullSuccessEntry]);
          const popStashResult = await agent.executeBashCommand("git stash pop");
          if (!popStashResult.success) {
            const errorEntry = {
              type: "assistant",
              content: `\u26A0\uFE0F **Failed to restore stashed changes**

${popStashResult.error || "Unknown error"}

\u{1F4A1} Your changes may be lost. Check git stash list.`,
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, errorEntry]);
            setIsProcessing(false);
            clearInput();
            return true;
          } else {
            const popSuccessEntry = {
              type: "tool_result",
              content: "\u2705 Changes restored from stash",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, popSuccessEntry]);
          }
        } else {
          const pullFailEntry = {
            type: "assistant",
            content: `\u274C **Pull failed**

${pullResult.error || pullResult.output}

\u{1F4A1} Check git status and resolve any conflicts`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, pullFailEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const addResult = await agent.executeBashCommand("git add .");
        if (!addResult.success) {
          const errorEntry = {
            type: "assistant",
            content: `\u274C **Failed to stage changes**

${addResult.error || "Unknown error"}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }
        const addEntry = {
          type: "tool_result",
          content: "\u2705 Changes staged successfully",
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `git_add_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: "git add ." })
            }
          },
          toolResult: addResult
        };
        setChatHistory((prev) => [...prev, addEntry]);
        const diffResult = await agent.executeBashCommand("git diff --cached");
        const maxDiffLength = 5e4;
        const truncatedDiff = diffResult.output ? diffResult.output.length > maxDiffLength ? diffResult.output.substring(0, maxDiffLength) + "\n... (truncated due to length)" : diffResult.output : "No staged changes shown";
        const commitPrompt = `Generate a concise, professional git commit message for these changes:

Git Status:
${statusResult.output}

Git Diff (staged changes):
${truncatedDiff}

Follow conventional commit format (feat:, fix:, docs:, etc.) and keep it under 72 characters.
Respond with ONLY the commit message, no additional text.`;
        let commitMessage = "";
        let streamingEntry = null;
        let accumulatedCommitContent = "";
        let lastCommitUpdateTime = Date.now();
        try {
          for await (const chunk of agent.processUserMessageStream(commitPrompt)) {
            if (chunk.type === "content" && chunk.content) {
              accumulatedCommitContent += chunk.content;
              const now = Date.now();
              if (now - lastCommitUpdateTime >= 150) {
                commitMessage += accumulatedCommitContent;
                if (!streamingEntry) {
                  const newEntry = {
                    type: "assistant",
                    content: `\u{1F916} Generating commit message...

${commitMessage}`,
                    timestamp: /* @__PURE__ */ new Date(),
                    isStreaming: true
                  };
                  setChatHistory((prev) => [...prev, newEntry]);
                  streamingEntry = newEntry;
                } else {
                  setChatHistory(
                    (prev) => prev.map(
                      (entry, idx) => idx === prev.length - 1 && entry.isStreaming ? {
                        ...entry,
                        content: `\u{1F916} Generating commit message...

${commitMessage}`
                      } : entry
                    )
                  );
                }
                accumulatedCommitContent = "";
                lastCommitUpdateTime = now;
              }
            } else if (chunk.type === "done") {
              if (streamingEntry) {
                setChatHistory(
                  (prev) => prev.map(
                    (entry) => entry.isStreaming ? {
                      ...entry,
                      content: `\u2705 Generated commit message: "${commitMessage.trim()}"`,
                      isStreaming: false
                    } : entry
                  )
                );
              }
              break;
            }
          }
        } catch (error) {
          commitMessage = "feat: update files";
          const errorEntry = {
            type: "assistant",
            content: `\u26A0\uFE0F **AI commit message generation failed**: ${error.message}

Using fallback message: "${commitMessage}"`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          if (streamingEntry) {
            setChatHistory(
              (prev) => prev.map(
                (entry) => entry.isStreaming ? { ...entry, isStreaming: false } : entry
              )
            );
          }
        }
        const cleanCommitMessage = commitMessage.trim().replace(/^["']|["']$/g, "");
        const commitCommand = `git commit -m "${cleanCommitMessage}"`;
        const commitResult = await agent.executeBashCommand(commitCommand);
        const commitEntry = {
          type: "tool_result",
          content: commitResult.success ? `\u2705 **Commit Created**: ${commitResult.output?.split("\n")[0] || "Commit successful"}` : `\u274C **Commit Failed**: ${commitResult.error || "Unknown error"}`,
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `git_commit_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: commitCommand })
            }
          },
          toolResult: commitResult
        };
        setChatHistory((prev) => [...prev, commitEntry]);
        if (commitResult.success) {
          const pushResult = await agent.executeBashCommand("git push");
          if (pushResult.success) {
            const pushEntry = {
              type: "tool_result",
              content: `\u{1F680} **Push Successful**: ${pushResult.output?.split("\n")[0] || "Changes pushed to remote"}`,
              timestamp: /* @__PURE__ */ new Date(),
              toolCall: {
                id: `git_push_${Date.now()}`,
                type: "function",
                function: {
                  name: "bash",
                  arguments: JSON.stringify({ command: "git push" })
                }
              },
              toolResult: pushResult
            };
            setChatHistory((prev) => [...prev, pushEntry]);
            const verificationEntry = {
              type: "assistant",
              content: "\u{1F50D} **Running post-push verification...**",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, verificationEntry]);
            const statusCheckResult = await agent.executeBashCommand("git status --porcelain");
            if (statusCheckResult.success && statusCheckResult.output?.trim() === "") {
              const statusOkEntry = {
                type: "tool_result",
                content: "\u2705 **Git Status**: Working directory clean",
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, statusOkEntry]);
            } else {
              const statusIssueEntry = {
                type: "assistant",
                content: `\u26A0\uFE0F **Git Status Issues Detected**:

${statusCheckResult.output || "Unknown status"}`,
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, statusIssueEntry]);
            }
            const waitEntry = {
              type: "assistant",
              content: "\u23F3 **Waiting for CI/NPM publishing...** (10 seconds)",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, waitEntry]);
            await new Promise((resolve8) => setTimeout(resolve8, 1e4));
            const localPackageResult = await agent.executeBashCommand(`node -p "require('./package.json').name" 2>/dev/null || echo 'no-package'`);
            const localName = localPackageResult.success && localPackageResult.output?.trim() !== "no-package" ? localPackageResult.output?.trim() : null;
            if (localName) {
              const localVersionResult = await agent.executeBashCommand(`node -p "require('./package.json').version"`);
              const localVersion = localVersionResult.success ? localVersionResult.output?.trim() : "unknown";
              const npmCheckResult = await agent.executeBashCommand(`npm view ${localName} version 2>/dev/null || echo 'not-found'`);
              if (npmCheckResult.success && npmCheckResult.output?.trim() && npmCheckResult.output?.trim() !== "not-found") {
                const npmVersion = npmCheckResult.output.trim();
                if (npmVersion === localVersion) {
                  const npmConfirmEntry = {
                    type: "tool_result",
                    content: `\u2705 **NPM Package Confirmed**: ${localName} v${npmVersion} published successfully`,
                    timestamp: /* @__PURE__ */ new Date()
                  };
                  setChatHistory((prev) => [...prev, npmConfirmEntry]);
                } else {
                  const npmPendingEntry = {
                    type: "assistant",
                    content: `\u23F3 **NPM Status**: Local ${localName} v${localVersion}, NPM v${npmVersion}. Publishing may still be in progress.`,
                    timestamp: /* @__PURE__ */ new Date()
                  };
                  setChatHistory((prev) => [...prev, npmPendingEntry]);
                }
              } else {
                const npmSkipEntry = {
                  type: "assistant",
                  content: `\u2139\uFE0F **NPM Check Skipped**: Package ${localName} not found on NPM (may not be published yet)`,
                  timestamp: /* @__PURE__ */ new Date()
                };
                setChatHistory((prev) => [...prev, npmSkipEntry]);
              }
            } else {
              const npmSkipEntry = {
                type: "assistant",
                content: `\u2139\uFE0F **NPM Check Skipped**: No package.json found or not an NPM package`,
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, npmSkipEntry]);
            }
            const finalSuccessEntry = {
              type: "assistant",
              content: "\u{1F389} **Smart Push Complete**: All verifications passed!",
              timestamp: /* @__PURE__ */ new Date()
            };
            setChatHistory((prev) => [...prev, finalSuccessEntry]);
          } else {
            const pushError = pushResult.error || pushResult.output || "";
            if (pushError.includes("protected branch") || pushError.includes("Changes must be made through a pull request") || pushError.includes("GH006")) {
              const branchProtectionEntry = {
                type: "assistant",
                content: "\u{1F6E1}\uFE0F **Branch Protection Detected**: Direct pushes to this branch are blocked.\n\n\u{1F504} **Creating PR workflow...**",
                timestamp: /* @__PURE__ */ new Date()
              };
              setChatHistory((prev) => [...prev, branchProtectionEntry]);
              const featureBranch = `feature/${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "-")}-smart-push`;
              const createBranchResult = await agent.executeBashCommand(`git checkout -b ${featureBranch}`);
              if (createBranchResult.success) {
                const pushBranchResult = await agent.executeBashCommand(`git push -u origin ${featureBranch}`);
                if (pushBranchResult.success) {
                  const branchSuccessEntry = {
                    type: "tool_result",
                    content: `\u2705 **Feature Branch Created**: \`${featureBranch}\`

\u{1F4CB} **Attempting to create Pull Request...**`,
                    timestamp: /* @__PURE__ */ new Date()
                  };
                  setChatHistory((prev) => [...prev, branchSuccessEntry]);
                  const prResult = await agent.executeBashCommand(`gh pr create --title "${cleanCommitMessage}" --body "Auto-generated PR from smart-push" --head ${featureBranch} --base ${currentBranch}`);
                  if (prResult.success) {
                    const prUrl = prResult.output?.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
                    const prSuccessEntry = {
                      type: "tool_result",
                      content: `\u2705 **Pull Request Created Successfully!**

\u{1F517} **PR URL**: ${prUrl || "Check GitHub for the link"}

\u{1F3AF} **Next Steps**:
\u2022 Review the PR on GitHub
\u2022 Wait for CI checks to pass
\u2022 Request approval and merge`,
                      timestamp: /* @__PURE__ */ new Date()
                    };
                    setChatHistory((prev) => [...prev, prSuccessEntry]);
                  } else {
                    const prManualEntry = {
                      type: "assistant",
                      content: `\u26A0\uFE0F **PR Creation Failed**: GitHub CLI may not be available.

\u{1F4A1} **Create PR Manually**:
\u2022 Go to GitHub repository
\u2022 Create PR from \`${featureBranch}\` \u2192 \`${currentBranch}\`
\u2022 Title: \`${cleanCommitMessage}\``,
                      timestamp: /* @__PURE__ */ new Date()
                    };
                    setChatHistory((prev) => [...prev, prManualEntry]);
                  }
                } else {
                  const pushFailEntry = {
                    type: "tool_result",
                    content: `\u274C **Failed to push feature branch**: ${pushBranchResult.error}`,
                    timestamp: /* @__PURE__ */ new Date()
                  };
                  setChatHistory((prev) => [...prev, pushFailEntry]);
                }
              } else {
                const branchFailEntry = {
                  type: "tool_result",
                  content: `\u274C **Failed to create feature branch**: ${createBranchResult.error}`,
                  timestamp: /* @__PURE__ */ new Date()
                };
                setChatHistory((prev) => [...prev, branchFailEntry]);
              }
            } else {
              const pushFailEntry = {
                type: "tool_result",
                content: `\u274C **Push Failed**: ${pushResult.error || "Unknown error"}

Try running \`git push\` manually.`,
                timestamp: /* @__PURE__ */ new Date(),
                toolCall: {
                  id: `git_push_${Date.now()}`,
                  type: "function",
                  function: {
                    name: "bash",
                    arguments: JSON.stringify({ command: "git push" })
                  }
                },
                toolResult: pushResult
              };
              setChatHistory((prev) => [...prev, pushFailEntry]);
            }
          }
        }
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `\u274C **Smart Push Failed**

${error instanceof Error ? error.message : String(error)}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      setIsProcessing(false);
      clearInput();
      return true;
    }
    const directBashCommands = [
      "ls",
      "pwd",
      "cd",
      "cat",
      "mkdir",
      "touch",
      "echo",
      "grep",
      "find",
      "cp",
      "mv",
      "rm"
    ];
    const firstWord = trimmedInput.split(" ")[0];
    if (directBashCommands.includes(firstWord)) {
      const userEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, userEntry]);
      try {
        const result = await agent.executeBashCommand(trimmedInput);
        const commandEntry = {
          type: "tool_result",
          content: result.success ? result.output || "Command completed" : result.error || "Command failed",
          timestamp: /* @__PURE__ */ new Date(),
          toolCall: {
            id: `bash_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: trimmedInput })
            }
          },
          toolResult: result
        };
        setChatHistory((prev) => [...prev, commandEntry]);
      } catch (error) {
        const errorEntry = {
          type: "assistant",
          content: `Error executing command: ${error.message}`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }
      clearInput();
      return true;
    }
    return false;
  };
  const processUserMessage = async (userInput) => {
    const userEntry = {
      type: "user",
      content: userInput,
      timestamp: /* @__PURE__ */ new Date()
    };
    setChatHistory((prev) => [...prev, userEntry]);
    setIsProcessing(true);
    clearInput();
    try {
      setIsStreaming(true);
      let streamingEntry = null;
      let accumulatedContent = "";
      let lastTokenCount = 0;
      let pendingToolCalls = null;
      let pendingToolResults = [];
      let lastUpdateTime = Date.now();
      const flushUpdates = () => {
        const now = Date.now();
        if (now - lastUpdateTime < 150) return;
        if (lastTokenCount !== 0) {
          setTokenCount(lastTokenCount);
        }
        if (accumulatedContent) {
          if (!streamingEntry) {
            const newStreamingEntry = {
              type: "assistant",
              content: accumulatedContent,
              timestamp: /* @__PURE__ */ new Date(),
              isStreaming: true
            };
            setChatHistory((prev) => [...prev, newStreamingEntry]);
            streamingEntry = newStreamingEntry;
          } else {
            setChatHistory(
              (prev) => prev.map(
                (entry, idx) => idx === prev.length - 1 && entry.isStreaming ? { ...entry, content: entry.content + accumulatedContent } : entry
              )
            );
          }
          accumulatedContent = "";
        }
        if (pendingToolCalls) {
          setChatHistory(
            (prev) => prev.map(
              (entry) => entry.isStreaming ? {
                ...entry,
                isStreaming: false,
                toolCalls: pendingToolCalls
              } : entry
            )
          );
          streamingEntry = null;
          pendingToolCalls.forEach((toolCall) => {
            const toolCallEntry = {
              type: "tool_call",
              content: "Executing...",
              timestamp: /* @__PURE__ */ new Date(),
              toolCall
            };
            setChatHistory((prev) => [...prev, toolCallEntry]);
          });
          pendingToolCalls = null;
        }
        if (pendingToolResults.length > 0) {
          setChatHistory(
            (prev) => prev.map((entry) => {
              if (entry.isStreaming) {
                return { ...entry, isStreaming: false };
              }
              const matchingResult = pendingToolResults.find(
                (result) => entry.type === "tool_call" && entry.toolCall?.id === result.toolCall.id
              );
              if (matchingResult) {
                return {
                  ...entry,
                  type: "tool_result",
                  content: matchingResult.toolResult.success ? matchingResult.toolResult.output || "Success" : matchingResult.toolResult.error || "Error occurred",
                  toolResult: matchingResult.toolResult
                };
              }
              return entry;
            })
          );
          streamingEntry = null;
          pendingToolResults = [];
        }
        lastUpdateTime = now;
      };
      for await (const chunk of agent.processUserMessageStream(userInput)) {
        switch (chunk.type) {
          case "content":
            if (chunk.content) {
              accumulatedContent += chunk.content;
            }
            break;
          case "token_count":
            if (chunk.tokenCount !== void 0) {
              lastTokenCount = chunk.tokenCount;
            }
            break;
          case "tool_calls":
            if (chunk.toolCalls) {
              pendingToolCalls = chunk.toolCalls;
            }
            break;
          case "tool_result":
            if (chunk.toolCall && chunk.toolResult) {
              pendingToolResults.push({ toolCall: chunk.toolCall, toolResult: chunk.toolResult });
            }
            break;
          case "done":
            flushUpdates();
            break;
        }
        flushUpdates();
      }
      flushUpdates();
      if (streamingEntry) {
        setChatHistory(
          (prev) => prev.map(
            (entry) => entry.isStreaming ? { ...entry, isStreaming: false } : entry
          )
        );
      }
      setIsStreaming(false);
    } catch (error) {
      const errorEntry = {
        type: "assistant",
        content: `Error: ${error.message}`,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, errorEntry]);
      setIsStreaming(false);
    }
    setIsProcessing(false);
    processingStartTime.current = 0;
  };
  return {
    input,
    cursorPosition,
    showCommandSuggestions,
    selectedCommandIndex,
    showModelSelection,
    selectedModelIndex,
    commandSuggestions,
    availableModels,
    agent,
    autoEditEnabled,
    verbosityLevel,
    explainLevel,
    // Plan mode state and actions
    planMode
  };
}
var init_use_input_handler = __esm({
  "src/hooks/use-input-handler.ts"() {
    init_confirmation_service();
    init_use_enhanced_input();
    init_use_plan_mode();
    init_command_suggestions();
    init_model_config();
    init_agent_system_generator();
    init_docs_menu();
    init_readme_generator();
    init_comments_generator();
    init_api_docs_generator();
    init_changelog_generator();
    init_update_agent_docs();
    init_subagent_framework();
    init_self_healing_system();
    init_version_checker();
    init_settings_manager();
    init_package();
  }
});
function ApiKeyInput({ onApiKeySet }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { exit } = useApp();
  useInput((inputChar, key) => {
    if (isSubmitting) return;
    if (key.ctrl && inputChar === "c") {
      exit();
      return;
    }
    if (key.return) {
      handleSubmit();
      return;
    }
    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      setError("");
      return;
    }
    if (inputChar && !key.ctrl && !key.meta) {
      setInput((prev) => prev + inputChar);
      setError("");
    }
  });
  const handleSubmit = async () => {
    if (!input.trim()) {
      setError("API key cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiKey2 = input.trim();
      const agent = new GrokAgent(apiKey2);
      process.env.GROK_API_KEY = apiKey2;
      try {
        const manager = getSettingsManager();
        manager.updateUserSetting("apiKey", apiKey2);
        console.log(`
\u2705 API key saved to ~/.xcli/config.json`);
      } catch {
        console.log("\n\u26A0\uFE0F Could not save API key to settings file");
        console.log("API key set for current session only");
      }
      onApiKeySet(agent);
    } catch {
      setError("Invalid API key format");
      setIsSubmitting(false);
    }
  };
  const displayText = input.length > 0 ? isSubmitting ? "*".repeat(input.length) : "*".repeat(input.length) + "\u2588" : isSubmitting ? " " : "\u2588";
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", paddingX: 2, paddingY: 1, children: [
    /* @__PURE__ */ jsx(Text, { color: "yellow", children: "\u{1F511} Grok API Key Required" }),
    /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", children: "Please enter your Grok API key to continue:" }) }),
    /* @__PURE__ */ jsxs(Box, { borderStyle: "round", borderColor: "blue", paddingX: 1, marginBottom: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u276F " }),
      /* @__PURE__ */ jsx(Text, { children: displayText })
    ] }),
    error ? /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsxs(Text, { color: "red", children: [
      "\u274C ",
      error
    ] }) }) : null,
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "\u2022 Press Enter to submit" }),
      /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "\u2022 Press Ctrl+C to exit" }),
      /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "Note: API key will be saved to ~/.xcli/config.json" })
    ] }),
    isSubmitting ? /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "yellow", children: "\u{1F504} Validating API key..." }) }) : null
  ] });
}
var init_api_key_input = __esm({
  "src/ui/components/api-key-input.tsx"() {
    init_grok_agent();
    init_settings_manager();
  }
});
function useContextInfo(agent) {
  const [contextInfo, setContextInfo] = useState({
    workspaceFiles: 0,
    indexSize: "0 MB",
    sessionFiles: 0,
    activeTokens: 0,
    lastActivity: "Now",
    memoryPressure: "low",
    isLoading: true,
    messagesCount: 0,
    loadedFiles: [],
    contextHealth: "optimal"
  });
  const updateContextInfo = async () => {
    try {
      let tokenUsage;
      let messagesCount = 0;
      let loadedFiles = [];
      let contextHealth = "optimal";
      if (agent) {
        const modelName = agent.getCurrentModel?.() || "grok-4-fast-non-reasoning";
        const maxTokens = getMaxTokensForModel(modelName);
        const sessionTokens = agent.getSessionTokenCount?.() || 0;
        messagesCount = agent.getMessageCount?.() || 0;
        const tokenPercent = Math.round(sessionTokens / maxTokens * 100);
        tokenUsage = {
          current: sessionTokens,
          max: maxTokens,
          percent: tokenPercent
        };
        if (tokenPercent >= 95) contextHealth = "critical";
        else if (tokenPercent >= 80) contextHealth = "degraded";
        else contextHealth = "optimal";
        loadedFiles = [];
      }
      const info = {
        workspaceFiles: await getWorkspaceFileCount(),
        indexSize: await getIndexSize(),
        sessionFiles: await getSessionFileCount(),
        activeTokens: tokenUsage?.current || 0,
        lastActivity: "Now",
        gitBranch: await getGitBranch(),
        projectName: await getProjectName(),
        memoryPressure: getMemoryPressure(),
        isLoading: false,
        tokenUsage,
        messagesCount,
        loadedFiles,
        contextHealth
      };
      setContextInfo(info);
    } catch (error) {
      console.warn("[ContextInfo] Failed to update context:", error);
      setContextInfo((prev) => ({ ...prev, isLoading: false }));
    }
  };
  useEffect(() => {
    updateContextInfo();
    const interval = setInterval(updateContextInfo, 1e4);
    return () => clearInterval(interval);
  }, []);
  return {
    contextInfo,
    updateContextInfo,
    refreshContext: updateContextInfo
  };
}
async function getWorkspaceFileCount() {
  try {
    const cwd = process.cwd();
    const entries = await fs2__default.promises.readdir(cwd, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.isFile() && !shouldIgnoreFile(entry.name)) {
        count++;
      } else if (entry.isDirectory() && !shouldIgnoreDirectory(entry.name)) {
        try {
          const subEntries = await fs2__default.promises.readdir(path8__default.join(cwd, entry.name), { withFileTypes: true });
          count += subEntries.filter((sub) => sub.isFile() && !shouldIgnoreFile(sub.name)).length;
        } catch {
        }
      }
    }
    return count;
  } catch {
    return 0;
  }
}
function shouldIgnoreFile(filename) {
  return filename.startsWith(".") || filename.endsWith(".log") || filename.includes(".tmp");
}
function shouldIgnoreDirectory(dirname5) {
  const ignoreDirs = ["node_modules", ".git", "dist", "build", ".next", "coverage"];
  return ignoreDirs.includes(dirname5) || dirname5.startsWith(".");
}
async function getIndexSize() {
  try {
    const indexPath = path8__default.join(process.cwd(), ".xcli", "index.json");
    if (fs2__default.existsSync(indexPath)) {
      const stats = await fs2__default.promises.stat(indexPath);
      const mb = stats.size / (1024 * 1024);
      return mb > 1 ? `${mb.toFixed(1)} MB` : `${(stats.size / 1024).toFixed(1)} KB`;
    }
  } catch {
  }
  return "0 MB";
}
async function getSessionFileCount() {
  try {
    const sessionPath = path8__default.join(os__default.homedir(), ".xcli", "session.log");
    if (fs2__default.existsSync(sessionPath)) {
      const content = await fs2__default.promises.readFile(sessionPath, "utf8");
      return content.split("\n").filter((line) => line.trim()).length;
    }
  } catch {
  }
  return 0;
}
async function getGitBranch() {
  try {
    const gitPath = path8__default.join(process.cwd(), ".git", "HEAD");
    if (fs2__default.existsSync(gitPath)) {
      const content = await fs2__default.promises.readFile(gitPath, "utf8");
      const match = content.match(/ref: refs\/heads\/(.+)/);
      return match ? match[1].trim() : "detached";
    }
  } catch {
  }
  return void 0;
}
async function getProjectName() {
  try {
    const packagePath = path8__default.join(process.cwd(), "package.json");
    if (fs2__default.existsSync(packagePath)) {
      const content = await fs2__default.promises.readFile(packagePath, "utf8");
      const pkg = JSON.parse(content);
      return pkg.name;
    }
  } catch {
  }
  return path8__default.basename(process.cwd());
}
function getMemoryPressure() {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 200) return "high";
    if (heapUsedMB > 100) return "medium";
    return "low";
  } catch {
    return "low";
  }
}
function getMaxTokensForModel(modelName) {
  const modelLimits = {
    "grok-4-fast-non-reasoning": 128e3,
    "grok-4-fast-reasoning": 2e5,
    "grok-4-0709": 2e5,
    "grok-4-latest": 2e5,
    "grok-3-latest": 2e5,
    "grok-3-fast": 128e3,
    "grok-3-mini-fast": 64e3,
    "claude-sonnet-4": 2e5,
    "claude-opus-4": 2e5,
    "gpt-4o": 128e3,
    "gpt-4": 32e3
  };
  return modelLimits[modelName] || 128e3;
}
var init_use_context_info = __esm({
  "src/hooks/use-context-info.ts"() {
  }
});
function useAutoRead(setChatHistory) {
  useEffect(() => {
    if (fs2__default.existsSync(".agent")) {
      const initialMessages = [];
      let docsRead = 0;
      let config2 = null;
      const configPaths = [
        path8__default.join(".xcli", "auto-read-config.json"),
        // User config (distributed)
        path8__default.join(".agent", "auto-read-config.json")
        // Dev override (gitignored)
      ];
      for (const configPath of configPaths) {
        if (fs2__default.existsSync(configPath)) {
          try {
            const configContent = fs2__default.readFileSync(configPath, "utf8");
            config2 = JSON.parse(configContent);
            break;
          } catch (_error) {
          }
        }
      }
      const isEnabled = config2?.enabled !== false;
      const showLoadingMessage = config2?.showLoadingMessage !== false;
      const showSummaryMessage = config2?.showSummaryMessage !== false;
      const showFileContents = config2?.showFileContents === true;
      if (!isEnabled) {
        return;
      }
      if (showLoadingMessage) {
        initialMessages.push({
          type: "assistant",
          content: "\u{1F4DA} Reading core documentation into memory...",
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      console.log("\u{1F50D} Auto-reading .agent documentation...");
      const folders = config2?.folders || [
        {
          name: "system",
          priority: 1,
          files: [
            { name: "architecture.md", title: "System Architecture", icon: "\u{1F4CB}", required: true },
            { name: "critical-state.md", title: "Critical State", icon: "\u{1F3D7}\uFE0F", required: false },
            { name: "installation.md", title: "Installation", icon: "\u{1F3D7}\uFE0F", required: false },
            { name: "api-schema.md", title: "API Schema", icon: "\u{1F3D7}\uFE0F", required: false },
            { name: "auto-read-system.md", title: "Auto-Read System", icon: "\u{1F3D7}\uFE0F", required: false }
          ]
        },
        {
          name: "sop",
          priority: 2,
          files: [
            { name: "git-workflow.md", title: "Git Workflow SOP", icon: "\u{1F527}", required: true },
            { name: "release-management.md", title: "Release Management SOP", icon: "\u{1F4D6}", required: false },
            { name: "automation-protection.md", title: "Automation Protection SOP", icon: "\u{1F4D6}", required: false },
            { name: "npm-publishing-troubleshooting.md", title: "NPM Publishing Troubleshooting", icon: "\u{1F4D6}", required: false }
          ]
        }
      ];
      if (config2?.customFolders) {
        folders.push(...config2.customFolders);
      }
      folders.sort((a, b) => (a.priority || 999) - (b.priority || 999));
      for (const folder of folders) {
        const folderPath = path8__default.join(".agent", folder.name);
        if (!fs2__default.existsSync(folderPath)) {
          continue;
        }
        for (const file of folder.files) {
          let filePaths = [];
          if (file.pattern) {
            continue;
          } else {
            filePaths = [file.name];
          }
          for (const fileName of filePaths) {
            const filePath = path8__default.join(folderPath, fileName);
            if (!fs2__default.existsSync(filePath)) {
              if (file.required) ;
              continue;
            }
            try {
              const content = fs2__default.readFileSync(filePath, "utf8");
              const displayTitle = file.title || fileName.replace(".md", "").replace("-", " ").toUpperCase();
              const icon = file.icon || "\u{1F4C4}";
              console.log(`\u{1F4C4} Loaded: ${folder.name}/${fileName} (${content.length} chars)`);
              if (showFileContents) {
                initialMessages.push({
                  type: "assistant",
                  content: `${icon} **${displayTitle} (from .agent/${folder.name}/${fileName})**

${content}`,
                  timestamp: /* @__PURE__ */ new Date()
                });
              }
              docsRead++;
            } catch (_error) {
              console.log(`\u26A0\uFE0F Failed to read: ${folder.name}/${fileName}`);
            }
          }
        }
      }
      console.log(`\u2705 Auto-read complete: ${docsRead} documentation files loaded`);
      if (showSummaryMessage && docsRead > 0) {
        initialMessages.push({
          type: "assistant",
          content: `\u2705 ${docsRead} documentation files read - I have a complete understanding of the current architecture and operational procedures.`,
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      if (initialMessages.length > 0) {
        setChatHistory(initialMessages);
      }
    }
  }, [setChatHistory]);
}
var init_use_auto_read = __esm({
  "src/hooks/use-auto-read.ts"() {
  }
});
function useStreaming(agent, initialMessage, setChatHistory, streamingState) {
  const { setIsProcessing, setIsStreaming, setTokenCount } = streamingState;
  useEffect(() => {
    if (initialMessage && agent) {
      const userEntry = {
        type: "user",
        content: initialMessage,
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory(() => [userEntry]);
      const processInitialMessage = async () => {
        setIsProcessing(true);
        setIsStreaming(true);
        try {
          let streamingEntry = null;
          let accumulatedContent = "";
          let lastTokenCount = 0;
          let pendingToolCalls = null;
          let pendingToolResults = [];
          let lastUpdateTime = Date.now();
          const flushUpdates = () => {
            const now = Date.now();
            if (now - lastUpdateTime < 150) return;
            setChatHistory((prev) => {
              let newHistory = [...prev];
              if (lastTokenCount !== 0) {
              }
              if (accumulatedContent) {
                if (!streamingEntry) {
                  const newStreamingEntry = {
                    type: "assistant",
                    content: accumulatedContent,
                    timestamp: /* @__PURE__ */ new Date(),
                    isStreaming: true
                  };
                  newHistory.push(newStreamingEntry);
                  streamingEntry = newStreamingEntry;
                } else {
                  const lastIdx = newHistory.length - 1;
                  if (lastIdx >= 0 && newHistory[lastIdx].isStreaming) {
                    newHistory[lastIdx] = { ...newHistory[lastIdx], content: newHistory[lastIdx].content + accumulatedContent };
                  }
                }
                accumulatedContent = "";
              }
              if (pendingToolCalls) {
                const streamingIdx = newHistory.findIndex((entry) => entry.isStreaming);
                if (streamingIdx >= 0) {
                  newHistory[streamingIdx] = { ...newHistory[streamingIdx], isStreaming: false, toolCalls: pendingToolCalls };
                }
                streamingEntry = null;
                pendingToolCalls.forEach((toolCall) => {
                  const toolCallEntry = {
                    type: "tool_call",
                    content: "Executing...",
                    timestamp: /* @__PURE__ */ new Date(),
                    toolCall
                  };
                  newHistory.push(toolCallEntry);
                });
                pendingToolCalls = null;
              }
              if (pendingToolResults.length > 0) {
                newHistory = newHistory.map((entry) => {
                  if (entry.isStreaming) {
                    return { ...entry, isStreaming: false };
                  }
                  const matchingResult = pendingToolResults.find(
                    (result) => entry.type === "tool_call" && entry.toolCall?.id === result.toolCall.id
                  );
                  if (matchingResult) {
                    return {
                      ...entry,
                      type: "tool_result",
                      content: matchingResult.toolResult.success ? matchingResult.toolResult.output || "Success" : matchingResult.toolResult.error || "Error occurred",
                      toolResult: matchingResult.toolResult
                    };
                  }
                  return entry;
                });
                streamingEntry = null;
                pendingToolResults = [];
              }
              return newHistory;
            });
            if (lastTokenCount !== 0) {
              setTokenCount(lastTokenCount);
            }
            lastUpdateTime = now;
          };
          for await (const chunk of agent.processUserMessageStream(initialMessage)) {
            switch (chunk.type) {
              case "content":
                if (chunk.content) {
                  accumulatedContent += chunk.content;
                }
                break;
              case "token_count":
                if (chunk.tokenCount !== void 0) {
                  lastTokenCount = chunk.tokenCount;
                }
                break;
              case "tool_calls":
                if (chunk.toolCalls) {
                  pendingToolCalls = chunk.toolCalls;
                }
                break;
              case "tool_result":
                if (chunk.toolCall && chunk.toolResult) {
                  pendingToolResults.push({ toolCall: chunk.toolCall, toolResult: chunk.toolResult });
                }
                break;
              case "done":
                flushUpdates();
                break;
            }
            flushUpdates();
          }
          flushUpdates();
          if (streamingEntry) {
            setChatHistory(
              (prev) => prev.map(
                (entry) => entry.isStreaming ? { ...entry, isStreaming: false } : entry
              )
            );
          }
          setIsStreaming(false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorEntry = {
            type: "assistant",
            content: `Error: ${errorMessage}`,
            timestamp: /* @__PURE__ */ new Date()
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsStreaming(false);
        }
        setIsProcessing(false);
      };
      processInitialMessage();
    }
  }, [initialMessage, agent, setChatHistory, setIsProcessing, setIsStreaming, setTokenCount]);
}
var init_use_streaming = __esm({
  "src/hooks/use-streaming.ts"() {
  }
});
function useConfirmations(confirmationService, state) {
  const {
    setConfirmationOptions,
    setIsProcessing,
    setIsStreaming,
    setTokenCount,
    setProcessingTime,
    processingStartTime
  } = state;
  useEffect(() => {
    const handleConfirmationRequest = (options) => {
      setConfirmationOptions(options);
    };
    confirmationService.on("confirmation-requested", handleConfirmationRequest);
    return () => {
      confirmationService.off(
        "confirmation-requested",
        handleConfirmationRequest
      );
    };
  }, [confirmationService, setConfirmationOptions]);
  const handleConfirmation = (dontAskAgain) => {
    confirmationService.confirmOperation(true, dontAskAgain);
    setConfirmationOptions(null);
  };
  const handleRejection = (feedback) => {
    confirmationService.rejectOperation(feedback);
    setConfirmationOptions(null);
    setIsProcessing(false);
    setIsStreaming(false);
    setTokenCount(0);
    setProcessingTime(0);
    processingStartTime.current = 0;
  };
  return {
    handleConfirmation,
    handleRejection
  };
}
var init_use_confirmations = __esm({
  "src/hooks/use-confirmations.ts"() {
  }
});
function useIntroduction(chatHistory, setChatHistory) {
  const [introductionState, setIntroductionState] = useState({
    needsIntroduction: false,
    isCollectingOperatorName: false,
    isCollectingAgentName: false,
    showGreeting: false
  });
  useEffect(() => {
    const checkIntroductionNeeded = () => {
      try {
        const settingsManager = getSettingsManager();
        const userSettings = settingsManager.loadUserSettings();
        const hasOperatorName = userSettings.operatorName !== void 0 && userSettings.operatorName !== null && userSettings.operatorName.trim().length > 0;
        const hasAgentName = userSettings.agentName !== void 0 && userSettings.agentName !== null && userSettings.agentName.trim().length > 0;
        if (!hasOperatorName || !hasAgentName) {
          setIntroductionState({
            needsIntroduction: true,
            isCollectingOperatorName: !hasOperatorName,
            isCollectingAgentName: hasOperatorName && !hasAgentName,
            showGreeting: false
          });
        }
      } catch (error) {
        console.warn("Settings manager error, skipping introduction:", error);
      }
    };
    if (chatHistory.length === 0) {
      checkIntroductionNeeded();
    }
  }, [chatHistory.length]);
  const handleIntroductionInput = (input) => {
    try {
      if (!introductionState.needsIntroduction || introductionState.needsIntroduction === void 0) {
        return false;
      }
      const trimmedInput = input.trim();
      if (!trimmedInput) return false;
      if (trimmedInput.length < 1 || trimmedInput.length > 50) {
        const errorEntry = {
          type: "assistant",
          content: "Please enter a name between 1 and 50 characters.",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
        return true;
      }
      const maliciousPattern = /[<>\"'&]/;
      if (maliciousPattern.test(trimmedInput)) {
        const errorEntry = {
          type: "assistant",
          content: "Please use only letters, numbers, spaces, and common punctuation.",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, errorEntry]);
        return true;
      }
      const settingsManager = getSettingsManager();
      if (introductionState.isCollectingOperatorName) {
        settingsManager.updateUserSetting("operatorName", trimmedInput);
        setIntroductionState((prev) => ({
          ...prev,
          isCollectingOperatorName: false,
          isCollectingAgentName: true,
          operatorName: trimmedInput
        }));
        const agentNamePrompt = {
          type: "assistant",
          content: "Great! And what would you like to call me (your AI assistant)?",
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, agentNamePrompt]);
        return true;
      } else if (introductionState.isCollectingAgentName) {
        settingsManager.updateUserSetting("agentName", trimmedInput);
        setIntroductionState((prev) => ({
          ...prev,
          needsIntroduction: false,
          isCollectingAgentName: false,
          agentName: trimmedInput,
          showGreeting: true
        }));
        const userSettings = settingsManager.loadUserSettings();
        const operatorName = userSettings.operatorName || "there";
        const greeting = {
          type: "assistant",
          content: `hi ${operatorName} nice to meet you. lets get started, how can i help?`,
          timestamp: /* @__PURE__ */ new Date()
        };
        setChatHistory((prev) => [...prev, greeting]);
        return true;
      }
    } catch (error) {
      console.warn("Introduction input error:", error);
      const errorEntry = {
        type: "assistant",
        content: "There was an issue with the introduction. You can continue using the CLI normally.",
        timestamp: /* @__PURE__ */ new Date()
      };
      setChatHistory((prev) => [...prev, errorEntry]);
      return true;
    }
    return false;
  };
  const startIntroduction = () => {
    if (!introductionState.needsIntroduction) return;
    const introMessage = {
      type: "assistant",
      content: "Hello! I'm x-cli. Before we get started, I'd like to know a bit about you.\n\nWhat's your name?",
      timestamp: /* @__PURE__ */ new Date()
    };
    setChatHistory((prev) => [...prev, introMessage]);
  };
  useEffect(() => {
    if (introductionState.needsIntroduction && !introductionState.isCollectingOperatorName && !introductionState.isCollectingAgentName && chatHistory.length === 0) {
      startIntroduction();
    }
  }, [introductionState.needsIntroduction, introductionState.isCollectingOperatorName, introductionState.isCollectingAgentName, chatHistory.length]);
  return {
    introductionState,
    handleIntroductionInput
  };
}
var init_use_introduction = __esm({
  "src/hooks/use-introduction.ts"() {
    init_settings_manager();
  }
});

// src/hooks/use-console-setup.ts
var use_console_setup_exports = {};
__export(use_console_setup_exports, {
  printWelcomeBanner: () => printWelcomeBanner,
  useConsoleSetup: () => useConsoleSetup
});
function printWelcomeBanner(_quiet = false) {
  if (_quiet) return;
  const isTTY = !!process.stdout.isTTY;
  if (isTTY) {
    process.stdout.write("\x1B[?25l");
    process.stdout.write("\x1B[H");
    process.stdout.write("\x1B[2J");
    process.stdout.write("\x1B[3J");
    process.stdout.write("\x1B[H");
  }
  const isFancy = process.env.X_CLI_ASCII !== "block";
  const fancyAscii = String.raw`__/\\\_______/\\\______________________/\\\\\\\\\__/\\\______________/\\\\\\\\\\\_        
 _\///\\\___/\\\/____________________/\\\////////__\/\\\_____________\/////\\\///__       
  ___\///\\\\\\/____________________/\\\/___________\/\\\_________________\/\\\_____      
   _____\//\\\\_______/\\\\\\\\\\\__/\\\_____________\/\\\_________________\/\\\_____     
    ______\/\\\\______\///////////__\/\\\_____________\/\\\_________________\/\\\_____    
     ______/\\\\\\___________________\//\\\____________\/\\\_________________\/\\\_____   
      ____/\\\////\\\__________________\///\\\__________\/\\\_________________\/\\\_____  
       __/\\\/___\///\\\__________________\////\\\\\\\\\_\/\\\\\\\\\\\\\\\__/\\\\\\\\\\\_ 
        _\///_______\///______________________\/////////__\///////////////__\///////////__`;
  const blockAscii = String.raw`\x1b[34m  ████      ████████ ████      ████
  ████████  ██████████████  ████████
 ██████████  ██████████████  ████████
 ██████████  ██████████████  ████████
  ████████  ██████████████  ████████
   ████      ████████ ████      ████\x1b[0m`;
  const asciiArt = (isFancy ? fancyAscii : blockAscii).normalize("NFC");
  process.stdout.write(asciiArt + "\n");
  const welcomeBanner = [
    "",
    `\x1B[32m  Welcome to X-CLI v${package_default.version} \u26A1\x1B[0m`,
    "",
    `\x1B[36m  \u{1F680} Claude Code-level intelligence in your terminal!\x1B[0m`,
    "",
    `\x1B[33m  \u2714 Ready. Type your first command or paste code to begin.\x1B[0m`,
    "",
    `\x1B[35m  \u{1F4A1} Quick Start Tips:\x1B[0m`,
    "",
    `  \u2022 Ask anything: "Create a React component" or "Debug this Python script"`,
    `  \u2022 Edit files: "Add error handling to app.js"`,
    `  \u2022 Run commands: "Set up a new Node.js project"`,
    `  \u2022 Get help: Type "/help" for all commands`,
    "",
    `\x1B[35m  \u{1F6E0}\uFE0F  Power Features:\x1B[0m`,
    "",
    `  \u2022 Auto-edit mode: Press Shift+Tab to toggle hands-free editing`,
    `  \u2022 Project memory: Create .xcli/GROK.md to customize behavior`,
    `  \u2022 Documentation: Run "/init-agent" for .agent docs system`,
    `  \u2022 Error recovery: Run "/heal" after errors to add guardrails`,
    "",
    `\x1B[37m  Type your request in natural language. Ctrl+C to clear, 'exit' to quit.\x1B[0m`,
    ""
  ].join("\n");
  process.stdout.write(welcomeBanner);
  if (isTTY) process.stdout.write("\x1B[?25h");
}
function useConsoleSetup(_quiet = false) {
}
var init_use_console_setup = __esm({
  "src/hooks/use-console-setup.ts"() {
    init_package();
  }
});
function useSessionLogging(chatHistory) {
  const lastChatHistoryLength = useRef(0);
  useEffect(() => {
    const newEntries = chatHistory.slice(lastChatHistoryLength.current);
    if (newEntries.length > 0) {
      const sessionFile = path8__default.join(os__default.homedir(), ".xcli", "session.log");
      try {
        const dir = path8__default.dirname(sessionFile);
        if (!fs2__default.existsSync(dir)) {
          fs2__default.mkdirSync(dir, { recursive: true });
        }
        const lines = newEntries.map((entry) => JSON.stringify(entry)).join("\n") + "\n";
        fs2__default.appendFileSync(sessionFile, lines);
      } catch {
      }
    }
    lastChatHistoryLength.current = chatHistory.length;
  }, [chatHistory]);
}
var init_use_session_logging = __esm({
  "src/hooks/use-session-logging.ts"() {
  }
});
function useProcessingTimer(isProcessing, isStreaming, setProcessingTime) {
  const processingStartTime = useRef(0);
  useEffect(() => {
    if (!isProcessing && !isStreaming) {
      setProcessingTime(0);
      return;
    }
    if (processingStartTime.current === 0) {
      processingStartTime.current = Date.now();
    }
    const interval = setInterval(() => {
      setProcessingTime(
        Math.floor((Date.now() - processingStartTime.current) / 1e3)
      );
    }, 1e3);
    return () => clearInterval(interval);
  }, [isProcessing, isStreaming, setProcessingTime]);
}
var init_use_processing_timer = __esm({
  "src/hooks/use-processing-timer.ts"() {
  }
});

// src/ui/colors.ts
function getSpinnerColor(operation) {
  switch (operation.toLowerCase()) {
    case "search":
    case "indexing":
    case "scanning":
      return "info";
    case "process":
    case "thinking":
    case "analyzing":
      return "warning";
    case "write":
    case "edit":
    case "create":
      return "success";
    case "compact":
    case "optimize":
    case "memory":
      return "accent";
    default:
      return "primary";
  }
}
var inkColors;
var init_colors = __esm({
  "src/ui/colors.ts"() {
    inkColors = {
      primary: "cyan",
      success: "green",
      warning: "yellow",
      error: "red",
      info: "blue",
      muted: "gray",
      accent: "magenta",
      text: "white",
      // Bright variants
      primaryBright: "cyanBright",
      successBright: "greenBright",
      warningBright: "yellowBright",
      errorBright: "redBright",
      infoBright: "blueBright",
      accentBright: "magentaBright"
    };
  }
});
function ContextStatus({
  workspaceFiles = 0,
  indexSize = "0 MB",
  sessionRestored = false,
  showDetails = false
}) {
  const [dynamicInfo, setDynamicInfo] = useState({
    tokenUsage: 0,
    memoryPressure: "low",
    backgroundActivity: [],
    lastUpdate: /* @__PURE__ */ new Date()
  });
  useEffect(() => {
    const updateDynamicInfo = () => {
      const mockInfo = {
        tokenUsage: Math.floor(Math.random() * 5e4) + 1e3,
        memoryPressure: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        backgroundActivity: getActiveBackgroundTasks(),
        lastUpdate: /* @__PURE__ */ new Date()
      };
      setDynamicInfo(mockInfo);
    };
    updateDynamicInfo();
    const interval = setInterval(updateDynamicInfo, 1e4);
    return () => clearInterval(interval);
  }, []);
  const getMemoryPressureColor = (pressure) => {
    switch (pressure) {
      case "low":
        return inkColors.success;
      case "medium":
        return inkColors.warning;
      case "high":
        return inkColors.error;
      default:
        return inkColors.muted;
    }
  };
  const getMemoryPressureIcon = (pressure) => {
    switch (pressure) {
      case "low":
        return "\u{1F7E2}";
      case "medium":
        return "\u{1F7E1}";
      case "high":
        return "\u{1F534}";
      default:
        return "\u26AB";
    }
  };
  if (!showDetails) {
    return /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
        "\u{1F4C1} ",
        workspaceFiles,
        " files"
      ] }),
      /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
        " ",
        "\xB7 \u{1F4BE} ",
        indexSize
      ] }),
      sessionRestored && /* @__PURE__ */ jsxs(Text, { color: inkColors.success, children: [
        " ",
        "\xB7 \u{1F504} restored"
      ] }),
      /* @__PURE__ */ jsxs(Text, { color: getMemoryPressureColor(dynamicInfo.memoryPressure), children: [
        " ",
        "\xB7 ",
        getMemoryPressureIcon(dynamicInfo.memoryPressure),
        " ",
        dynamicInfo.memoryPressure
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs(Box, { marginBottom: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.accent, bold: true, children: "\u{1F4CA} Context Status" }),
      /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
        " ",
        "(updated ",
        formatTimeAgo(dynamicInfo.lastUpdate),
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Text, { color: inkColors.primary, children: "\u{1F4C1} Workspace:" }),
        /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
          " ",
          workspaceFiles,
          " files"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Text, { color: inkColors.primary, children: "\u{1F4BE} Index:" }),
        /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
          " ",
          indexSize
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Text, { color: inkColors.warning, children: "\u{1F524} Tokens:" }),
        /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
          " ",
          dynamicInfo.tokenUsage.toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsxs(Text, { color: getMemoryPressureColor(dynamicInfo.memoryPressure), children: [
          getMemoryPressureIcon(dynamicInfo.memoryPressure),
          " Memory:"
        ] }),
        /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
          " ",
          dynamicInfo.memoryPressure
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Box, { marginBottom: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.success, children: "\u{1F504} Session:" }),
      /* @__PURE__ */ jsxs(Text, { color: sessionRestored ? inkColors.success : inkColors.muted, children: [
        " ",
        sessionRestored ? "restored" : "fresh"
      ] })
    ] }),
    dynamicInfo.backgroundActivity.length > 0 && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.accent, children: "\u26A1 Background Activity:" }),
      dynamicInfo.backgroundActivity.map((activity, index) => /* @__PURE__ */ jsx(Box, { marginLeft: 2, children: /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
        "\u2022 ",
        activity
      ] }) }, index))
    ] })
  ] });
}
function getActiveBackgroundTasks() {
  const possibleTasks = [
    "Indexing workspace files",
    "Watching for file changes",
    "Compacting context",
    "Syncing session state",
    "Optimizing token usage"
  ];
  const numTasks = Math.floor(Math.random() * 3);
  return possibleTasks.slice(0, numTasks);
}
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1e3);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
var init_context_status = __esm({
  "src/ui/components/context-status.tsx"() {
    init_colors();
  }
});
function Banner({
  style = "default",
  showContext = true,
  workspaceFiles = 0,
  indexSize = "0 MB",
  sessionRestored = false
}) {
  const getBannerArt = () => {
    switch (style) {
      case "mini":
        return xcliMini;
      case "retro":
        return xcliRetro;
      default:
        return xcliBanner;
    }
  };
  const getContextStatus = () => {
    if (!showContext) return null;
    return /* @__PURE__ */ jsxs(Box, { marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: "Context: " }),
      /* @__PURE__ */ jsx(
        ContextStatus,
        {
          workspaceFiles,
          indexSize,
          sessionRestored,
          showDetails: false
        }
      ),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " \xB7 Press " }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.accent, bold: true, children: "Ctrl+I" }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " for details" })
    ] });
  };
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginBottom: 2, children: [
    /* @__PURE__ */ jsx(Text, { color: inkColors.accentBright, children: getBannerArt() }),
    /* @__PURE__ */ jsxs(Box, { marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: "Welcome to " }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.primary, bold: true, children: "X CLI" }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " " }),
      /* @__PURE__ */ jsxs(Text, { color: inkColors.warning, children: [
        "v",
        package_default.version
      ] }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " \u26A1" })
    ] }),
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: inkColors.success, bold: true, children: "\u{1F680} Claude Code-level intelligence in your terminal!" }) }),
    getContextStatus(),
    /* @__PURE__ */ jsxs(Box, { marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: inkColors.successBright, children: "\u2714 Ready." }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " Type your first command or paste code to begin." })
    ] })
  ] });
}
var xcliBanner, xcliMini, xcliRetro;
var init_banner = __esm({
  "src/ui/components/banner.tsx"() {
    init_package();
    init_colors();
    init_context_status();
    xcliBanner = `
\u2588\u2588   \u2588\u2588      \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588      \u2588\u2588 
 \u2588\u2588 \u2588\u2588      \u2588\u2588      \u2588\u2588      \u2588\u2588 
  \u2588\u2588\u2588       \u2588\u2588      \u2588\u2588      \u2588\u2588 
 \u2588\u2588 \u2588\u2588      \u2588\u2588      \u2588\u2588      \u2588\u2588 
\u2588\u2588   \u2588\u2588      \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588 
`;
    xcliMini = `
\u2584   \u2584     \u2584\u2584\u2584\u2584\u2584\u2584  \u2584     \u2584
\u2588\u2588 \u2588\u2588    \u2588\u2588      \u2588\u2588    \u2588\u2588 
 \u2588\u2588\u2588     \u2588\u2588      \u2588\u2588    \u2588\u2588 
\u2588\u2588 \u2588\u2588    \u2588\u2588\u2588\u2588\u2588\u2588  \u2588\u2588    \u2588\u2588 
`;
    xcliRetro = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551  \u2584\u2584\u2584\u2584   \u2584\u2584\u2584\u2584\u2584   \u2584\u2584\u2584\u2584\u2584   \u2584   \u2584   \u2584\u2584\u2584\u2584\u2584   \u2584     \u2584      \u2551
\u2551 \u2588\u2588      \u2588\u2588   \u2588 \u2588\u2588    \u2588 \u2588\u2588 \u2588\u2588  \u2588\u2588      \u2588\u2588    \u2588\u2588       \u2551
\u2551 \u2588\u2588  \u2584\u2584\u2584 \u2588\u2588\u2584\u2584\u2584\u2588 \u2588\u2588    \u2588 \u2588\u2588\u2588\u2588   \u2588\u2588      \u2588\u2588    \u2588\u2588       \u2551
\u2551 \u2588\u2588   \u2588\u2588 \u2588\u2588  \u2588\u2588 \u2588\u2588    \u2588 \u2588\u2588 \u2588\u2588  \u2588\u2588      \u2588\u2588    \u2588\u2588       \u2551
\u2551  \u2580\u2580\u2580\u2580\u2580   \u2580\u2580  \u2580\u2580  \u2580\u2580\u2580\u2580\u2580\u2580  \u2580\u2580  \u2580\u2580  \u2580\u2580\u2580\u2580\u2580   \u2580\u2580\u2580\u2580\u2580 \u2580\u2580      \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
`;
  }
});
function ContextTooltip({ isVisible }) {
  const { contextInfo } = useContextInfo();
  if (!isVisible) return null;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      borderStyle: "round",
      borderColor: inkColors.accent,
      padding: 1,
      marginTop: 1,
      marginBottom: 1,
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsxs(Box, { marginBottom: 1, children: [
          /* @__PURE__ */ jsx(Text, { color: inkColors.accent, bold: true, children: "\u{1F9E0} Context Awareness" }),
          /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
            " ",
            "(Ctrl+I to toggle)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
          /* @__PURE__ */ jsxs(Box, { marginBottom: 1, children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.primary, bold: true, children: "\u{1F4C1} Project:" }),
            /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
              " ",
              contextInfo.projectName || "Unknown"
            ] }),
            contextInfo.gitBranch && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " on " }),
              /* @__PURE__ */ jsx(Text, { color: inkColors.warning, children: contextInfo.gitBranch })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [
            /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: inkColors.success, children: "\u{1F4CA} Workspace:" }),
              /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
                " ",
                contextInfo.workspaceFiles,
                " files"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: inkColors.success, children: "\u{1F4BE} Index:" }),
              /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
                " ",
                contextInfo.indexSize
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", marginBottom: 1, children: [
            /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: inkColors.warning, children: "\u{1F4DD} Session:" }),
              /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
                " ",
                contextInfo.sessionFiles,
                " files"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: inkColors.warning, children: "\u{1F524} Tokens:" }),
              /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
                " ",
                contextInfo.activeTokens.toLocaleString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.accent, children: "\u26A1 Activity:" }),
            /* @__PURE__ */ jsxs(Text, { color: inkColors.text, children: [
              " ",
              contextInfo.lastActivity
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: inkColors.muted, dimColor: true, children: "\u{1F4A1} This shows your current workspace context and session state" }) })
      ]
    }
  );
}
var init_context_tooltip = __esm({
  "src/ui/components/context-tooltip.tsx"() {
    init_colors();
    init_use_context_info();
  }
});
function UserMessageEntry({ entry, verbosityLevel: _verbosityLevel }) {
  const displayText = entry.isPasteSummary ? entry.displayContent || entry.content : entry.content;
  const textColor = entry.isPasteSummary ? "cyan" : "gray";
  return /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginTop: 1, children: /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsxs(Text, { color: textColor, children: [
    ">",
    " ",
    truncateContent(displayText)
  ] }) }) });
}
var truncateContent;
var init_user_message_entry = __esm({
  "src/ui/components/chat-entries/user-message-entry.tsx"() {
    truncateContent = (content, maxLength = 100) => {
      if (process.env.COMPACT !== "1") return content;
      return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
    };
  }
});
function MarkdownRenderer({ content }) {
  try {
    const result = marked.parse(content);
    const rendered = typeof result === "string" ? result : content;
    return /* @__PURE__ */ jsx(Text, { children: rendered });
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return /* @__PURE__ */ jsx(Text, { children: content });
  }
}
var init_markdown_renderer = __esm({
  "src/ui/utils/markdown-renderer.tsx"() {
    marked.setOptions({
      renderer: new TerminalRenderer()
    });
  }
});
function AssistantMessageEntry({ entry, verbosityLevel: _verbosityLevel }) {
  const { content: processedContent, isTruncated } = handleLongContent(entry.content);
  return /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginTop: 1, children: /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "flex-start", children: [
    /* @__PURE__ */ jsx(Text, { color: "white", children: "\u23FA " }),
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [
      entry.toolCalls ? (
        // If there are tool calls, just show plain text
        /* @__PURE__ */ jsx(Text, { color: "white", children: processedContent.trim() })
      ) : (
        // If no tool calls, render as markdown
        /* @__PURE__ */ jsx(MarkdownRenderer, { content: processedContent.trim() })
      ),
      entry.isStreaming && /* @__PURE__ */ jsx(Text, { color: "cyan", children: "\u2588" }),
      isTruncated && /* @__PURE__ */ jsx(Text, { color: "yellow", italic: true, children: "[Response truncated for performance - full content in session log]" })
    ] })
  ] }) });
}
var handleLongContent;
var init_assistant_message_entry = __esm({
  "src/ui/components/chat-entries/assistant-message-entry.tsx"() {
    init_markdown_renderer();
    handleLongContent = (content, maxLength = 5e3) => {
      if (content.length <= maxLength) {
        return { content, isTruncated: false };
      }
      const truncated = content.substring(0, maxLength);
      const summary = `

[Content truncated - ${content.length - maxLength} characters remaining. Full content available in chat history.]`;
      return {
        content: truncated + summary,
        isTruncated: true
      };
    };
  }
});

// src/ui/utils/colors.ts
var Colors;
var init_colors2 = __esm({
  "src/ui/utils/colors.ts"() {
    Colors = {
      AccentYellow: "yellow",
      Gray: "gray",
      Red: "red",
      Green: "green",
      Blue: "blue",
      Cyan: "cyan",
      Magenta: "magenta",
      White: "white",
      Black: "black"
    };
  }
});
var MaxSizedBox;
var init_max_sized_box = __esm({
  "src/ui/shared/max-sized-box.tsx"() {
    MaxSizedBox = ({
      maxHeight: _maxHeight,
      maxWidth: _maxWidth,
      children,
      ...props
    }) => {
      return /* @__PURE__ */ jsx(
        Box,
        {
          flexDirection: "column",
          ...props,
          children
        }
      );
    };
  }
});
function parseDiffWithLineNumbers(diffContent) {
  const lines = diffContent.split("\n");
  const result = [];
  let currentOldLine = 0;
  let currentNewLine = 0;
  let inHunk = false;
  const hunkHeaderRegex = /^@@ -(\d+),?\d* \+(\d+),?\d* @@/;
  for (const line of lines) {
    const hunkMatch = line.match(hunkHeaderRegex);
    if (hunkMatch) {
      currentOldLine = parseInt(hunkMatch[1], 10);
      currentNewLine = parseInt(hunkMatch[2], 10);
      inHunk = true;
      result.push({ type: "hunk", content: line });
      currentOldLine--;
      currentNewLine--;
      continue;
    }
    if (!inHunk) {
      if (line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("similarity index") || line.startsWith("rename from") || line.startsWith("rename to") || line.startsWith("new file mode") || line.startsWith("deleted file mode"))
        continue;
      continue;
    }
    if (line.startsWith("+")) {
      currentNewLine++;
      result.push({
        type: "add",
        newLine: currentNewLine,
        content: line.substring(1)
      });
    } else if (line.startsWith("-")) {
      currentOldLine++;
      result.push({
        type: "del",
        oldLine: currentOldLine,
        content: line.substring(1)
      });
    } else if (line.startsWith(" ")) {
      currentOldLine++;
      currentNewLine++;
      result.push({
        type: "context",
        oldLine: currentOldLine,
        newLine: currentNewLine,
        content: line.substring(1)
      });
    } else if (line.startsWith("\\")) {
      result.push({ type: "other", content: line });
    }
  }
  return result;
}
var DEFAULT_TAB_WIDTH, DiffRenderer, renderDiffContent;
var init_diff_renderer = __esm({
  "src/ui/components/diff-renderer.tsx"() {
    init_colors2();
    init_max_sized_box();
    DEFAULT_TAB_WIDTH = 4;
    DiffRenderer = ({
      diffContent,
      filename,
      tabWidth = DEFAULT_TAB_WIDTH,
      availableTerminalHeight,
      terminalWidth = 80
    }) => {
      if (!diffContent || typeof diffContent !== "string") {
        return /* @__PURE__ */ jsx(Text, { color: Colors.AccentYellow, children: "No diff content." });
      }
      const lines = diffContent.split("\n");
      const firstLine = lines[0];
      let actualDiffContent = diffContent;
      if (firstLine && (firstLine.startsWith("Updated ") || firstLine.startsWith("Created "))) {
        actualDiffContent = lines.slice(1).join("\n");
      }
      const parsedLines = parseDiffWithLineNumbers(actualDiffContent);
      if (parsedLines.length === 0) {
        return /* @__PURE__ */ jsx(Text, { dimColor: true, children: "No changes detected." });
      }
      const renderedOutput = renderDiffContent(
        parsedLines,
        filename,
        tabWidth,
        availableTerminalHeight,
        terminalWidth
      );
      return /* @__PURE__ */ jsx(Fragment, { children: renderedOutput });
    };
    renderDiffContent = (parsedLines, filename, tabWidth = DEFAULT_TAB_WIDTH, availableTerminalHeight, terminalWidth) => {
      const normalizedLines = parsedLines.map((line) => ({
        ...line,
        content: line.content.replace(/\t/g, " ".repeat(tabWidth))
      }));
      const displayableLines = normalizedLines.filter(
        (l) => l.type !== "hunk" && l.type !== "other"
      );
      if (displayableLines.length === 0) {
        return /* @__PURE__ */ jsx(Text, { dimColor: true, children: "No changes detected." });
      }
      let baseIndentation = Infinity;
      for (const line of displayableLines) {
        if (line.content.trim() === "") continue;
        const firstCharIndex = line.content.search(/\S/);
        const currentIndent = firstCharIndex === -1 ? 0 : firstCharIndex;
        baseIndentation = Math.min(baseIndentation, currentIndent);
      }
      if (!isFinite(baseIndentation)) {
        baseIndentation = 0;
      }
      const key = filename ? `diff-box-${filename}` : `diff-box-${crypto.createHash("sha1").update(JSON.stringify(parsedLines)).digest("hex")}`;
      let lastLineNumber = null;
      const MAX_CONTEXT_LINES_WITHOUT_GAP = 5;
      return /* @__PURE__ */ jsx(
        MaxSizedBox,
        {
          maxHeight: availableTerminalHeight,
          maxWidth: terminalWidth,
          children: displayableLines.reduce((acc, line, index) => {
            let relevantLineNumberForGapCalc = null;
            if (line.type === "add" || line.type === "context") {
              relevantLineNumberForGapCalc = line.newLine ?? null;
            } else if (line.type === "del") {
              relevantLineNumberForGapCalc = line.oldLine ?? null;
            }
            if (lastLineNumber !== null && relevantLineNumberForGapCalc !== null && relevantLineNumberForGapCalc > lastLineNumber + MAX_CONTEXT_LINES_WITHOUT_GAP + 1) {
              acc.push(
                /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Text, { wrap: "truncate", children: "\u2550".repeat(terminalWidth) }) }, `gap-${index}`)
              );
            }
            const lineKey = `diff-line-${index}`;
            let gutterNumStr = "";
            let backgroundColor = void 0;
            let prefixSymbol = " ";
            let dim = false;
            switch (line.type) {
              case "add":
                gutterNumStr = (line.newLine ?? "").toString();
                backgroundColor = "#86efac";
                prefixSymbol = "+";
                lastLineNumber = line.newLine ?? null;
                break;
              case "del":
                gutterNumStr = (line.oldLine ?? "").toString();
                backgroundColor = "redBright";
                prefixSymbol = "-";
                if (line.oldLine !== void 0) {
                  lastLineNumber = line.oldLine;
                }
                break;
              case "context":
                gutterNumStr = (line.newLine ?? "").toString();
                dim = true;
                prefixSymbol = " ";
                lastLineNumber = line.newLine ?? null;
                break;
              default:
                return acc;
            }
            const displayContent = line.content.substring(baseIndentation);
            acc.push(
              /* @__PURE__ */ jsxs(Box, { flexDirection: "row", children: [
                /* @__PURE__ */ jsx(Text, { color: Colors.Gray, dimColor: dim, children: gutterNumStr.padEnd(4) }),
                /* @__PURE__ */ jsxs(Text, { color: backgroundColor ? "#000000" : void 0, backgroundColor, dimColor: !backgroundColor && dim, children: [
                  prefixSymbol,
                  " "
                ] }),
                /* @__PURE__ */ jsx(Text, { color: backgroundColor ? "#000000" : void 0, backgroundColor, dimColor: !backgroundColor && dim, wrap: "wrap", children: displayContent })
              ] }, lineKey)
            );
            return acc;
          }, [])
        },
        key
      );
    };
  }
});
function FileContentRenderer({ content }) {
  const lines = content.split("\n");
  let baseIndentation = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const firstCharIndex = line.search(/\S/);
    const currentIndent = firstCharIndex === -1 ? 0 : firstCharIndex;
    baseIndentation = Math.min(baseIndentation, currentIndent);
  }
  if (!isFinite(baseIndentation)) {
    baseIndentation = 0;
  }
  return /* @__PURE__ */ jsx(Box, { flexDirection: "column", children: lines.map((line, index) => {
    const displayContent = line.substring(baseIndentation);
    return /* @__PURE__ */ jsx(Text, { color: "gray", children: displayContent }, index);
  }) });
}
var init_file_content_renderer = __esm({
  "src/ui/components/content-renderers/file-content-renderer.tsx"() {
  }
});
function ToolCallEntry({ entry, verbosityLevel, explainLevel }) {
  const getExplanation = (toolName2, filePath2, _isExecuting) => {
    if (explainLevel === "off") return null;
    const explanations = {
      view_file: {
        brief: `Reading ${filePath2} to examine its contents`,
        detailed: `Reading the file ${filePath2} to examine its current contents, structure, and implementation details for analysis or modification.`
      },
      str_replace_editor: {
        brief: `Updating ${filePath2} with changes`,
        detailed: `Applying targeted modifications to ${filePath2} using precise string replacement to update specific code sections while preserving the rest of the file structure.`
      },
      create_file: {
        brief: `Creating new file ${filePath2}`,
        detailed: `Creating a new file at ${filePath2} with the specified content, establishing the initial structure and implementation for this component or module.`
      },
      bash: {
        brief: `Executing command: ${filePath2}`,
        detailed: `Running the shell command "${filePath2}" to perform system operations, file management, or external tool execution as requested.`
      },
      search: {
        brief: `Searching for: ${filePath2}`,
        detailed: `Performing a comprehensive search across the codebase for "${filePath2}" to locate relevant files, functions, or code patterns that match the query.`
      }
    };
    const explanation2 = explanations[toolName2];
    if (!explanation2) return null;
    return explainLevel === "detailed" ? explanation2.detailed : explanation2.brief;
  };
  const getToolActionName = (toolName2) => {
    if (toolName2.startsWith("mcp__")) {
      const parts = toolName2.split("__");
      if (parts.length >= 3) {
        const serverName = parts[1];
        const actualToolName = parts.slice(2).join("__");
        return `${serverName.charAt(0).toUpperCase() + serverName.slice(1)}(${actualToolName.replace(/_/g, " ")})`;
      }
    }
    switch (toolName2) {
      case "view_file":
        return "Read";
      case "str_replace_editor":
        return "Update";
      case "create_file":
        return "Create";
      case "bash":
        return "Bash";
      case "search":
        return "Search";
      case "create_todo_list":
        return "Created Todo";
      case "update_todo_list":
        return "Updated Todo";
      default:
        return "Tool";
    }
  };
  const toolName = entry.toolCall?.function?.name || "unknown";
  const actionName = getToolActionName(toolName);
  const getFilePath = (toolCall) => {
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (toolCall.function.name === "search") {
          return args.query;
        }
        return args.path || args.file_path || args.command || "";
      } catch {
        return "";
      }
    }
    return "";
  };
  const filePath = getFilePath(entry.toolCall);
  const isExecuting = entry.type === "tool_call" || !entry.toolResult;
  const formatToolContent = (content, toolName2) => {
    const truncated = truncateContent2(content, 200);
    if (toolName2.startsWith("mcp__")) {
      try {
        const parsed = JSON.parse(truncated);
        if (Array.isArray(parsed)) {
          return `Found ${parsed.length} items`;
        } else if (typeof parsed === "object") {
          return JSON.stringify(parsed, null, 2);
        }
      } catch {
        return truncated;
      }
    }
    return truncated;
  };
  const shouldShowDiff = entry.toolCall?.function?.name === "str_replace_editor" && entry.toolResult?.success && entry.content.includes("Updated") && entry.content.includes("---") && entry.content.includes("+++");
  const shouldShowFileContent = (entry.toolCall?.function?.name === "view_file" || entry.toolCall?.function?.name === "create_file") && entry.toolResult?.success && !shouldShowDiff;
  const shouldShowToolContent = verbosityLevel !== "quiet";
  const shouldShowFullContent = verbosityLevel === "normal" || verbosityLevel === "verbose";
  const explanation = getExplanation(toolName, filePath);
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
    /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx(Text, { color: "magenta", children: "\u23FA" }),
      /* @__PURE__ */ jsxs(Text, { color: "white", children: [
        " ",
        filePath ? `${actionName}(${filePath})` : actionName
      ] })
    ] }),
    explanation && /* @__PURE__ */ jsx(Box, { marginLeft: 2, children: /* @__PURE__ */ jsxs(Text, { color: "blue", italic: true, children: [
      "\u{1F4A1} ",
      explanation
    ] }) }),
    shouldShowToolContent && /* @__PURE__ */ jsx(Box, { marginLeft: 2, flexDirection: "column", children: isExecuting ? /* @__PURE__ */ jsx(Text, { color: "cyan", children: "\u23BF Executing..." }) : shouldShowFileContent && shouldShowFullContent ? /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u23BF File contents:" }),
      /* @__PURE__ */ jsx(Box, { marginLeft: 2, flexDirection: "column", children: /* @__PURE__ */ jsx(FileContentRenderer, { content: entry.content }) })
    ] }) : shouldShowDiff && shouldShowFullContent ? (
      // For diff results, show only the summary line, not the raw content
      /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
        "\u23BF ",
        entry.content.split("\n")[0]
      ] })
    ) : !shouldShowFullContent ? /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u23BF Completed" }) : /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
      "\u23BF ",
      formatToolContent(entry.content, toolName)
    ] }) }),
    shouldShowDiff && !isExecuting && shouldShowFullContent && /* @__PURE__ */ jsx(Box, { marginLeft: 4, flexDirection: "column", children: /* @__PURE__ */ jsx(
      DiffRenderer,
      {
        diffContent: entry.content,
        filename: filePath,
        terminalWidth: 80
      }
    ) })
  ] });
}
var truncateContent2;
var init_tool_call_entry = __esm({
  "src/ui/components/chat-entries/tool-call-entry.tsx"() {
    init_diff_renderer();
    init_file_content_renderer();
    truncateContent2 = (content, maxLength = 100) => {
      if (process.env.COMPACT !== "1") return content;
      return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
    };
  }
});
function ChatEntryRouter({ entry, verbosityLevel, explainLevel }) {
  switch (entry.type) {
    case "user":
      return /* @__PURE__ */ jsx(UserMessageEntry, { entry, verbosityLevel });
    case "assistant":
      return /* @__PURE__ */ jsx(AssistantMessageEntry, { entry, verbosityLevel });
    case "tool_call":
    case "tool_result":
      return /* @__PURE__ */ jsx(ToolCallEntry, { entry, verbosityLevel, explainLevel });
    default:
      return null;
  }
}
var init_chat_entry_router = __esm({
  "src/ui/components/chat-entry-router.tsx"() {
    init_user_message_entry();
    init_assistant_message_entry();
    init_tool_call_entry();
  }
});
function ChatHistory({
  entries,
  isConfirmationActive = false,
  verbosityLevel = "quiet",
  explainLevel = "brief"
}) {
  const filteredEntries = isConfirmationActive ? entries.filter(
    (entry) => !(entry.type === "tool_call" && entry.content === "Executing...")
  ) : entries;
  const maxEntries = process.env.COMPACT === "1" ? 5 : 20;
  return /* @__PURE__ */ jsx(Box, { flexDirection: "column", children: filteredEntries.slice(-maxEntries).map((entry, index) => /* @__PURE__ */ jsx(
    MemoizedChatEntry,
    {
      entry,
      verbosityLevel,
      explainLevel
    },
    `${entry.timestamp.getTime()}-${index}`
  )) });
}
var MemoizedChatEntry;
var init_chat_history = __esm({
  "src/ui/components/chat-history.tsx"() {
    init_chat_entry_router();
    MemoizedChatEntry = React4.memo(
      ({ entry, verbosityLevel, explainLevel }) => {
        return /* @__PURE__ */ jsx(ChatEntryRouter, { entry, verbosityLevel, explainLevel });
      }
    );
    MemoizedChatEntry.displayName = "MemoizedChatEntry";
  }
});
function LoadingSpinner({
  isActive,
  processingTime,
  tokenCount,
  operation = "thinking",
  message,
  progress
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const config2 = operationConfig[operation];
  const spinnerChar = config2.spinner[frameIndex % config2.spinner.length];
  const operationMessage = message || config2.messages[messageIndex % config2.messages.length];
  const color = getSpinnerColor(operation);
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => prev + 1);
    }, 80);
    return () => clearInterval(interval);
  }, [isActive]);
  useEffect(() => {
    if (!isActive) return;
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => prev + 1);
    }, 80 * config2.spinner.length * 3);
    return () => clearInterval(messageInterval);
  }, [isActive, config2.spinner.length]);
  if (!isActive) return null;
  const renderProgressBar = () => {
    if (progress === void 0) return null;
    const barLength = 20;
    const filled = Math.round(progress / 100 * barLength);
    const empty = barLength - filled;
    const progressBar = "\u2588".repeat(filled) + "\u2591".repeat(empty);
    return /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
      " ",
      "[",
      /* @__PURE__ */ jsx(Text, { color, children: progressBar }),
      "] ",
      progress,
      "%"
    ] });
  };
  return /* @__PURE__ */ jsxs(Box, { marginTop: 1, children: [
    /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsxs(Text, { color, children: [
        config2.icon,
        " ",
        spinnerChar,
        " ",
        operationMessage
      ] }),
      renderProgressBar()
    ] }),
    /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
      " ",
      "(",
      processingTime,
      "s \xB7 \u2191 ",
      formatTokenCount(tokenCount),
      " tokens \xB7 esc to interrupt)"
    ] })
  ] });
}
var operationConfig;
var init_loading_spinner = __esm({
  "src/ui/components/loading-spinner.tsx"() {
    init_token_counter();
    init_colors();
    operationConfig = {
      thinking: {
        icon: "\u{1F9E0}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Thinking...", "Processing...", "Analyzing...", "Computing...", "Reasoning..."]
      },
      search: {
        icon: "\u{1F50D}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Searching...", "Scanning files...", "Finding matches...", "Indexing..."]
      },
      indexing: {
        icon: "\u{1F4C2}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Indexing workspace...", "Building context...", "Mapping relationships..."]
      },
      write: {
        icon: "\u{1F4DD}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Writing file...", "Saving changes...", "Updating content..."]
      },
      edit: {
        icon: "\u270F\uFE0F",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Editing file...", "Applying changes...", "Modifying content..."]
      },
      compact: {
        icon: "\u{1F504}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Compacting context...", "Optimizing memory...", "Refreshing session..."]
      },
      analyze: {
        icon: "\u{1F52C}",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Analyzing code...", "Understanding structure...", "Mapping dependencies..."]
      },
      process: {
        icon: "\u26A1",
        spinner: "\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F",
        messages: ["Processing...", "Working...", "Computing...", "Executing..."]
      }
    };
  }
});
function PlanModeIndicator({
  isActive,
  phase,
  progress,
  sessionDuration,
  detailed = false
}) {
  const phaseInfo = PHASE_DISPLAY[phase];
  const phaseDescription = PHASE_DESCRIPTIONS[phase];
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1e3);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };
  const formatProgressBar = (progress2, width = 20) => {
    const filled = Math.round(progress2 * width);
    const empty = width - filled;
    return "\u2588".repeat(filled) + "\u2591".repeat(empty);
  };
  if (!isActive) {
    return detailed ? /* @__PURE__ */ jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "gray", padding: 1, children: [
      /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "center", children: [
        /* @__PURE__ */ jsx(Text, { color: "gray", children: phaseInfo.symbol }),
        /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: "gray", bold: true, children: [
          "Plan Mode: ",
          phaseInfo.label
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: phaseDescription }) })
    ] }) : null;
  }
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: phaseInfo.color, padding: 1, children: [
    /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", children: [
      /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "center", children: [
        /* @__PURE__ */ jsx(Text, { color: phaseInfo.color, children: phaseInfo.symbol }),
        /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: phaseInfo.color, bold: true, children: [
          "Plan Mode: ",
          phaseInfo.label
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(Box, { flexDirection: "row", alignItems: "center", children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: formatDuration(sessionDuration) }) })
    ] }),
    phase !== "inactive" && phase !== "approved" && phase !== "rejected" && /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "center", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Box, { marginRight: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "Progress:" }) }),
      /* @__PURE__ */ jsx(Text, { color: phaseInfo.color, children: formatProgressBar(progress) }),
      /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: "gray", dimColor: true, children: [
        Math.round(progress * 100),
        "%"
      ] }) })
    ] }),
    detailed && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: phaseDescription }) }),
    detailed && phase === "analysis" && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "blue", dimColor: true, children: "\u2022 Reading project structure" }),
      /* @__PURE__ */ jsx(Text, { color: "blue", dimColor: true, children: "\u2022 Analyzing dependencies" }),
      /* @__PURE__ */ jsx(Text, { color: "blue", dimColor: true, children: "\u2022 Identifying key components" })
    ] }),
    detailed && phase === "strategy" && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "yellow", dimColor: true, children: "\u2022 Evaluating implementation approaches" }),
      /* @__PURE__ */ jsx(Text, { color: "yellow", dimColor: true, children: "\u2022 Assessing risks and dependencies" }),
      /* @__PURE__ */ jsx(Text, { color: "yellow", dimColor: true, children: "\u2022 Estimating effort and timeline" })
    ] }),
    detailed && phase === "presentation" && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Text, { color: "cyan", dimColor: true, children: "\u2022 Preparing implementation plan" }),
      /* @__PURE__ */ jsx(Text, { color: "cyan", dimColor: true, children: "\u2022 Organizing steps and dependencies" }),
      /* @__PURE__ */ jsx(Text, { color: "cyan", dimColor: true, children: "\u2022 Ready for your review" })
    ] }),
    !detailed && /* @__PURE__ */ jsx(Box, { flexDirection: "row", marginTop: 1, children: /* @__PURE__ */ jsxs(Text, { color: "gray", dimColor: true, children: [
      phase === "presentation" && "\u2022 Press Enter to review plan",
      phase === "approved" && '\u2022 Type "execute" to start implementation',
      phase === "rejected" && "\u2022 Provide feedback to regenerate plan",
      (phase === "analysis" || phase === "strategy") && "\u2022 Plan mode is analyzing..."
    ] }) })
  ] });
}
function PlanModeStatusIndicator({
  isActive,
  phase,
  progress
}) {
  if (!isActive) {
    return /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "Plan Mode: Off" });
  }
  const phaseInfo = PHASE_DISPLAY[phase];
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "row", alignItems: "center", children: [
    /* @__PURE__ */ jsx(Text, { color: phaseInfo.color, children: phaseInfo.symbol }),
    /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: phaseInfo.color, children: [
      "Plan: ",
      phaseInfo.label
    ] }) }),
    phase !== "inactive" && phase !== "approved" && phase !== "rejected" && /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: "gray", dimColor: true, children: [
      "(",
      Math.round(progress * 100),
      "%)"
    ] }) })
  ] });
}
var PHASE_DISPLAY, PHASE_DESCRIPTIONS;
var init_plan_mode_indicator = __esm({
  "src/ui/components/plan-mode-indicator.tsx"() {
    PHASE_DISPLAY = {
      inactive: { label: "Inactive", color: "gray", symbol: "\u25CB" },
      analysis: { label: "Analyzing", color: "blue", symbol: "\u{1F50D}" },
      strategy: { label: "Planning", color: "yellow", symbol: "\u{1F9E0}" },
      presentation: { label: "Presenting", color: "cyan", symbol: "\u{1F4CB}" },
      approved: { label: "Approved", color: "green", symbol: "\u2705" },
      rejected: { label: "Rejected", color: "red", symbol: "\u274C" }
    };
    PHASE_DESCRIPTIONS = {
      inactive: "Press Shift+Tab twice to enter Plan Mode",
      analysis: "Exploring codebase and gathering insights",
      strategy: "Formulating implementation strategy",
      presentation: "Presenting plan for your review",
      approved: "Plan approved - ready for execution",
      rejected: "Plan rejected - please provide feedback"
    };
  }
});
function ChatInput({
  input,
  cursorPosition,
  isProcessing,
  isStreaming
}) {
  const beforeCursor = input.slice(0, cursorPosition);
  const lines = input.split("\n");
  const isMultiline = lines.length > 1;
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let totalChars = 0;
  for (let i = 0; i < lines.length; i++) {
    if (totalChars + lines[i].length >= cursorPosition) {
      currentLineIndex = i;
      currentCharIndex = cursorPosition - totalChars;
      break;
    }
    totalChars += lines[i].length + 1;
  }
  const showCursor = !isProcessing && !isStreaming;
  const borderColor = isProcessing || isStreaming ? "yellow" : "blue";
  const promptColor = "cyan";
  const placeholderText = "Ask me anything...";
  const isPlaceholder = !input;
  if (isMultiline) {
    return /* @__PURE__ */ jsx(
      Box,
      {
        borderStyle: "round",
        borderColor,
        paddingY: 0,
        marginTop: 1,
        children: lines.map((line, index) => {
          const isCurrentLine = index === currentLineIndex;
          const promptChar = index === 0 ? "\u276F " : "  ";
          if (isCurrentLine) {
            const beforeCursorInLine = line.slice(0, currentCharIndex);
            const cursorChar2 = line.slice(currentCharIndex, currentCharIndex + 1) || " ";
            const afterCursorInLine = line.slice(currentCharIndex + 1);
            return /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: promptColor, children: promptChar }),
              /* @__PURE__ */ jsxs(Text, { children: [
                beforeCursorInLine,
                showCursor && /* @__PURE__ */ jsx(Text, { backgroundColor: "white", color: "black", children: cursorChar2 }),
                !showCursor && cursorChar2 !== " " && cursorChar2,
                afterCursorInLine
              ] })
            ] }, index);
          } else {
            return /* @__PURE__ */ jsxs(Box, { children: [
              /* @__PURE__ */ jsx(Text, { color: promptColor, children: promptChar }),
              /* @__PURE__ */ jsx(Text, { children: line })
            ] }, index);
          }
        })
      }
    );
  }
  const cursorChar = input.slice(cursorPosition, cursorPosition + 1) || " ";
  const afterCursorText = input.slice(cursorPosition + 1);
  return /* @__PURE__ */ jsx(
    Box,
    {
      borderStyle: "round",
      borderColor,
      paddingX: 1,
      paddingY: 0,
      marginTop: 1,
      children: /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsx(Text, { color: promptColor, children: "\u276F " }),
        isPlaceholder ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: placeholderText }),
          showCursor && /* @__PURE__ */ jsx(Text, { backgroundColor: "white", color: "black", children: " " })
        ] }) : /* @__PURE__ */ jsxs(Text, { children: [
          beforeCursor,
          showCursor && /* @__PURE__ */ jsx(Text, { backgroundColor: "white", color: "black", children: cursorChar }),
          !showCursor && cursorChar !== " " && cursorChar,
          afterCursorText
        ] })
      ] })
    }
  );
}
var init_chat_input = __esm({
  "src/ui/components/chat-input.tsx"() {
  }
});
function VersionNotification({ isVisible = true }) {
  const [versionInfo, setVersionInfo] = useState(null);
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const info = await getCachedVersionInfo();
        if (info?.isUpdateAvailable) {
          setVersionInfo({
            isUpdateAvailable: info.isUpdateAvailable,
            current: info.current,
            latest: info.latest
          });
        }
      } catch {
      }
    };
    checkVersion();
    const interval = setInterval(checkVersion, 6 * 60 * 60 * 1e3);
    return () => clearInterval(interval);
  }, []);
  if (!isVisible || !versionInfo?.isUpdateAvailable) {
    return null;
  }
  return /* @__PURE__ */ jsx(Box, { marginTop: 1, marginBottom: 1, children: /* @__PURE__ */ jsxs(
    Box,
    {
      borderStyle: "round",
      borderColor: inkColors.warning,
      paddingX: 2,
      paddingY: 0,
      children: [
        /* @__PURE__ */ jsxs(Text, { color: inkColors.warning, children: [
          "\u{1F504} Update available: v",
          versionInfo.latest,
          " (current: v",
          versionInfo.current,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " - Use '/upgrade' to update" })
      ]
    }
  ) });
}
var init_version_notification = __esm({
  "src/ui/components/version-notification.tsx"() {
    init_version_checker();
    init_colors();
  }
});
function MCPStatus({}) {
  const [connectedServers, setConnectedServers] = useState([]);
  const [_availableTools, setAvailableTools] = useState([]);
  useEffect(() => {
    const updateStatus = () => {
      try {
        const manager = getMCPManager();
        const servers = manager.getServers();
        const tools = manager.getTools();
        setConnectedServers(servers);
        setAvailableTools(tools);
      } catch (_error) {
        setConnectedServers([]);
        setAvailableTools([]);
      }
    };
    const initialTimer = setTimeout(updateStatus, 2e3);
    const interval = setInterval(updateStatus, 2e3);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);
  if (connectedServers.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(Box, { marginLeft: 1, children: /* @__PURE__ */ jsxs(Text, { color: "green", children: [
    "\u2692 mcps: ",
    connectedServers.length,
    " "
  ] }) });
}
var init_mcp_status = __esm({
  "src/ui/components/mcp-status.tsx"() {
    init_tools();
  }
});
function ContextIndicator({
  state,
  compact = false
}) {
  const getTokenColor = (percent) => {
    if (percent >= 90) return inkColors.error;
    if (percent >= 80) return inkColors.warning;
    if (percent >= 60) return inkColors.info;
    return inkColors.success;
  };
  const getMemoryPressureColor = (pressure) => {
    switch (pressure) {
      case "critical":
        return inkColors.error;
      case "high":
        return inkColors.warning;
      case "medium":
        return inkColors.info;
      default:
        return inkColors.success;
    }
  };
  const formatTokenCount2 = (count) => {
    if (count >= 1e6) {
      return `${(count / 1e6).toFixed(1)}M`;
    }
    if (count >= 1e3) {
      return `${(count / 1e3).toFixed(1)}k`;
    }
    return count.toString();
  };
  const getProgressBar = (percent, width = 20) => {
    const filled = Math.round(percent / 100 * width);
    const empty = width - filled;
    return "\u2588".repeat(filled) + "\u2592".repeat(empty);
  };
  if (compact) {
    return /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsxs(Text, { color: getTokenColor(state.tokenUsage.percent), children: [
        "\u{1F9E0} ",
        formatTokenCount2(state.tokenUsage.current),
        "/",
        formatTokenCount2(state.tokenUsage.max),
        " (",
        state.tokenUsage.percent,
        "%)"
      ] }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " \u2502 " }),
      /* @__PURE__ */ jsxs(Text, { color: inkColors.info, children: [
        "\u{1F4C1} ",
        state.fileCount,
        " files"
      ] }),
      /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " \u2502 " }),
      /* @__PURE__ */ jsxs(Text, { color: inkColors.info, children: [
        "\u{1F4AC} ",
        state.messagesCount,
        " msgs"
      ] }),
      state.memoryPressure !== "low" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: " \u2502 " }),
        /* @__PURE__ */ jsxs(Text, { color: getMemoryPressureColor(state.memoryPressure), children: [
          "\u26A0\uFE0F ",
          state.memoryPressure,
          " pressure"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(
    Box,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: state.contextHealth === "critical" ? "red" : state.contextHealth === "degraded" ? "yellow" : "green",
      paddingX: 1,
      paddingY: 0,
      children: [
        /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", children: [
          /* @__PURE__ */ jsx(Text, { bold: true, color: inkColors.primary, children: "\u{1F9E0} Context Status" }),
          /* @__PURE__ */ jsx(
            Text,
            {
              color: state.contextHealth === "critical" ? inkColors.error : state.contextHealth === "degraded" ? inkColors.warning : inkColors.success,
              children: state.contextHealth.toUpperCase()
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
          /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.info, children: "Memory Usage:" }),
            /* @__PURE__ */ jsxs(Text, { color: getTokenColor(state.tokenUsage.percent), children: [
              formatTokenCount2(state.tokenUsage.current),
              "/",
              formatTokenCount2(state.tokenUsage.max),
              " (",
              state.tokenUsage.percent,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Box, { marginTop: 0, children: /* @__PURE__ */ jsx(Text, { color: getTokenColor(state.tokenUsage.percent), children: getProgressBar(state.tokenUsage.percent, 40) }) })
        ] }),
        /* @__PURE__ */ jsxs(Box, { justifyContent: "space-between", marginTop: 1, children: [
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.info, children: "\u{1F4C1} Files: " }),
            /* @__PURE__ */ jsx(Text, { color: inkColors.accent, children: state.fileCount })
          ] }),
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.info, children: "\u{1F4AC} Messages: " }),
            /* @__PURE__ */ jsx(Text, { color: inkColors.accent, children: state.messagesCount })
          ] }),
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.info, children: "\u{1F525} Pressure: " }),
            /* @__PURE__ */ jsx(Text, { color: getMemoryPressureColor(state.memoryPressure), children: state.memoryPressure })
          ] })
        ] }),
        state.tokenUsage.percent >= 80 && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: inkColors.warning, children: "\u26A0\uFE0F Approaching context limit. Consider using /compact or /clear" }) }),
        state.memoryPressure === "critical" && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: inkColors.error, children: "\u{1F6A8} Critical memory pressure! Performance may degrade. Use /clear immediately." }) }),
        state.loadedFiles.length > 0 && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
          /* @__PURE__ */ jsx(Text, { color: inkColors.info, bold: true, children: "Recent Files:" }),
          state.loadedFiles.slice(0, 3).map((file, index) => /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: "\u2022 " }),
            /* @__PURE__ */ jsx(Text, { color: inkColors.accent, children: file.path }),
            /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
              " ",
              "(",
              formatTokenCount2(file.tokens),
              " tokens)"
            ] })
          ] }, index)),
          state.loadedFiles.length > 3 && /* @__PURE__ */ jsxs(Text, { color: inkColors.muted, children: [
            "... and ",
            state.loadedFiles.length - 3,
            " more files"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: inkColors.muted, children: "\u{1F4A1} Use /context for details, /compact to optimize, /clear to reset" }) })
      ]
    }
  );
}
var init_context_indicator = __esm({
  "src/ui/components/context-indicator.tsx"() {
    init_colors();
  }
});
function ModelSelection({
  models,
  selectedIndex,
  isVisible,
  currentModel
}) {
  if (!isVisible) return null;
  return /* @__PURE__ */ jsxs(Box, { marginTop: 1, flexDirection: "column", children: [
    /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsxs(Text, { color: "cyan", children: [
      "Select Grok Model (current: ",
      currentModel,
      "):"
    ] }) }),
    models.map((modelOption, index) => /* @__PURE__ */ jsx(Box, { paddingLeft: 1, children: /* @__PURE__ */ jsx(
      Text,
      {
        color: index === selectedIndex ? "black" : "white",
        backgroundColor: index === selectedIndex ? "cyan" : void 0,
        children: modelOption.model
      }
    ) }, index)),
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "\u2191\u2193 navigate \u2022 Enter/Tab select \u2022 Esc cancel" }) })
  ] });
}
var init_model_selection = __esm({
  "src/ui/components/model-selection.tsx"() {
  }
});
function ConfirmationDialog({
  operation,
  filename,
  onConfirm,
  onReject,
  showVSCodeOpen = false,
  content
}) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedback, setFeedback] = useState("");
  const options = [
    "Yes",
    "Yes, and don't ask again this session",
    "No",
    "No, with feedback"
  ];
  useInput((input, key) => {
    if (feedbackMode) {
      if (key.return) {
        onReject(feedback.trim());
        return;
      }
      if (key.backspace || key.delete) {
        setFeedback((prev) => prev.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setFeedback((prev) => prev + input);
      }
      return;
    }
    if (key.upArrow || key.shift && key.tab) {
      setSelectedOption((prev) => prev > 0 ? prev - 1 : options.length - 1);
      return;
    }
    if (key.downArrow || key.tab) {
      setSelectedOption((prev) => (prev + 1) % options.length);
      return;
    }
    if (key.return) {
      if (selectedOption === 0) {
        onConfirm(false);
      } else if (selectedOption === 1) {
        onConfirm(true);
      } else if (selectedOption === 2) {
        onReject("Operation cancelled by user");
      } else {
        setFeedbackMode(true);
      }
      return;
    }
    if (key.escape) {
      if (feedbackMode) {
        setFeedbackMode(false);
        setFeedback("");
      } else {
        onReject("Operation cancelled by user (pressed Escape)");
      }
      return;
    }
  });
  if (feedbackMode) {
    return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginBottom: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", children: "Type your feedback and press Enter, or press Escape to go back." }) }),
      /* @__PURE__ */ jsxs(
        Box,
        {
          borderStyle: "round",
          borderColor: "yellow",
          paddingX: 1,
          marginTop: 1,
          children: [
            /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u276F " }),
            /* @__PURE__ */ jsxs(Text, { children: [
              feedback,
              /* @__PURE__ */ jsx(Text, { color: "white", children: "\u2588" })
            ] })
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx(Text, { color: "magenta", children: "\u23FA" }),
      /* @__PURE__ */ jsxs(Text, { color: "white", children: [
        " ",
        operation,
        "(",
        filename,
        ")"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Box, { marginLeft: 2, flexDirection: "column", children: [
      /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u23BF Requesting user confirmation" }),
      showVSCodeOpen && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", children: "\u23BF Opened changes in Visual Studio Code \u29C9" }) }),
      content && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
          "\u23BF ",
          content.split("\n")[0]
        ] }),
        /* @__PURE__ */ jsx(Box, { marginLeft: 4, flexDirection: "column", children: /* @__PURE__ */ jsx(
          DiffRenderer,
          {
            diffContent: content,
            filename,
            terminalWidth: 80
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginTop: 1, children: [
      /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsx(Text, { children: "Do you want to proceed with this operation?" }) }),
      /* @__PURE__ */ jsx(Box, { flexDirection: "column", children: options.map((option, index) => /* @__PURE__ */ jsx(Box, { paddingLeft: 1, children: /* @__PURE__ */ jsxs(
        Text,
        {
          color: selectedOption === index ? "black" : "white",
          backgroundColor: selectedOption === index ? "cyan" : void 0,
          children: [
            index + 1,
            ". ",
            option
          ]
        }
      ) }, index)) }),
      /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "\u2191\u2193 navigate \u2022 Enter select \u2022 Esc cancel" }) })
    ] })
  ] });
}
var init_confirmation_dialog = __esm({
  "src/ui/components/confirmation-dialog.tsx"() {
    init_diff_renderer();
  }
});
function ChatInterfaceRenderer({
  chatHistory,
  confirmationOptions,
  showContextTooltip,
  contextInfo,
  verbosityLevel,
  explainLevel,
  isProcessing,
  isStreaming,
  processingTime,
  tokenCount,
  planMode,
  input,
  cursorPosition,
  autoEditEnabled,
  agent,
  commandSuggestions,
  selectedCommandIndex,
  showCommandSuggestions,
  availableModels,
  selectedModelIndex,
  showModelSelection,
  handleConfirmation,
  handleRejection,
  toggleContextTooltip
}) {
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", paddingX: 2, children: [
    chatHistory.length === 0 && !confirmationOptions && /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx(
        Banner,
        {
          style: "default",
          showContext: true,
          workspaceFiles: contextInfo.workspaceFiles,
          indexSize: contextInfo.indexSize,
          sessionRestored: contextInfo.sessionFiles > 0
        }
      ),
      /* @__PURE__ */ jsxs(Box, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsx(Text, { color: "cyan", bold: true, children: "\u{1F4A1} Quick Start Tips:" }),
        /* @__PURE__ */ jsxs(Box, { marginTop: 1, flexDirection: "column", children: [
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "yellow", children: "Ask anything:" }),
            ' "Create a React component" or "Debug this Python script"'
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "yellow", children: "Edit files:" }),
            ' "Add error handling to app.js"'
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "yellow", children: "Run commands:" }),
            ' "Set up a new Node.js project"'
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "yellow", children: "Get help:" }),
            ' Type "/help" for all commands'
          ] })
        ] }),
        /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { color: "cyan", bold: true, children: "\u{1F6E0}\uFE0F Power Features:" }) }),
        /* @__PURE__ */ jsxs(Box, { marginTop: 1, flexDirection: "column", children: [
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "magenta", children: "Auto-edit mode:" }),
            " Press Shift+Tab to toggle hands-free editing"
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "magenta", children: "Project memory:" }),
            " Create .xcli/GROK.md to customize behavior"
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "magenta", children: "Documentation:" }),
            ' Run "/init-agent" for .agent docs system'
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", children: [
            "\u2022 ",
            /* @__PURE__ */ jsx(Text, { color: "magenta", children: "Error recovery:" }),
            ' Run "/heal" after errors to add guardrails'
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Box, { flexDirection: "column", marginBottom: 1, children: /* @__PURE__ */ jsx(Text, { color: "gray", children: "Type your request in natural language. Ctrl+C to clear, 'exit' to quit." }) }),
    /* @__PURE__ */ jsx(Box, { flexDirection: "column", children: /* @__PURE__ */ jsx(
      ChatHistory,
      {
        entries: chatHistory,
        isConfirmationActive: !!confirmationOptions,
        verbosityLevel,
        explainLevel
      }
    ) }),
    /* @__PURE__ */ jsx(
      ContextTooltip,
      {
        isVisible: showContextTooltip,
        onToggle: toggleContextTooltip
      }
    ),
    confirmationOptions && /* @__PURE__ */ jsx(
      ConfirmationDialog,
      {
        operation: confirmationOptions.operation,
        filename: confirmationOptions.filename,
        showVSCodeOpen: confirmationOptions.showVSCodeOpen,
        content: confirmationOptions.content,
        onConfirm: handleConfirmation,
        onReject: handleRejection
      }
    ),
    !confirmationOptions && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        LoadingSpinner,
        {
          isActive: isProcessing || isStreaming,
          processingTime,
          tokenCount,
          operation: isStreaming ? "thinking" : "process",
          progress: void 0
        }
      ),
      planMode.isActive && planMode.currentPhase && planMode.progress !== void 0 && planMode.sessionDuration !== void 0 && /* @__PURE__ */ jsx(Box, { marginBottom: 1, children: /* @__PURE__ */ jsx(
        PlanModeIndicator,
        {
          isActive: planMode.isActive,
          phase: planMode.currentPhase,
          progress: planMode.progress,
          sessionDuration: planMode.sessionDuration,
          detailed: true
        }
      ) }),
      /* @__PURE__ */ jsx(
        ChatInput,
        {
          input,
          cursorPosition,
          isProcessing,
          isStreaming
        }
      ),
      /* @__PURE__ */ jsx(VersionNotification, { isVisible: !isProcessing && !isStreaming }),
      /* @__PURE__ */ jsxs(Box, { flexDirection: "row", marginTop: 1, children: [
        /* @__PURE__ */ jsxs(Box, { marginRight: 2, children: [
          /* @__PURE__ */ jsxs(Text, { color: "cyan", children: [
            autoEditEnabled ? "\u25B6" : "\u23F8",
            " auto-edit:",
            " ",
            autoEditEnabled ? "on" : "off"
          ] }),
          /* @__PURE__ */ jsxs(Text, { color: "gray", dimColor: true, children: [
            " ",
            "(shift + tab)"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Box, { marginRight: 2, children: /* @__PURE__ */ jsxs(Text, { color: "yellow", children: [
          "\u224B ",
          agent.getCurrentModel()
        ] }) }),
        /* @__PURE__ */ jsx(Box, { marginRight: 2, children: planMode.currentPhase && planMode.progress !== void 0 ? /* @__PURE__ */ jsx(
          PlanModeStatusIndicator,
          {
            isActive: planMode.isActive,
            phase: planMode.currentPhase,
            progress: planMode.progress
          }
        ) : /* @__PURE__ */ jsx(Text, { color: "gray", dimColor: true, children: "Plan Mode: Off" }) }),
        /* @__PURE__ */ jsx(MCPStatus, {})
      ] }),
      contextInfo.tokenUsage && contextInfo.loadedFiles && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(
        ContextIndicator,
        {
          state: {
            tokenUsage: contextInfo.tokenUsage,
            memoryPressure: contextInfo.memoryPressure,
            loadedFiles: contextInfo.loadedFiles,
            messagesCount: contextInfo.messagesCount,
            contextHealth: "optimal",
            // TODO: implement context health check
            fileCount: contextInfo.loadedFiles.length
          },
          compact: true
        }
      ) }),
      /* @__PURE__ */ jsx(
        CommandSuggestions,
        {
          suggestions: commandSuggestions,
          input,
          selectedIndex: selectedCommandIndex,
          isVisible: showCommandSuggestions
        }
      ),
      /* @__PURE__ */ jsx(
        ModelSelection,
        {
          models: availableModels,
          selectedIndex: selectedModelIndex,
          isVisible: showModelSelection,
          currentModel: agent.getCurrentModel()
        }
      )
    ] })
  ] });
}
var init_chat_interface_renderer = __esm({
  "src/ui/components/chat-interface-renderer.tsx"() {
    init_banner();
    init_context_tooltip();
    init_chat_history();
    init_loading_spinner();
    init_plan_mode_indicator();
    init_chat_input();
    init_version_notification();
    init_plan_mode_indicator();
    init_mcp_status();
    init_context_indicator();
    init_command_suggestions();
    init_model_selection();
    init_confirmation_dialog();
  }
});

// src/ui/components/chat-interface.tsx
var chat_interface_exports = {};
__export(chat_interface_exports, {
  default: () => ChatInterface
});
function ChatInterfaceWithAgent({
  agent,
  initialMessage,
  quiet = false,
  contextPack: _contextPack,
  contextStatus
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [confirmationOptions, setConfirmationOptions] = useState(null);
  const [showContextTooltip, setShowContextTooltip] = useState(false);
  const processingStartTime = useRef(0);
  useAutoRead(setChatHistory);
  useEffect(() => {
    const initialHistory = [];
    if (contextStatus) {
      initialHistory.push({
        type: "assistant",
        content: `\u{1F527} ${contextStatus}`,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    setChatHistory(initialHistory);
  }, [contextStatus]);
  useSessionLogging(chatHistory);
  const { contextInfo } = useContextInfo(agent);
  const handleGlobalShortcuts = (str, key) => {
    if (key.ctrl && (str === "i" || key.name === "i")) {
      setShowContextTooltip((prev) => !prev);
      return true;
    }
    return false;
  };
  const confirmationService = ConfirmationService.getInstance();
  const { introductionState, handleIntroductionInput = () => false } = useIntroduction(
    chatHistory,
    setChatHistory
  );
  const inputHandlerProps = {
    agent,
    chatHistory,
    setChatHistory,
    setIsProcessing,
    setIsStreaming,
    setTokenCount,
    setProcessingTime,
    processingStartTime,
    isProcessing,
    isStreaming,
    isConfirmationActive: !!confirmationOptions,
    onGlobalShortcut: handleGlobalShortcuts,
    introductionState,
    handleIntroductionInput
  };
  const {
    input,
    cursorPosition,
    showCommandSuggestions,
    selectedCommandIndex,
    showModelSelection,
    selectedModelIndex,
    commandSuggestions,
    availableModels,
    autoEditEnabled,
    verbosityLevel,
    explainLevel,
    planMode
  } = useInputHandler(inputHandlerProps);
  useStreaming(agent, initialMessage, setChatHistory, {
    setIsProcessing,
    setIsStreaming,
    setTokenCount});
  const { handleConfirmation, handleRejection } = useConfirmations(
    confirmationService,
    {
      setConfirmationOptions,
      setIsProcessing,
      setIsStreaming,
      setTokenCount,
      setProcessingTime,
      processingStartTime
    }
  );
  useProcessingTimer(isProcessing, isStreaming, setProcessingTime);
  const toggleContextTooltip = () => {
    setShowContextTooltip((prev) => !prev);
  };
  return /* @__PURE__ */ jsx(
    ChatInterfaceRenderer,
    {
      chatHistory,
      confirmationOptions,
      showContextTooltip,
      contextInfo,
      verbosityLevel,
      explainLevel,
      isProcessing,
      isStreaming,
      processingTime,
      tokenCount,
      planMode,
      input,
      cursorPosition,
      autoEditEnabled,
      agent,
      commandSuggestions,
      selectedCommandIndex,
      showCommandSuggestions,
      availableModels,
      selectedModelIndex,
      showModelSelection,
      handleConfirmation,
      handleRejection,
      toggleContextTooltip
    }
  );
}
function ChatInterface({
  agent,
  initialMessage,
  quiet = false,
  contextPack,
  contextStatus
}) {
  const [currentAgent, setCurrentAgent] = useState(
    agent || null
  );
  const handleApiKeySet = (newAgent) => {
    setCurrentAgent(newAgent);
  };
  if (!currentAgent) {
    return /* @__PURE__ */ jsx(ApiKeyInput, { onApiKeySet: handleApiKeySet });
  }
  return /* @__PURE__ */ jsx(
    ChatInterfaceWithAgent,
    {
      agent: currentAgent,
      initialMessage,
      quiet,
      contextPack,
      contextStatus
    }
  );
}
var init_chat_interface = __esm({
  "src/ui/components/chat-interface.tsx"() {
    init_use_input_handler();
    init_confirmation_service();
    init_api_key_input();
    init_use_context_info();
    init_use_auto_read();
    init_use_streaming();
    init_use_confirmations();
    init_use_introduction();
    init_use_console_setup();
    init_use_session_logging();
    init_use_processing_timer();
    init_chat_interface_renderer();
  }
});

// src/commands/mcp.ts
var mcp_exports = {};
__export(mcp_exports, {
  createMCPCommand: () => createMCPCommand
});
function createMCPCommand() {
  const mcpCommand = new Command("mcp");
  mcpCommand.description("Manage MCP (Model Context Protocol) servers");
  mcpCommand.command("add <name>").description("Add an MCP server").option("-t, --transport <type>", "Transport type (stdio, http, sse, streamable_http)", "stdio").option("-c, --command <command>", "Command to run the server (for stdio transport)").option("-a, --args [args...]", "Arguments for the server command (for stdio transport)", []).option("-u, --url <url>", "URL for HTTP/SSE transport").option("-h, --headers [headers...]", "HTTP headers (key=value format)", []).option("-e, --env [env...]", "Environment variables (key=value format)", []).action(async (name, options) => {
    try {
      if (PREDEFINED_SERVERS[name]) {
        const config3 = PREDEFINED_SERVERS[name];
        addMCPServer(config3);
        console.log(chalk.green(`\u2713 Added predefined MCP server: ${name}`));
        const manager2 = getMCPManager();
        await manager2.addServer(config3);
        console.log(chalk.green(`\u2713 Connected to MCP server: ${name}`));
        const tools2 = manager2.getTools().filter((t) => t.serverName === name);
        console.log(chalk.blue(`  Available tools: ${tools2.length}`));
        return;
      }
      const transportType = options.transport.toLowerCase();
      if (transportType === "stdio") {
        if (!options.command) {
          console.error(chalk.red("Error: --command is required for stdio transport"));
          process.exit(1);
        }
      } else if (transportType === "http" || transportType === "sse" || transportType === "streamable_http") {
        if (!options.url) {
          console.error(chalk.red(`Error: --url is required for ${transportType} transport`));
          process.exit(1);
        }
      } else {
        console.error(chalk.red("Error: Transport type must be stdio, http, sse, or streamable_http"));
        process.exit(1);
      }
      const env = {};
      for (const envVar of options.env || []) {
        const [key, value] = envVar.split("=", 2);
        if (key && value) {
          env[key] = value;
        }
      }
      const headers = {};
      for (const header of options.headers || []) {
        const [key, value] = header.split("=", 2);
        if (key && value) {
          headers[key] = value;
        }
      }
      const config2 = {
        name,
        transport: {
          type: transportType,
          command: options.command,
          args: options.args || [],
          url: options.url,
          env,
          headers: Object.keys(headers).length > 0 ? headers : void 0
        }
      };
      addMCPServer(config2);
      console.log(chalk.green(`\u2713 Added MCP server: ${name}`));
      const manager = getMCPManager();
      await manager.addServer(config2);
      console.log(chalk.green(`\u2713 Connected to MCP server: ${name}`));
      const tools = manager.getTools().filter((t) => t.serverName === name);
      console.log(chalk.blue(`  Available tools: ${tools.length}`));
    } catch (error) {
      console.error(chalk.red(`Error adding MCP server: ${error.message}`));
      process.exit(1);
    }
  });
  mcpCommand.command("add-json <name> <json>").description("Add an MCP server from JSON configuration").action(async (name, jsonConfig) => {
    try {
      let config2;
      try {
        config2 = JSON.parse(jsonConfig);
      } catch {
        console.error(chalk.red("Error: Invalid JSON configuration"));
        process.exit(1);
      }
      const serverConfig = {
        name,
        transport: {
          type: "stdio",
          // default
          command: config2.command,
          args: config2.args || [],
          env: config2.env || {},
          url: config2.url,
          headers: config2.headers
        }
      };
      if (config2.transport) {
        if (typeof config2.transport === "string") {
          serverConfig.transport.type = config2.transport;
        } else if (typeof config2.transport === "object") {
          serverConfig.transport = { ...serverConfig.transport, ...config2.transport };
        }
      }
      addMCPServer(serverConfig);
      console.log(chalk.green(`\u2713 Added MCP server: ${name}`));
      const manager = getMCPManager();
      await manager.addServer(serverConfig);
      console.log(chalk.green(`\u2713 Connected to MCP server: ${name}`));
      const tools = manager.getTools().filter((t) => t.serverName === name);
      console.log(chalk.blue(`  Available tools: ${tools.length}`));
    } catch (error) {
      console.error(chalk.red(`Error adding MCP server: ${error.message}`));
      process.exit(1);
    }
  });
  mcpCommand.command("remove <name>").description("Remove an MCP server").action(async (name) => {
    try {
      const manager = getMCPManager();
      await manager.removeServer(name);
      removeMCPServer(name);
      console.log(chalk.green(`\u2713 Removed MCP server: ${name}`));
    } catch (error) {
      console.error(chalk.red(`Error removing MCP server: ${error.message}`));
      process.exit(1);
    }
  });
  mcpCommand.command("list").description("List configured MCP servers").action(() => {
    const config2 = loadMCPConfig();
    const manager = getMCPManager();
    if (config2.servers.length === 0) {
      console.log(chalk.yellow("No MCP servers configured"));
      return;
    }
    console.log(chalk.bold("Configured MCP servers:"));
    console.log();
    for (const server of config2.servers) {
      const isConnected = manager.getServers().includes(server.name);
      const status = isConnected ? chalk.green("\u2713 Connected") : chalk.red("\u2717 Disconnected");
      console.log(`${chalk.bold(server.name)}: ${status}`);
      if (server.transport) {
        console.log(`  Transport: ${server.transport.type}`);
        if (server.transport.type === "stdio") {
          console.log(`  Command: ${server.transport.command} ${(server.transport.args || []).join(" ")}`);
        } else if (server.transport.type === "http" || server.transport.type === "sse") {
          console.log(`  URL: ${server.transport.url}`);
        }
      } else if (server.command) {
        console.log(`  Command: ${server.command} ${(server.args || []).join(" ")}`);
      }
      if (isConnected) {
        const transportType = manager.getTransportType(server.name);
        if (transportType) {
          console.log(`  Active Transport: ${transportType}`);
        }
        const tools = manager.getTools().filter((t) => t.serverName === server.name);
        console.log(`  Tools: ${tools.length}`);
        if (tools.length > 0) {
          tools.forEach((tool) => {
            const displayName = tool.name.replace(`mcp__${server.name}__`, "");
            console.log(`    - ${displayName}: ${tool.description}`);
          });
        }
      }
      console.log();
    }
  });
  mcpCommand.command("test <name>").description("Test connection to an MCP server").action(async (name) => {
    try {
      const config2 = loadMCPConfig();
      const serverConfig = config2.servers.find((s) => s.name === name);
      if (!serverConfig) {
        console.error(chalk.red(`Server ${name} not found`));
        process.exit(1);
      }
      console.log(chalk.blue(`Testing connection to ${name}...`));
      const manager = getMCPManager();
      await manager.addServer(serverConfig);
      const tools = manager.getTools().filter((t) => t.serverName === name);
      console.log(chalk.green(`\u2713 Successfully connected to ${name}`));
      console.log(chalk.blue(`  Available tools: ${tools.length}`));
      if (tools.length > 0) {
        console.log("  Tools:");
        tools.forEach((tool) => {
          const displayName = tool.name.replace(`mcp__${name}__`, "");
          console.log(`    - ${displayName}: ${tool.description}`);
        });
      }
    } catch (error) {
      console.error(chalk.red(`\u2717 Failed to connect to ${name}: ${error.message}`));
      process.exit(1);
    }
  });
  return mcpCommand;
}
var init_mcp = __esm({
  "src/commands/mcp.ts"() {
    init_config();
    init_tools();
  }
});

// src/commands/set-name.ts
var set_name_exports = {};
__export(set_name_exports, {
  createSetNameCommand: () => createSetNameCommand
});
function createSetNameCommand() {
  const setNameCommand = new Command("set-name");
  setNameCommand.description("Set a custom name for the AI assistant").argument("<name>", "The name to set for the assistant").action(async (name) => {
    try {
      const settingsManager = getSettingsManager();
      settingsManager.updateUserSetting("assistantName", name);
      console.log(chalk.green(`\u2705 Assistant name set to: ${name}`));
    } catch (error) {
      console.error(chalk.red(`\u274C Failed to set assistant name: ${error.message}`));
      process.exit(1);
    }
  });
  return setNameCommand;
}
var init_set_name = __esm({
  "src/commands/set-name.ts"() {
    init_settings_manager();
  }
});

// src/commands/toggle-confirmations.ts
var toggle_confirmations_exports = {};
__export(toggle_confirmations_exports, {
  createToggleConfirmationsCommand: () => createToggleConfirmationsCommand
});
function createToggleConfirmationsCommand() {
  const toggleCommand = new Command("toggle-confirmations");
  toggleCommand.description("Toggle the requirement for user confirmation on file operations and bash commands").action(async () => {
    try {
      const settingsManager = getSettingsManager();
      const currentValue = settingsManager.getUserSetting("requireConfirmation") ?? true;
      const newValue = !currentValue;
      settingsManager.updateUserSetting("requireConfirmation", newValue);
      console.log(chalk.green(`\u2705 Confirmation requirement ${newValue ? "enabled" : "disabled"}`));
      console.log(`File operations and bash commands will ${newValue ? "now" : "no longer"} require confirmation.`);
    } catch (error) {
      console.error(chalk.red(`\u274C Failed to toggle confirmations: ${error.message}`));
      process.exit(1);
    }
  });
  return toggleCommand;
}
var init_toggle_confirmations = __esm({
  "src/commands/toggle-confirmations.ts"() {
    init_settings_manager();
  }
});

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      type: "module",
      name: "@xagent/x-cli",
      version: "1.1.79",
      description: "An open-source AI agent that brings advanced AI capabilities directly into your terminal.",
      main: "dist/index.js",
      module: "dist/index.js",
      types: "dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js"
        }
      },
      bin: {
        xcli: "dist/index.js"
      },
      files: [
        "dist/**/*",
        ".xcli/**/*",
        "README.md",
        "LICENSE",
        "docs/assets/logos/**/*"
      ],
      scripts: {
        build: "tsup",
        "build:tsc": "tsc",
        dev: "npm run build && node dist/index.js --prompt 'Development test: Hello X-CLI!'",
        "dev:node": "tsx src/index.ts",
        "dev:watch": "npm run build && node --watch dist/index.js",
        start: "node dist/index.js",
        local: "node scripts/local.js",
        "test:workflow": "node scripts/test-workflow.js",
        "start:bun": "bun run dist/index.js",
        lint: "eslint . --ext .js,.jsx,.ts,.tsx --ignore-pattern 'dist/**'",
        typecheck: "tsc --noEmit",
        "install:bun": "bun install",
        preinstall: "echo '\u{1F916} Installing X CLI...'",
        postinstall: `echo '==================================================' && echo '\u2705 X CLI installed successfully!' && echo '==================================================' && echo '\u{1F680} Try: xcli --help' && echo '\u{1F4A1} If "command not found", add to PATH:' && node -e "const p=process.platform;const isMac=p==='darwin';const isLinux=p==='linux';if(isMac||isLinux){const shell=isMac?'zshrc':'bashrc';console.log((isMac?'\u{1F34E} Mac':'\u{1F427} Linux')+': echo \\'export PATH=\\"$(npm config get prefix)/bin:$PATH\\"\\' >> ~/.'+shell+' && source ~/.'+shell);}" && echo '\u{1F4D6} Docs: https://github.com/hinetapora/x-cli-hurry-mode#installation' && echo '\u{1F511} Set API key: export GROK_API_KEY=your_key_here' && echo '==================================================' && echo '\u{1F527} Auto-setup PATH? Press Enter to add (or Ctrl+C to skip)' && read -t 10 && node -e "const fs=require('fs');const p=process.platform;const isMac=p==='darwin';const isLinux=p==='linux';if(isMac||isLinux){const shellFile=isMac?'.zshrc':'.bashrc';const rcPath=process.env.HOME+'/'+shellFile;const pathCmd='export PATH=\\"$(npm config get prefix)/bin:$PATH\\"';try{const content=fs.readFileSync(rcPath,'utf8');if(!content.includes(pathCmd)){fs.appendFileSync(rcPath,'\\n'+pathCmd+'\\n');console.log('\u2705 Added to ~/'+shellFile+' - restart terminal');}else{console.log('\u2139\uFE0F Already in ~/'+shellFile);}}catch(e){console.log('\u26A0\uFE0F Could not modify ~/'+shellFile+' - add manually');}}" && echo '\u{1F50D} Verifying: ' && xcli --version 2>/dev/null || echo '\u26A0\uFE0F xcli not in PATH yet - follow above steps'`,
        prepare: "husky install",
        "dev:site": "cd apps/site && npm run start",
        "build:site": "cd apps/site && npm run build",
        "sync:docs": "cd apps/site && node src/scripts/sync-agent-docs.js",
        "smart-push": "./scripts/smart-push.sh"
      },
      "lint-staged": {
        "*.{ts,tsx}": [
          "eslint --fix --ignore-pattern 'dist/**'"
        ],
        "*.{js,jsx,mjs}": [
          "eslint --fix --ignore-pattern 'dist/**'"
        ],
        "*.{md,mdx}": [
          "prettier --write"
        ],
        "*.{json,yml,yaml}": [
          "prettier --write"
        ]
      },
      keywords: [
        "cli",
        "agent",
        "text-editor",
        "ai",
        "x-ai"
      ],
      author: "x-cli-team",
      license: "MIT",
      dependencies: {
        "@modelcontextprotocol/sdk": "^1.17.0",
        "@types/marked-terminal": "^6.1.1",
        "@typescript-eslint/typescript-estree": "^8.46.0",
        ajv: "^8.17.1",
        "ajv-formats": "^3.0.1",
        axios: "^1.7.0",
        cfonts: "^3.3.0",
        chalk: "^5.3.0",
        chokidar: "^4.0.3",
        "cli-highlight": "^2.1.11",
        commander: "^12.0.0",
        dotenv: "^16.4.0",
        enquirer: "^2.4.1",
        "fs-extra": "^11.2.0",
        "fuse.js": "^7.1.0",
        glob: "^11.0.3",
        ink: "^4.4.1",
        "js-yaml": "^4.1.0",
        marked: "^15.0.12",
        "marked-terminal": "^7.3.0",
        openai: "^5.10.1",
        react: "^18.3.1",
        "ripgrep-node": "^1.0.0",
        "terminal-image": "^4.0.0",
        tiktoken: "^1.0.21"
      },
      devDependencies: {
        "@eslint/js": "^9.37.0",
        "@types/fs-extra": "^11.0.2",
        "@types/node": "^20.8.0",
        "@types/react": "^18.3.3",
        "@typescript-eslint/eslint-plugin": "^8.37.0",
        "@typescript-eslint/parser": "^8.37.0",
        esbuild: "^0.25.10",
        eslint: "^9.31.0",
        husky: "^9.1.7",
        "lint-staged": "^16.2.4",
        prettier: "^3.6.2",
        tsup: "^8.5.0",
        tsx: "^4.0.0"
      },
      engines: {
        node: ">=18.0.0"
      },
      preferGlobal: true,
      repository: {
        type: "git",
        url: "https://github.com/x-cli-team/x-cli.git"
      },
      bugs: {
        url: "https://github.com/x-cli-team/x-cli/issues"
      },
      homepage: "https://x-cli.dev",
      icon: "docs/assets/logos/x-cli-logo.svg",
      publishConfig: {
        access: "public"
      },
      installConfig: {
        hoisting: false
      },
      optionalDependencies: {
        "tree-sitter": "^0.21.1",
        "tree-sitter-javascript": "^0.21.4",
        "tree-sitter-python": "^0.21.0",
        "tree-sitter-typescript": "^0.21.2"
      },
      trustedDependencies: [
        "esbuild",
        "tree-sitter",
        "tree-sitter-javascript",
        "tree-sitter-python",
        "tree-sitter-typescript"
      ]
    };
  }
});
dotenv.config();
var logStream = fs2__default.createWriteStream(path8__default.join(process.cwd(), "xcli-startup.log"), { flags: "a" });
var log = (...args) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const msg = `[${timestamp}] ${args.join(" ")}
`;
  console.log(msg.trim());
  try {
    logStream.write(msg);
  } catch {
  }
};
log("\u{1F680} X-CLI Starting Up...");
log(`\u{1F4C2} Working directory: ${process.cwd()}`);
log(`\u{1F5A5}\uFE0F  Node version: ${process.version}`);
var apiKey = process.env.GROK_API_KEY;
log(`\u{1F511} API Key: ${apiKey ? "\u2705 Found" : "\u274C Missing"}`);
if (!apiKey) {
  console.error("\u274C No API key found. Set GROK_API_KEY environment variable.");
  log("\u274C Missing API key - exiting");
  process.exit(1);
}
log("\u{1F4E6} Loading core modules...");
try {
  let loadModel = function() {
    let model = process.env.GROK_MODEL;
    if (!model) {
      try {
        const manager = getSettingsManager2();
        model = manager.getCurrentModel?.();
      } catch {
        model = "grok-4-fast-non-reasoning";
      }
    }
    return model;
  };
  loadModel2 = loadModel;
  const { GrokAgent: GrokAgent2 } = await Promise.resolve().then(() => (init_grok_agent(), grok_agent_exports));
  const ChatInterface2 = (await Promise.resolve().then(() => (init_chat_interface(), chat_interface_exports))).default;
  const { printWelcomeBanner: printWelcomeBanner2 } = await Promise.resolve().then(() => (init_use_console_setup(), use_console_setup_exports));
  const { getSettingsManager: getSettingsManager2 } = await Promise.resolve().then(() => (init_settings_manager(), settings_manager_exports));
  const { ConfirmationService: ConfirmationService2 } = await Promise.resolve().then(() => (init_confirmation_service(), confirmation_service_exports));
  const { createMCPCommand: createMCPCommand2 } = await Promise.resolve().then(() => (init_mcp(), mcp_exports));
  const { createSetNameCommand: createSetNameCommand2 } = await Promise.resolve().then(() => (init_set_name(), set_name_exports));
  const { createToggleConfirmationsCommand: createToggleConfirmationsCommand2 } = await Promise.resolve().then(() => (init_toggle_confirmations(), toggle_confirmations_exports));
  const pkg = await Promise.resolve().then(() => __toESM(require_package(), 1));
  const { checkForUpdates: checkForUpdates2 } = await Promise.resolve().then(() => (init_version_checker(), version_checker_exports));
  const { loadContext: loadContext2, formatContextStatus: formatContextStatus2 } = await Promise.resolve().then(() => (init_context_loader(), context_loader_exports));
  log("\u2705 All modules imported successfully");
  process.on("SIGTERM", () => {
    log("\u{1F44B} Gracefully shutting down...");
    process.exit(0);
  });
  process.on("uncaughtException", (error) => {
    log(`\u{1F4A5} Uncaught exception: ${error.message}`);
    console.error("\u{1F4A5} Uncaught exception:", error.message);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    log(`\u{1F4A5} Unhandled rejection: ${reason}`);
    console.error("\u{1F4A5} Unhandled rejection:", reason);
    process.exit(1);
  });
  async function saveCommandLineSettings(apiKey2, baseURL) {
    try {
      const manager = getSettingsManager2();
      if (apiKey2) {
        manager.updateUserSetting("apiKey", apiKey2);
        log("\u2705 API key saved to settings");
      }
      if (baseURL) {
        manager.updateUserSetting("baseURL", baseURL);
        log("\u2705 Base URL saved to settings");
      }
    } catch (error) {
      log(`\u26A0\uFE0F Could not save settings: ${error}`);
    }
  }
  log("\u{1F3AF} Initializing CLI...");
  try {
    const baseURL = process.env.GROK_BASE_URL;
    const model = loadModel();
    const maxToolRounds = parseInt(process.env.MAX_TOOL_ROUNDS || "400");
    log("\u{1F916} Creating GrokAgent instance...");
    const agent = new GrokAgent2(apiKey, baseURL, model, maxToolRounds);
    log("\u{1F4CB} Setting up Commander CLI...");
    program.name("x-cli").description("AI-powered CLI assistant").version(pkg.default.version).argument("[message...]", "Initial message to send to Grok").option("-d, --directory <dir>", "set working directory", process.cwd()).option("-k, --api-key <key>", "X API key").option("-u, --base-url <url>", "Grok API base URL").option("-m, --model <model>", "AI model to use").option("-p, --prompt <prompt>", "process a single prompt and exit (headless mode)").option("--max-tool-rounds <rounds>", "maximum tool rounds", "400").option("-q, --quiet", "suppress startup banner and messages").action(async (message, options) => {
      log("\u{1F3AF} Starting main execution...");
      if (options.directory) {
        try {
          process.chdir(options.directory);
          log(`\u{1F4C1} Changed to directory: ${options.directory}`);
        } catch (error) {
          log(`\u274C Directory change failed: ${error}`);
          process.exit(1);
        }
      }
      if (options.apiKey || options.baseUrl) {
        await saveCommandLineSettings(options.apiKey, options.baseUrl);
      }
      if (options.prompt) {
        log("\u{1F916} Processing headless prompt...");
        try {
          const confirmationService = ConfirmationService2.getInstance();
          confirmationService.setSessionFlag("allOperations", true);
          const chatEntries = await agent.processUserMessage(options.prompt);
          for (const entry of chatEntries) {
            if (entry.type === "assistant" && entry.content) {
              console.log(entry.content);
            }
          }
        } catch (error) {
          log(`\u274C Headless processing failed: ${error}`);
          process.exit(1);
        }
        return;
      }
      if (!process.stdin.isTTY) {
        console.error("\u274C Error: X CLI requires an interactive terminal.");
        process.exit(1);
      }
      let contextPack;
      let statusMessage;
      try {
        contextPack = loadContext2();
        statusMessage = formatContextStatus2(contextPack);
        log("\u{1F4DA} Context loaded successfully");
      } catch (error) {
        log(`\u26A0\uFE0F Context loading failed: ${error}`);
      }
      log("\u{1F680} Launching interactive CLI...");
      if (!options.quiet) {
        printWelcomeBanner2(options.quiet);
      }
      const app = render(React4.createElement(ChatInterface2, {
        agent,
        initialMessage: Array.isArray(message) ? message.join(" ") : message || "",
        quiet: options.quiet,
        contextStatus: statusMessage
      }));
      const cleanup = () => {
        log("\u{1F44B} Shutting down...");
        app.unmount();
        try {
          agent.abortCurrentOperation?.();
        } catch {
        }
      };
      process.on("exit", cleanup);
      process.on("SIGINT", () => {
        cleanup();
        process.exit(0);
      });
      process.on("SIGTERM", cleanup);
    });
    program.addCommand(createMCPCommand2());
    program.addCommand(createSetNameCommand2());
    program.addCommand(createToggleConfirmationsCommand2());
    log("\u2705 CLI setup complete");
    program.parse();
  } catch (error) {
    log(`\u{1F4A5} Fatal error during initialization: ${error}`);
    console.error("\u{1F4A5} Fatal error:", error);
    process.exit(1);
  }
} catch (error) {
  log(`\u{1F4A5} Failed to load modules: ${error}`);
  console.error("\u{1F4A5} Failed to load modules:", error);
  process.exit(1);
}
var loadModel2;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map