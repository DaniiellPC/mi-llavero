import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/src/hooks/useColorScheme';

export function useBottomTabOverflow() {
  const { bottom } = useSafeAreaInsets();
  return bottom;
}

function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and creates an ultra-thin material effect with vibrancy.
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={100}
      style={[StyleSheet.absoluteFill, { paddingBottom: bottom }]}
    />
  );
}

export default BlurTabBarBackground;