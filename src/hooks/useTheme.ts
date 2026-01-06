import {useColorScheme} from 'react-native';
import {lightTheme, darkTheme, Theme} from '../theme';

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
