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

  return (
    <BlurView
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default BlurTabBarBackground;