/**
 * Centralized color palette for consistent UI styling
 * Based on Claude Code's design principles and terminal compatibility
 */

export const colors = {
  // Primary colors
  primary: '#0066CC',       // Claude blue
  accent: '#8B5CF6',        // Purple for special states
  
  // Status colors
  success: '#00A86B',       // Green - successful operations
  warning: '#FF8C00',       // Orange - warnings and processing
  error: '#FF4444',         // Red - errors and failures
  info: '#0066CC',          // Blue - informational content
  
  // UI colors
  muted: '#6B7280',         // Gray - secondary text
  text: '#FFFFFF',          // White - primary text
  background: '#000000',    // Black - background
  
  // Spinner and progress colors
  search: '#0066CC',        // Blue - searching/indexing operations
  process: '#FF8C00',       // Orange - processing/thinking
  write: '#00A86B',         // Green - writing/editing operations
  compact: '#8B5CF6',       // Purple - compacting/optimizing
  
  // Context awareness colors
  workspace: '#FFFF00',     // Yellow - workspace/file operations
  memory: '#8B5CF6',        // Magenta - memory/session operations
  index: '#00A86B',         // Green - indexing status
  session: '#FF8C00',       // Orange - session status
};

/**
 * Ink color names mapped to our palette
 * Use these with Ink's Text color prop
 */
export const inkColors = {
  primary: 'cyan',
  success: 'green', 
  warning: 'yellow',
  error: 'red',
  info: 'blue',
  muted: 'gray',
  accent: 'magenta',
  text: 'black',
  
  // Bright variants
  primaryBright: 'cyanBright',
  successBright: 'greenBright',
  warningBright: 'yellowBright',
  errorBright: 'redBright',
  infoBright: 'blueBright',
  accentBright: 'magentaBright',
} as const;

/**
 * Get appropriate color for spinner states
 */
export function getSpinnerColor(operation: string): keyof typeof inkColors {
  switch (operation.toLowerCase()) {
    case 'search':
    case 'indexing':
    case 'scanning':
      return 'info';
      
    case 'process':
    case 'thinking':
    case 'analyzing':
      return 'warning';
      
    case 'write':
    case 'edit':
    case 'create':
      return 'success';
      
    case 'compact':
    case 'optimize':
    case 'memory':
      return 'accent';
      
    default:
      return 'primary';
  }
}

/**
 * Context status colors for the startup banner
 */
export const contextColors = {
  dynamic: 'primary',
  onDemand: 'warning',
  indexed: 'success',
  notIndexed: 'muted',
  restored: 'accent',
  fresh: 'info',
} as const;