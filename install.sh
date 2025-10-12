#!/bin/bash

# Grok CLI Installer
# Handles common npm installation issues automatically

set -e

echo "🤖 Installing Grok CLI..."

# Function to clean install
clean_install() {
    echo "🧹 Cleaning previous installation..."
    
    # Kill any running grok processes
    pkill -f grok 2>/dev/null || true
    
    # Remove existing installation
    npm uninstall -g grok-cli-hurry-mode 2>/dev/null || true
    
    # Force remove directories if they exist
    if command -v node >/dev/null 2>&1; then
        NODE_PATH=$(dirname $(dirname $(which node)))
        if [ -d "$NODE_PATH/lib/node_modules/grok-cli-hurry-mode" ]; then
            echo "🗑️ Removing stuck installation..."
            rm -rf "$NODE_PATH/lib/node_modules/grok-cli-hurry-mode" 2>/dev/null || true
            rm -rf "$NODE_PATH/lib/node_modules/.grok-cli-hurry-mode"* 2>/dev/null || true
            rm -f "$NODE_PATH/bin/grok" 2>/dev/null || true
        fi
    fi
    
    # Clear npm cache
    npm cache clean --force 2>/dev/null || true
}

# Function to try different installation methods
try_install() {
    echo "📦 Installing Grok CLI..."
    
    # Method 1: Standard install
    if npm install -g grok-cli-hurry-mode 2>/dev/null; then
        return 0
    fi
    
    echo "⚠️ Standard install failed, trying alternative methods..."
    
    # Method 2: Force install
    if npm install -g grok-cli-hurry-mode --force 2>/dev/null; then
        return 0
    fi
    
    # Method 3: With explicit registry
    if npm install -g grok-cli-hurry-mode --registry https://registry.npmjs.org/ 2>/dev/null; then
        return 0
    fi
    
    # Method 4: Try yarn if available
    if command -v yarn >/dev/null 2>&1; then
        echo "🧶 Trying with Yarn..."
        if yarn global add grok-cli-hurry-mode 2>/dev/null; then
            return 0
        fi
    fi
    
    # Method 5: Try pnpm if available
    if command -v pnpm >/dev/null 2>&1; then
        echo "📦 Trying with pnpm..."
        if pnpm add -g grok-cli-hurry-mode 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Main installation flow
main() {
    # Check if Node.js is installed
    if ! command -v node >/dev/null 2>&1; then
        echo "❌ Node.js is not installed. Please install Node.js first:"
        echo "   Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm >/dev/null 2>&1; then
        echo "❌ npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Clean any existing installation
    clean_install
    
    # Try installation
    if try_install; then
        echo "✅ Grok CLI installed successfully!"
        echo ""
        echo "🚀 Get started:"
        echo "   grok --help"
        echo ""
        echo "💡 Set your API key:"
        echo "   export GROK_API_KEY=your_api_key_here"
        echo ""
        
        # Verify installation
        if command -v grok >/dev/null 2>&1; then
            echo "📋 Installed version: $(grok --version 2>/dev/null || echo 'unknown')"
        fi
    else
        echo "❌ Installation failed with all methods."
        echo ""
        echo "🛠️ Manual installation options:"
        echo "1. Try downloading from: https://github.com/hinetapora/grok-cli-hurry-mode/releases"
        echo "2. Or install alternative package managers:"
        echo "   • Yarn: npm install -g yarn && yarn global add grok-cli-hurry-mode"
        echo "   • pnpm: npm install -g pnpm && pnpm add -g grok-cli-hurry-mode"
        echo ""
        echo "🐛 Report issues: https://github.com/hinetapora/grok-cli-hurry-mode/issues"
        exit 1
    fi
}

# Run main function
main "$@"