---
title: Installation & Setup Guide
---

# Installation & Setup Guide

## Overview

X CLI is installed globally via npm and includes automated installation scripts to handle common issues.

## Installation Methods

### Option 1: Run Without Installing (Recommended)

```bash
npx -y @xagent/x-cli@latest
```

**Benefits:**

- ✅ Always gets latest version
- ✅ No local installation needed
- ✅ No PATH configuration required
- ✅ No permission issues
- ✅ Works immediately

**Usage with API key:**

```bash
GROK_API_KEY=your_key npx -y @xagent/x-cli@latest
```

### Option 2: Global Installation

#### Standard NPM Install

```bash
npm install -g @xagent/x-cli@latest
```

#### Automated Installation Script

Use the provided `install.sh` script for automatic handling of installation issues:

```bash
curl -fsSL https://raw.githubusercontent.com/x-cli-team/x-cli/main/install.sh | bash
```

The script automatically:

- Detects and removes conflicting installations
- Tries multiple installation methods (npm, yarn, pnpm)
- Handles common npm cache and permission issues
- Cleans up failed installations

#### Alternative Package Managers

```bash
# Yarn
yarn global add @xagent/x-cli@latest

# pnpm
pnpm add -g @xagent/x-cli@latest

# Bun
bun add -g @xagent/x-cli@latest
```

#### Force Installation (if needed)

```bash
npm install -g @xagent/x-cli --force
```

## Post-Installation Setup

### 1. Verify Installation

```bash
xcli --version
```

### 2. Set API Key

```bash
# Environment variable (recommended)
export GROK_API_KEY=your_api_key_here

# Save permanently to shell profile
echo 'export GROK_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc

# Or save permanently (bash users)
echo 'export GROK_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

### 3. PATH Setup (If "command not found")

```bash
# Add npm global bin to PATH (macOS/Linux)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify it works
which xcli
xcli --version
```

### 3. Get Started

```bash
xcli --help
```

### 4. First Run

```bash
xcli
```

This launches the interactive chat interface.

## Troubleshooting

### Common Installation Issues

- **Permission errors**: Try with `sudo` or use a Node version manager
- **Cache issues**: The install script automatically cleans npm cache
- **Stuck installations**: Script kills running processes and removes old files

### Manual Cleanup

If needed, manually clean before reinstalling:

```bash
# Kill running processes
pkill -f xcli

# Remove installation
npm uninstall -g @xagent/x-cli

# Clean cache
npm cache clean --force
```

### Alternative Installation

Download pre-built binaries from: https://github.com/x-cli-team/x-cli/releases

## Requirements

- Node.js (latest LTS recommended)
- npm, yarn, or pnpm
- Internet connection for API access
