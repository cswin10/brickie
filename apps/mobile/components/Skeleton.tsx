import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function EstimateLoadingSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={120} height={16} />
        <View style={styles.spacer} />
        <Skeleton width="100%" height={48} borderRadius={12} />
      </View>

      <View style={styles.section}>
        <Skeleton width={80} height={14} />
        <View style={styles.smallSpacer} />
        <Skeleton width="100%" height={36} />
      </View>

      <View style={styles.row}>
        <View style={styles.halfItem}>
          <Skeleton width={60} height={14} />
          <View style={styles.smallSpacer} />
          <Skeleton width="100%" height={32} />
        </View>
        <View style={styles.halfItem}>
          <Skeleton width={60} height={14} />
          <View style={styles.smallSpacer} />
          <Skeleton width="100%" height={32} />
        </View>
      </View>

      <View style={styles.section}>
        <Skeleton width={100} height={14} />
        <View style={styles.smallSpacer} />
        <Skeleton width="100%" height={80} borderRadius={12} />
      </View>

      <View style={styles.section}>
        <Skeleton width={90} height={14} />
        <View style={styles.smallSpacer} />
        <Skeleton width="100%" height={60} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E8DFD7",
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  halfItem: {
    flex: 1,
  },
  spacer: {
    height: 12,
  },
  smallSpacer: {
    height: 8,
  },
});
