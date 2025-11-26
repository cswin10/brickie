import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ResultBlockProps {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export function ResultBlock({
  label,
  value,
  highlight = false,
  icon,
}: ResultBlockProps) {
  return (
    <View style={[styles.container, highlight && styles.highlighted]}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[styles.label, highlight && styles.labelHighlight]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

interface ResultListProps {
  title: string;
  items: string[];
  type?: "info" | "warning";
}

export function ResultList({ title, items, type = "info" }: ResultListProps) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <View
            style={[
              styles.bullet,
              type === "warning" && styles.bulletWarning,
            ]}
          />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F6F3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highlighted: {
    backgroundColor: "#C75B3B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#998272",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  labelHighlight: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#544740",
  },
  valueHighlight: {
    color: "#FFFFFF",
    fontSize: 28,
  },
  listContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#544740",
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C75B3B",
    marginTop: 6,
    marginRight: 10,
  },
  bulletWarning: {
    backgroundColor: "#F59E0B",
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#655549",
    lineHeight: 20,
  },
});
