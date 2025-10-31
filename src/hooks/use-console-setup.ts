import pkg from '../../package.json' with { type: 'json' };

export function printWelcomeBanner(_quiet = false): void {
  if (_quiet) return;

  const isTTY = !!process.stdout.isTTY;

  // Full reset: move home, clear display, clear scrollback, hide cursor while drawing
  // Order matters: go Home, then clear display, then clear scrollback.
  // (Some terminals ignore clear-until-top unless cursor is at 1;1)
  if (isTTY) {
    process.stdout.write('\x1b[?25l');  // hide cursor
    process.stdout.write('\x1b[H');     // cursor to 1;1
    process.stdout.write('\x1b[2J');    // clear entire screen
    process.stdout.write('\x1b[3J');    // clear scrollback buffer
    process.stdout.write('\x1b[H');     // ensure at 1;1 after clearing
  } else {
    // If not a TTY (e.g., redirected to file), skip terminal control codes
    // so logs remain readable.
  }

  // Detect terminal preference; default fancy unless explicitly disabled
  const isFancy = process.env.X_CLI_ASCII !== 'block';

  // NOTE: No leading newline(s) — that's what caused the "starts at line 3" look.
  const fancyAscii = String.raw`__/\\\_______/\\\______________________/\\\\\\\\\__/\\\______________/\\\\\\\\\\\_        
 _\///\\\___/\\\/____________________/\\\////////__\/\\\_____________\/////\\\///__       
  ___\///\\\\\\/____________________/\\\/___________\/\\\_________________\/\\\_____      
   _____\//\\\\_______/\\\\\\\\\\\__/\\\_____________\/\\\_________________\/\\\_____     
    ______\/\\\\______\///////////__\/\\\_____________\/\\\_________________\/\\\_____    
     ______/\\\\\\___________________\//\\\____________\/\\\_________________\/\\\_____   
      ____/\\\////\\\__________________\///\\\__________\/\\\_________________\/\\\_____  
       __/\\\/___\///\\\__________________\////\\\\\\\\\_\/\\\\\\\\\\\\\\\__/\\\\\\\\\\\_ 
        _\///_______\///______________________\/////////__\///////////////__\///////////__`;

  // Keep block art short and ANSI-wrapped; again, no leading newline.
  const blockAscii = String.raw`\x1b[34m  ████      ████████ ████      ████
  ████████  ██████████████  ████████
 ██████████  ██████████████  ████████
 ██████████  ██████████████  ████████
  ████████  ██████████████  ████████
   ████      ████████ ████      ████\x1b[0m`;

  const asciiArt = (isFancy ? fancyAscii : blockAscii).normalize('NFC');

  // Write banner (no implicit extra newline before). Add a single newline after.
  process.stdout.write(asciiArt + '\n');

  const welcomeBanner = [
    '',
    `\x1b[32m  Welcome to X-CLI v${pkg.version} ⚡\x1b[0m`,
    '',
    `\x1b[36m  🚀 Claude Code-level intelligence in your terminal!\x1b[0m`,
    '',
    `\x1b[33m  ✔ Ready. Type your first command or paste code to begin.\x1b[0m`,
    '',
    `\x1b[35m  💡 Quick Start Tips:\x1b[0m`,
    '',
    `  • Ask anything: "Create a React component" or "Debug this Python script"`,
    `  • Edit files: "Add error handling to app.js"`,
    `  • Run commands: "Set up a new Node.js project"`,
    `  • Get help: Type "/help" for all commands`,
    '',
    `\x1b[35m  🛠️  Power Features:\x1b[0m`,
    '',
    `  • Auto-edit mode: Press Shift+Tab to toggle hands-free editing`,
    `  • Project memory: Create .xcli/GROK.md to customize behavior`,
    `  • Documentation: Run "/init-agent" for .agent docs system`,
    `  • Error recovery: Run "/heal" after errors to add guardrails`,
    '',
    `\x1b[37m  Type your request in natural language. Ctrl+C to clear, 'exit' to quit.\x1b[0m`,
    '',
  ].join('\n');

  process.stdout.write(welcomeBanner);

  // Show cursor again
  if (isTTY) process.stdout.write('\x1b[?25h');
}

export function useConsoleSetup(_quiet = false): void {
  // Banner printing is now handled before React render in index.ts
  // This hook is kept for potential future use or to maintain API compatibility
}