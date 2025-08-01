import { useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  const route = useRoute();
  
  // Lista de rutas que están fuera del tab navigator
  const nonTabRoutes = ['mis-llaves-details'];
  
  // Si estamos en una ruta que no es de tabs, retorna 0
  if (nonTabRoutes.includes(route.name)) {
    return 0;
  }
  
  // Para rutas de tabs en iOS, usamos la altura estándar del tab bar
  // Esto evita el problema del hook que no puede encontrar el contexto
  return 83; // Altura estándar del tab bar en iOS
}
