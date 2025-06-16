import { MAIN_COLORS } from 'twenty-ui/theme';

export type SignatureColor =
  | 'green'
  | 'turquoise'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'gray';

export const SignatureColorCode: Record<SignatureColor, string> = {
  green: MAIN_COLORS.green,
  turquoise: MAIN_COLORS.turquoise,
  sky: MAIN_COLORS.sky,
  blue: MAIN_COLORS.blue,
  purple: MAIN_COLORS.purple,
  pink: MAIN_COLORS.pink,
  red: MAIN_COLORS.red,
  orange: MAIN_COLORS.orange,
  yellow: MAIN_COLORS.yellow,
  gray: MAIN_COLORS.gray,
};

// Helper function to get a color for a signee index
export const getSignatureColor = (index: number): SignatureColor => {
  const colors = Object.keys(SignatureColorCode) as SignatureColor[];
  return colors[index % colors.length];
};
