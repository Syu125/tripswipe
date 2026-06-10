import { Appearance } from 'react-native';

export const EMOJIS = ['📍','🍜','🏛️','🏞️','☕','🎵','🛍️','🎨','🍻','🌊','🚂','🏔️','🌆','🍕','🎭','🌸'];

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const font = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
};

const light = {
  bg: '#FFFFFF',
  bgSecondary: '#F5F4F0',
  bgTertiary: '#EEECE8',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#A0A0A0',
  border: 'rgba(0,0,0,0.12)',
  borderStrong: 'rgba(0,0,0,0.22)',
  success: '#0F6E56',
  successBg: '#E1F5EE',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
  info: '#185FA5',
  infoBg: '#E6F1FB',
  accent: '#534AB7',
  accentBg: '#EEEDFE',
};

const dark = {
  bg: '#1C1C1E',
  bgSecondary: '#2C2C2E',
  bgTertiary: '#3A3A3C',
  text: '#F2F2F7',
  textSecondary: '#AEAEB2',
  textTertiary: '#636366',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.22)',
  success: '#5DCAA5',
  successBg: '#085041',
  danger: '#F09595',
  dangerBg: '#501313',
  info: '#85B7EB',
  infoBg: '#042C53',
  accent: '#AFA9EC',
  accentBg: '#26215C',
};

export function getColors(scheme?: 'light' | 'dark' | null) {
  return scheme === 'dark' ? dark : light;
}
