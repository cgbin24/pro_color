export type ThemeName = 'theme-white' | 'theme-green' | 'theme-yellow' | 'theme-night' | string;

export interface CustomTheme {
  bgColor: string;
  textColor: string;
  linkColor?: string;
  borderColor?: string;
}

export interface ThemeConfig {
  version: string;
  themes: Record<string, ThemeName>;
  customThemes: Record<string, CustomTheme>;
  floatingButtonPosition?: {
    edge: 'left' | 'right';
    y: number;
  };
}

export interface ThemeOption {
  id: string;
  name: string;
  colorClass: string;
}

export const DEFAULT_THEMES: ThemeOption[] = [
  { id: 'theme-white', name: '白色主题', colorClass: 'theme-white-color' },
  { id: 'theme-green', name: '护眼绿色', colorClass: 'theme-green-color' },
  { id: 'theme-yellow', name: '黄色类纸', colorClass: 'theme-yellow-color' },
  { id: 'theme-night', name: '夜间深色', colorClass: 'theme-night-color' },
];

export const DEFAULT_CONFIG: ThemeConfig = {
  version: '1.0.0',
  themes: {},
  customThemes: {},
  floatingButtonPosition: {
    edge: 'right',
    y: 50
  }
};
