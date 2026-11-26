import { useColorScheme } from 'react-native';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

const radius = { md: 10, lg: 12 } as const;

const typography = {
  title: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  body: { fontSize: 20, lineHeight: 28, fontWeight: '400' },
  bodyStrong: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  digit: { fontSize: 28, fontWeight: '600' },
  button: { fontSize: 20, fontWeight: '600' },
  secondary: { fontSize: 18, lineHeight: 24, fontWeight: '400' },
  secondaryStrong: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
} as const;

export interface ThemeColors {
  background: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  borderFocused: string;
  borderError: string;
  error: string;
  success: string;
  buttonBackground: string;
  buttonBackgroundDisabled: string;
  buttonText: string;
  buttonTextDisabled: string;
  link: string;
  linkDisabled: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    textPrimary: '#111111',
    textSecondary: '#3A3A3C',
    border: '#8E8E93',
    borderFocused: '#111111',
    borderError: '#D93025',
    error: '#D93025',
    success: '#1E8E3E',
    buttonBackground: '#111111',
    buttonBackgroundDisabled: '#606060',
    buttonText: '#FFFFFF',
    buttonTextDisabled: '#FFFFFF',
    link: '#111111',
    linkDisabled: '#6B6B70',
  },
  spacing,
  radius,
  typography,
};

export const darkTheme: Theme = {
  colors: {
    background: '#000000',
    textPrimary: '#FFFFFF',
    textSecondary: '#D1D1D6',
    border: '#636366',
    borderFocused: '#FFFFFF',
    borderError: '#FF6B61',
    error: '#FF6B61',
    success: '#5DD27A',
    buttonBackground: '#FFFFFF',
    buttonBackgroundDisabled: '#3A3A3C',
    buttonText: '#000000',
    buttonTextDisabled: '#8E8E93',
    link: '#FFFFFF',
    linkDisabled: '#8E8E93',
  },
  spacing,
  radius,
  typography,
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
