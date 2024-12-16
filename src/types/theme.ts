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
  rainbow1?: string;
  rainbow2?: string;
  rainbow3?: string;
  rainbow4?: string;
  rainbow5?: string;
  rainbow6?: string;
  rainbow7?: string;
  selected: string;
  'selected-hover': string;
  'border-active': string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemePreset = "system" | "light" | "dark" | "custom"; 