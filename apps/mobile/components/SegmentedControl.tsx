import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.segmentContainer}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#544740",
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F0EB",
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#998272",
    textAlign: "center",
  },
  segmentTextSelected: {
    color: "#C75B3B",
    fontWeight: "600",
  },
});
