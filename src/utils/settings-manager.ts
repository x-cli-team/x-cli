import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * User-level settings stored in ~/.xcli/config.json (or ~/.grok/user-settings.json for backwards compatibility)
 * These are global settings that apply across all projects
 */
export interface UserSettings {
  apiKey?: string; // X API key
  baseURL?: string; // API base URL
  defaultModel?: string; // User's preferred default model
  models?: string[]; // Available models list
  autoCompact?: boolean; // Enable automatic compact mode for long conversations
  compactThreshold?: {
    lines?: number; // Auto-compact when session exceeds this many lines (default: 800)
    bytes?: number; // Auto-compact when session exceeds this many bytes (default: 200000)
  };
  verbosityLevel?: 'quiet' | 'normal' | 'verbose'; // Output verbosity level
  explainLevel?: 'off' | 'brief' | 'detailed'; // Explanation detail level
  interactivityLevel?: 'chat' | 'balanced' | 'repl'; // Interaction mode
  assistantName?: string; // Custom name for the AI assistant
  requireConfirmation?: boolean; // Require user confirmation for file operations and commands
  operatorName?: string; // User's name for personalization
  agentName?: string; // Name for the AI assistant
}

/**
 * Project-level settings stored in .xcli/settings.json (or .grok/settings.json for backwards compatibility)
 * These are project-specific settings
 */
export interface ProjectSettings {
  model?: string; // Current model for this project
  mcpServers?: Record<string, any>; // MCP server configurations
}

/**
 * Default values for user settings
 */
const DEFAULT_USER_SETTINGS: Partial<UserSettings> = {
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
  verbosityLevel: 'quiet',
  explainLevel: 'brief',
  requireConfirmation: true,
};

/**
 * Default values for project settings
 */
const DEFAULT_PROJECT_SETTINGS: Partial<ProjectSettings> = {
  model: "grok-4-fast-non-reasoning",
};

/**
 * Unified settings manager that handles both user-level and project-level settings
 */
export class SettingsManager {
  private static instance: SettingsManager;

  private userSettingsPath: string;
  private projectSettingsPath: string;

