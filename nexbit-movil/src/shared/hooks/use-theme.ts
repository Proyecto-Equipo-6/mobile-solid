import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
