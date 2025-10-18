---
title: Quickstart
---

# Quickstart

Get started with Grok CLI in under 5 minutes. This guide will walk you through installation, basic configuration, and your first conversation with Grok.

## Prerequisites

- Node.js 18 or higher
- X.AI API key ([get one here](https://console.x.ai/))

## Installation

```bash
# Install globally via npm
npm install -g grok-cli-hurry-mode

# Or with bun
bun add -g grok-cli-hurry-mode
```

## Configuration

Set your X.AI API key:

```bash
# Set API key
grok config set apiKey YOUR_API_KEY_HERE

# Verify installation
grok --version
```

## First Conversation

Start a conversation:

```bash
grok "Hello! Can you help me understand this project?"
```

## Common First Tasks

**Read a file:**
```bash
grok "Read the package.json file and explain what this project does"
```

**Analyze code:**
```bash
grok "Look at the src/ directory and give me an overview of the architecture"
```

**Make changes:**
```bash
grok "Add a new npm script called 'dev' that runs 'node index.js'"
```

## Next Steps

- [Learn about tools and capabilities](../build/tools)
- [Configure your development environment](../config/settings)
- [Set up IDE integration](../config/vscode)

## Getting Help

- Use `grok --help` for CLI options
- Type `/help` in interactive mode
- Check our [troubleshooting guide](../build/troubleshooting)