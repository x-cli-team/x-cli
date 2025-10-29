import { useEffect } from 'react';

export function useConsoleSetup(quiet = false): void {
  useEffect(() => {
    if (quiet) return;

    // Only clear console on non-Windows platforms or if not PowerShell
    // Windows PowerShell can have issues with console.clear() causing flickering
    const isWindows = process.platform === "win32";
    const isPowerShell =
      process.env.ComSpec?.toLowerCase().includes("powershell") ||
      process.env.PSModulePath !== undefined;

    if (!isWindows || !isPowerShell) {
      console.clear();
    }

    // Banner removed - no longer printing X-CLI logo/version

  }, [quiet]);
}