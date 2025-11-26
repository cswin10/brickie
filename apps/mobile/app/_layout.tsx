import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useStore } from "@/lib/store";

export default function RootLayout() {
  const { loadJobs, loadSettings, loadApiKey } = useStore();

  useEffect(() => {
    // Load persisted data on app start
    loadJobs();
    loadSettings();
    loadApiKey();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#F5F0EB",
          },
          headerTintColor: "#544740",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#FDFCFB",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Brickie",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="estimate/index"
          options={{
            title: "New Estimate",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="result/index"
          options={{
            title: "Estimate Results",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="jobs/index"
          options={{
            title: "Saved Jobs",
          }}
        />
        <Stack.Screen
          name="jobs/[id]"
          options={{
            title: "Job Details",
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            title: "Settings",
          }}
        />
        <Stack.Screen
          name="about/index"
          options={{
            title: "About",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
  },
});
