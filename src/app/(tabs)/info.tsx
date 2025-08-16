import ParallaxScrollView from '@/src/components/ParallaxScrollView';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { infoStyles as styles } from '@/src/styles/infoStyles';

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

