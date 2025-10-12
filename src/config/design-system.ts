// Comprehensive Design System for Explore Sensei
// Multiple themes, custom wallpapers, and church-specific styling

export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  borderRadius: BorderRadius;
  animations: Animations;
}

export interface ThemeColors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  background: BackgroundColors;
  surface: SurfaceColors;
  text: TextColors;
  border: BorderColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface BackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
}

export interface SurfaceColors {
  primary: string;
  secondary: string;
  tertiary: string;
  elevated: string;
  overlay: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
  disabled: string;
  placeholder: string;
}

export interface BorderColors {
  primary: string;
  secondary: string;
  tertiary: string;
  focus: string;
  error: string;
}

export interface Typography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    display: string[];
  };
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
}

export interface FontSize {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeight {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeight {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface Spacing {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface Shadows {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Animations {
  duration: AnimationDuration;
  easing: AnimationEasing;
  keyframes: Keyframes;
}

export interface AnimationDuration {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

export interface AnimationEasing {
  linear: string;
  in: string;
  out: string;
  'in-out': string;
}

export interface Keyframes {
  spin: string;
  ping: string;
  pulse: string;
  bounce: string;
  fadeIn: string;
  fadeOut: string;
  slideIn: string;
  slideOut: string;
  scaleIn: string;
  scaleOut: string;
}

// Light Theme
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean and bright theme for daytime use',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      inverse: '#0f172a',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
      disabled: '#94a3b8',
      placeholder: '#94a3b8',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      focus: '#3b82f6',
      error: '#ef4444',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  animations: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    keyframes: {
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      fadeIn: 'fadeIn 0.5s ease-in-out',
      fadeOut: 'fadeOut 0.5s ease-in-out',
      slideIn: 'slideIn 0.3s ease-out',
      slideOut: 'slideOut 0.3s ease-in',
      scaleIn: 'scaleIn 0.2s ease-out',
      scaleOut: 'scaleOut 0.2s ease-in',
    },
  },
};

// Dark Theme
export const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  displayName: 'Dark',
  description: 'Dark theme for low-light environments',
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      inverse: '#ffffff',
    },
    surface: {
      primary: '#1e293b',
      secondary: '#334155',
      tertiary: '#475569',
      elevated: '#334155',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a',
      disabled: '#64748b',
      placeholder: '#64748b',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      tertiary: '#64748b',
      focus: '#3b82f6',
      error: '#ef4444',
    },
  },
};

// Division Theme (existing)
export const divisionTheme: Theme = {
  ...lightTheme,
  name: 'division',
  displayName: 'Division',
  description: 'Military-inspired theme with tactical colors',
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
  },
};

// Animus Theme (existing)
export const animusTheme: Theme = {
  ...lightTheme,
  name: 'animus',
  displayName: 'Animus',
  description: 'Futuristic theme with neon accents',
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    accent: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006',
    },
  },
};

// High Contrast Theme
export const highContrastTheme: Theme = {
  ...lightTheme,
  name: 'high-contrast',
  displayName: 'High Contrast',
  description: 'High contrast theme for accessibility',
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      inverse: '#000000',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000',
      inverse: '#ffffff',
      disabled: '#666666',
      placeholder: '#666666',
    },
    border: {
      primary: '#000000',
      secondary: '#000000',
      tertiary: '#000000',
      focus: '#0000ff',
      error: '#ff0000',
    },
  },
};

// Church Classic Theme
export const churchClassicTheme: Theme = {
  ...lightTheme,
  name: 'church-classic',
  displayName: 'Church Classic',
  description: 'Traditional theme with warm, welcoming colors',
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#fef7ed',
      100: '#fdedd3',
      200: '#fbd9a5',
      300: '#f8c06d',
      400: '#f5a532',
      500: '#f28b0c',
      600: '#e37307',
      700: '#bc5a0a',
      800: '#97480e',
      900: '#7c3d0f',
      950: '#421e06',
    },
  },
};

// Theme registry
export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  division: divisionTheme,
  animus: animusTheme,
  'high-contrast': highContrastTheme,
  'church-classic': churchClassicTheme,
};

// Theme utilities
export const getTheme = (themeName: string): Theme => {
  return themes[themeName] || lightTheme;
};

export const getAvailableThemes = (): Theme[] => {
  return Object.values(themes);
};

export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};

// Wallpaper system
export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: WallpaperCategory;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
}

export type WallpaperCategory = 'nature' | 'abstract' | 'church' | 'construction' | 'custom';

export const defaultWallpapers: Wallpaper[] = [
  {
    id: 'default-1',
    name: 'Default Gradient',
    url: '/wallpapers/default-gradient.jpg',
    thumbnail: '/wallpapers/thumbnails/default-gradient.jpg',
    category: 'abstract',
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'church-1',
    name: 'Church Parking Lot',
    url: '/wallpapers/church-parking.jpg',
    thumbnail: '/wallpapers/thumbnails/church-parking.jpg',
    category: 'church',
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'construction-1',
    name: 'Asphalt Work',
    url: '/wallpapers/asphalt-work.jpg',
    thumbnail: '/wallpapers/thumbnails/asphalt-work.jpg',
    category: 'construction',
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
];

// Design system configuration
export interface DesignSystemConfig {
  currentTheme: string;
  customWallpaper?: string;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  reducedMotion: boolean;
  highContrast: boolean;
  churchMode: boolean;
}

export const defaultDesignSystemConfig: DesignSystemConfig = {
  currentTheme: 'light',
  fontSize: 'base',
  reducedMotion: false,
  highContrast: false,
  churchMode: false,
};

// CSS custom properties generator
export const generateCSSVariables = (theme: Theme): string => {
  const variables: string[] = [];
  
  // Primary colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    variables.push(`--color-primary-${key}: ${value};`);
  });
  
  // Secondary colors
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    variables.push(`--color-secondary-${key}: ${value};`);
  });
  
  // Background colors
  Object.entries(theme.colors.background).forEach(([key, value]) => {
    variables.push(`--color-background-${key}: ${value};`);
  });
  
  // Text colors
  Object.entries(theme.colors.text).forEach(([key, value]) => {
    variables.push(`--color-text-${key}: ${value};`);
  });
  
  // Border colors
  Object.entries(theme.colors.border).forEach(([key, value]) => {
    variables.push(`--color-border-${key}: ${value};`);
  });
  
  // Typography
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables.push(`--font-size-${key}: ${value};`);
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables.push(`--spacing-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    variables.push(`--shadow-${key}: ${value};`);
  });
  
  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables.push(`--border-radius-${key}: ${value};`);
  });
  
  return variables.join('\n');
};
