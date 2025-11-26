import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  title,
  style,
  padding = "md",
}: CardProps) {
  return (
    <View style={[styles.card, styles[`padding_${padding}`], style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: 12,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#544740",
    marginBottom: 12,
  },
});