  private constructor() {
    // User settings path: try ~/.xcli first, fallback to ~/.grok for backwards compatibility
    const newUserDir = path.join(os.homedir(), ".xcli");
    const oldUserDir = path.join(os.homedir(), ".grok");

    if (fs.existsSync(newUserDir) || !fs.existsSync(oldUserDir)) {
      this.userSettingsPath = path.join(newUserDir, "config.json");
    } else {
      this.userSettingsPath = path.join(oldUserDir, "user-settings.json");
    }

    // Project settings path: try .xcli first, fallback to .grok for backwards compatibility
    const newProjectDir = path.join(process.cwd(), ".xcli");
    const oldProjectDir = path.join(process.cwd(), ".grok");

    if (fs.existsSync(newProjectDir) || !fs.existsSync(oldProjectDir)) {
      this.projectSettingsPath = path.join(newProjectDir, "settings.json");
    } else {
      this.projectSettingsPath = path.join(oldProjectDir, "settings.json");
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Ensure directory exists for a given file path
   */
  private ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Load user settings from ~/.xcli/config.json or ~/.grok/user-settings.json
   */
  public loadUserSettings(): UserSettings {
    try {
      if (!fs.existsSync(this.userSettingsPath)) {
        // Create default user settings if file doesn't exist
        this.saveUserSettings(DEFAULT_USER_SETTINGS);
        return { ...DEFAULT_USER_SETTINGS };
      }

      const content = fs.readFileSync(this.userSettingsPath, "utf-8");
      const settings = JSON.parse(content);

      // Merge with defaults to ensure all required fields exist
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
  public saveUserSettings(settings: Partial<UserSettings>): void {
    try {
      this.ensureDirectoryExists(this.userSettingsPath);

      // Read existing settings directly to avoid recursion
      let existingSettings: UserSettings = { ...DEFAULT_USER_SETTINGS };
      if (fs.existsSync(this.userSettingsPath)) {
        try {
          const content = fs.readFileSync(this.userSettingsPath, "utf-8");
          const parsed = JSON.parse(content);
          existingSettings = { ...DEFAULT_USER_SETTINGS, ...parsed };
        } catch (_error) {
          // If file is corrupted, use defaults
          console.warn("Corrupted user settings file, using defaults");
        }
      }

      const mergedSettings = { ...existingSettings, ...settings };

      fs.writeFileSync(
        this.userSettingsPath,
        JSON.stringify(mergedSettings, null, 2),
        { mode: 0o600 } // Secure permissions for API key
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
  public updateUserSetting<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ): void {
    const settings = { [key]: value } as Partial<UserSettings>;
    this.saveUserSettings(settings);
  }

  /**
   * Get a specific user setting
   */
  public getUserSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    const settings = this.loadUserSettings();
    return settings[key];
  }

  /**
   * Load project settings from .x/settings.json
   */
  public loadProjectSettings(): ProjectSettings {
    try {
      if (!fs.existsSync(this.projectSettingsPath)) {
        // Create default project settings if file doesn't exist
        this.saveProjectSettings(DEFAULT_PROJECT_SETTINGS);
        return { ...DEFAULT_PROJECT_SETTINGS };
      }

      const content = fs.readFileSync(this.projectSettingsPath, "utf-8");
      const settings = JSON.parse(content);

      // Merge with defaults
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
  public saveProjectSettings(settings: Partial<ProjectSettings>): void {
    try {
      this.ensureDirectoryExists(this.projectSettingsPath);

      // Read existing settings directly to avoid recursion
      let existingSettings: ProjectSettings = { ...DEFAULT_PROJECT_SETTINGS };
      if (fs.existsSync(this.projectSettingsPath)) {
        try {
          const content = fs.readFileSync(this.projectSettingsPath, "utf-8");
          const parsed = JSON.parse(content);
          existingSettings = { ...DEFAULT_PROJECT_SETTINGS, ...parsed };
        } catch (_error) {
          // If file is corrupted, use defaults
          console.warn("Corrupted project settings file, using defaults");
        }
      }

      const mergedSettings = { ...existingSettings, ...settings };

      fs.writeFileSync(
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
  public updateProjectSetting<K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K]
  ): void {
    const settings = { [key]: value } as Partial<ProjectSettings>;
    this.saveProjectSettings(settings);
  }

  /**
   * Get a specific project setting
   */
  public getProjectSetting<K extends keyof ProjectSettings>(
    key: K
  ): ProjectSettings[K] {
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
  public getCurrentModel(): string {
    // First check environment variable for default model
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
  public pickModel(options: { deep?: boolean; retries?: number; ctxTokens?: number } = {}): string {
    const { deep = false, retries = 0, ctxTokens = 0 } = options;

    // Use reasoning model for:
    // - Deep tasks requiring complex reasoning
    // - Tasks that have been retried (indicating complexity)
    // - Tasks with very large context (>150K tokens)
    if (deep || retries > 0 || ctxTokens > 150_000) {
      // First check for reasoning model environment variable
      const reasoningModel = process.env.XCLI_MODEL_REASONING;
      if (reasoningModel) {
        return reasoningModel;
      }

      // Default to grok-4-fast-reasoning for complex tasks
      return "grok-4-fast-reasoning";
    }

    // Use default model for standard tasks
    return this.getCurrentModel();
  }

  /**
   * Set the current model for the project
   */
  public setCurrentModel(model: string): void {
    this.updateProjectSetting("model", model);
  }

  /**
   * Get available models list from user settings
   */
  public getAvailableModels(): string[] {
    const models = this.getUserSetting("models");
    return models || DEFAULT_USER_SETTINGS.models || [];
  }

  /**
   * Get API key from user settings or environment
   */
  public getApiKey(): string | undefined {
    // First check environment variable
    const envApiKey = process.env.X_API_KEY || process.env.GROK_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }

    // Then check user settings
    return this.getUserSetting("apiKey");
  }

  /**
   * Get base URL from user settings or environment
   */
  public getBaseURL(): string {
    // First check environment variable
    const envBaseURL = process.env.GROK_BASE_URL;
    if (envBaseURL) {
      return envBaseURL;
    }

    // Then check user settings
    const userBaseURL = this.getUserSetting("baseURL");
    return (
      userBaseURL || DEFAULT_USER_SETTINGS.baseURL || "https://api.x.ai/v1"
    );
  }
}

/**
 * Convenience function to get the singleton instance
 */
export function getSettingsManager(): SettingsManager {
  return SettingsManager.getInstance();
}
