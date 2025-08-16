import { StyleSheet } from "react-native";

export const infoStyles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  constructionContainer: {
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
  },
  constructionDescription: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
});
