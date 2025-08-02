import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function InfoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="info.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Información</ThemedText>
      </ThemedView>
      <ThemedView style={styles.constructionContainer}>
        <IconSymbol
          name="hammer.fill"
          size={80}
          color="#D4AF37"
          style={styles.constructionIcon}
        />
        <ThemedText type="subtitle" style={styles.constructionTitle}>
          En construcción
        </ThemedText>
        <ThemedText style={styles.constructionDescription}>
          Esta sección estará disponible próximamente.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  constructionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  constructionIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  constructionTitle: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  constructionDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
});