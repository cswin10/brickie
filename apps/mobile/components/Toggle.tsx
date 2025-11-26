import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export function Toggle({ label, value, onChange, description }: ToggleProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={[styles.track, value && styles.trackActive]}>
        <View style={[styles.thumb, value && styles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#544740",
  },
  description: {
    fontSize: 13,
    color: "#998272",
    marginTop: 2,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8DFD7",
    padding: 2,
    justifyContent: "center",
  },
  trackActive: {
    backgroundColor: "#C75B3B",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbActive: {
    transform: [{ translateX: 22 }],
  },
});
