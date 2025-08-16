import React, { ReactNode, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSLATE_X_THRESHOLD = -SCREEN_WIDTH * 0.3;

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  resetSwipe?: boolean;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete, resetSwipe }) => {
  const translateX = useSharedValue(0);

  // Efecto para resetear la posición cuando se cancela la eliminación
  useEffect(() => {
    if (resetSwipe) {
      translateX.value = withTiming(0, { duration: 200 });
    }
  }, [resetSwipe, translateX]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Reset position on start
    })
    .onUpdate((event) => {
      // Only allow swiping to the left (negative values)
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const shouldDelete = translateX.value < TRANSLATE_X_THRESHOLD;
      
      if (shouldDelete) {
        // Animate to full left and then trigger delete - faster animation
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 150 }, () => {
          runOnJS(onDelete)();
        });
      } else {
        // Snap back to original position - faster spring
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  const rDeleteContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [TRANSLATE_X_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [TRANSLATE_X_THRESHOLD, 0],
      [1, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Delete background */}
      <Animated.View style={[styles.deleteContainer, rDeleteContainerStyle]}>
        <Text style={styles.deleteText}>Eliminar</Text>
      </Animated.View>

      {/* Main content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.itemContainer, rStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 12,
    marginBottom: 0,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContainer: {
    backgroundColor: 'transparent',
  },
});