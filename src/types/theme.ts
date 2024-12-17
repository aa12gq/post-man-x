export interface ThemeColors {
  primary: string;
  "primary-light": string;
  "primary-dark": string;
  background: string;
  "background-light": string;
  "background-dark": string;
  "surface-1": string;
  "surface-2": string;
  "surface-3": string;
  "surface-4": string;
  text: string;
  "text-secondary": string;
  border: string;
  hover: string;
  header: string;
  shadow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  selected: string;
  "selected-hover": string;
  "border-active": string;
  rainbow1?: string;
  rainbow2?: string;
  rainbow3?: string;
  rainbow4?: string;
  rainbow5?: string;
  rainbow6?: string;
  rainbow7?: string;
}

export interface ThemeBackground {
  enabled: boolean;
  image: string;
  blendMode:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten";
  opacity: number;
  type: "image" | "gradient" | "pattern";
  gradient?: string;
  position?: string;
  repeat?: string;
  size?: string;
  pattern?: string;
}

export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeColors;
  backgroundImage?: ThemeBackground;
}

export type ThemePreset = "system" | "light" | "dark" | "custom";
