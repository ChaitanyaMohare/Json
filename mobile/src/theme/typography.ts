import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  bodyRegular: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  micro: {
    fontSize: 10,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
};
