export interface ThemeColors {
  primary: string;
  'primary-light': string;
  'primary-dark': string;
  background: string;
  'background-light': string;
  'background-dark': string;
  text: string;
  'text-secondary': string;
  border: string;
  hover: string;
  header: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemePreset = 'light' | 'dark' | 'custom'; 