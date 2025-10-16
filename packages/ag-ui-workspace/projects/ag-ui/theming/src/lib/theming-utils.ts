/**
 * AG-UI Theming Utilities
 * Provides utility functions for managing CSS custom properties and theme switching
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface CustomTheme {
  name: string;
  colors: Partial<ThemeColors>;
  variables?: Record<string, string>;
}

/**
 * Sets CSS custom properties on the root element
 */
export function setThemeVariables(variables: Record<string, string>): void {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--ag-ui-${key}`, value);
  });
}

/**
 * Applies a predefined theme by setting CSS variables
 */
export function applyTheme(theme: CustomTheme): void {
  const variables: Record<string, string> = {};
  
  // Map theme colors to CSS variable names
  Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
    const cssVarName = `${colorName}-color`;
    variables[cssVarName] = colorValue;
  });
  
  // Add any additional custom variables
  if (theme.variables) {
    Object.assign(variables, theme.variables);
  }
  
  setThemeVariables(variables);
}

/**
 * Gets the current value of a CSS custom property
 */
export function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--ag-ui-${name}`)
    .trim();
}

/**
 * Toggles between light and dark themes
 */
export function toggleDarkMode(isDark: boolean): void {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Checks if dark mode is currently active
 */
export function isDarkModeActive(): boolean {
  return document.documentElement.hasAttribute('data-theme');
}

/**
 * Predefined themes
 */
export const PREDEFINED_THEMES: Record<string, CustomTheme> = {
  default: {
    name: 'Default',
    colors: {
      primary: '#1890ff',
      secondary: '#722ed1',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    }
  },
  
  purple: {
    name: 'Purple',
    colors: {
      primary: '#722ed1',
      secondary: '#eb2f96',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    }
  },
  
  green: {
    name: 'Green',
    colors: {
      primary: '#52c41a',
      secondary: '#13c2c2',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    }
  },
  
  orange: {
    name: 'Orange',
    colors: {
      primary: '#fa8c16',
      secondary: '#faad14',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f'
    }
  }
};

/**
 * Service class for managing themes in Angular applications
 */
export class AgUiThemeService {
  private currentTheme: string = 'default';
  private isDarkMode: boolean = false;
  
  /**
   * Applies a theme by name
   */
  applyTheme(themeName: string): void {
    const theme = PREDEFINED_THEMES[themeName];
    if (theme) {
      applyTheme(theme);
      this.currentTheme = themeName;
    }
  }
  
  /**
   * Gets the current theme name
   */
  getCurrentTheme(): string {
    return this.currentTheme;
  }
  
  /**
   * Toggles dark mode
   */
  toggleDarkMode(isDark?: boolean): void {
    this.isDarkMode = isDark !== undefined ? isDark : !this.isDarkMode;
    toggleDarkMode(this.isDarkMode);
  }
  
  /**
   * Gets the current dark mode state
   */
  getDarkMode(): boolean {
    return this.isDarkMode;
  }
  
  /**
   * Applies custom variables
   */
  applyCustomVariables(variables: Record<string, string>): void {
    setThemeVariables(variables);
  }
}