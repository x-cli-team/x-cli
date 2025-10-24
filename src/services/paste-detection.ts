/**
 * Paste Detection Service
 * 
 * Detects when large amounts of text are pasted into the input and provides
 * summarization functionality for cleaner UI display while preserving full
 * content for AI processing.
 */

export interface PasteEvent {
  content: string;
  lineCount: number;
  charCount: number;
  pasteNumber: number;
  summary: string;
}

export interface PasteThresholds {
  lineThreshold: number;
  charThreshold: number;
}

export class PasteDetectionService {
  private pasteCounter = 0;
  private thresholds: PasteThresholds;
  private debug = process.env.GROK_PASTE_DEBUG === 'true';

  constructor(thresholds?: Partial<PasteThresholds>) {
    this.thresholds = {
      lineThreshold: thresholds?.lineThreshold ?? this.getDefaultLineThreshold(),
      charThreshold: thresholds?.charThreshold ?? this.getDefaultCharThreshold(),
    };
  }

  /**
   * Detects if new content represents a paste operation that should be summarized
   */
  detectPaste(oldValue: string, newValue: string): PasteEvent | null {
    // Calculate what was added
    const added = this.getAddedContent(oldValue, newValue);
    
    if (this.debug) {
      console.log('🔍 Paste Detection Debug:', {
        addedLength: added?.length || 0,
        lineCount: added ? this.countLines(added) : 0,
        thresholds: this.thresholds,
        shouldSummarize: added ? this.shouldSummarize(added) : false
      });
    }
    
    if (!added || !this.shouldSummarize(added)) {
      return null;
    }

    // This looks like a paste that should be summarized
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
  shouldSummarize(content: string): boolean {
    const lineCount = this.countLines(content);
    return lineCount > this.thresholds.lineThreshold || 
           content.length > this.thresholds.charThreshold;
  }

  /**
   * Creates a paste summary in the format: [Pasted text #N +X lines]
   */
  createPasteSummary(content: string, pasteNumber: number): string {
    const lineCount = this.countLines(content);
    const pluralLines = lineCount === 1 ? 'line' : 'lines';
    return `[Pasted text #${pasteNumber} +${lineCount} ${pluralLines}]`;
  }

  /**
   * Resets the paste counter (useful for new sessions)
   */
  resetCounter(): void {
    this.pasteCounter = 0;
  }

  /**
   * Updates thresholds for paste detection
   */
  updateThresholds(thresholds: Partial<PasteThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds
    };
  }

  /**
   * Gets current paste counter value
   */
  getCurrentCounter(): number {
    return this.pasteCounter;
  }

  /**
   * Gets current thresholds
   */
  getThresholds(): PasteThresholds {
    return { ...this.thresholds };
  }

  /**
   * Extracts the content that was added between old and new values
   */
  private getAddedContent(oldValue: string, newValue: string): string {
    // Simple case: content was appended
    if (newValue.startsWith(oldValue)) {
      return newValue.slice(oldValue.length);
    }

    // More complex case: content was inserted somewhere
    // For now, we'll handle the simple append case which covers most paste scenarios
    // TODO: Handle insertion at cursor position for more complex scenarios
    return '';
  }

  /**
   * Counts the number of lines in content
   */
  private countLines(content: string): number {
    if (!content) return 0;
    return content.split('\n').length;
  }

  /**
   * Gets default line threshold from environment or config
   */
  private getDefaultLineThreshold(): number {
    const envValue = process.env.GROK_PASTE_LINE_THRESHOLD;
    if (envValue) {
      const parsed = parseInt(envValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 2; // Default: 2 lines (more sensitive like Claude Code)
  }

  /**
   * Gets default character threshold from environment or config
   */
  private getDefaultCharThreshold(): number {
    const envValue = process.env.GROK_PASTE_CHAR_THRESHOLD;
    if (envValue) {
      const parsed = parseInt(envValue, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 50; // Default: 50 characters (more sensitive like Claude Code)
  }
}

/**
 * Global paste detection service instance
 */
let globalPasteService: PasteDetectionService | null = null;

/**
 * Gets the global paste detection service instance
 */
export function getPasteDetectionService(): PasteDetectionService {
  if (!globalPasteService) {
    globalPasteService = new PasteDetectionService();
  }
  return globalPasteService;
}

/**
 * Resets the global paste detection service (useful for testing)
 */
export function resetPasteDetectionService(): void {
  globalPasteService = null;
}