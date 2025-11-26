import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  FolderOpen,
  Settings,
  Info,
  ChevronRight,
  Ruler,
} from "lucide-react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useStore } from "@/lib/store";

export default function HomeScreen() {
  const router = useRouter();
  const { savedJobs } = useStore();

  const menuItems = [
    {
      icon: <FolderOpen size={22} color="#C75B3B" />,
      label: "Saved Jobs",
      description: `${savedJobs.length} estimate${savedJobs.length !== 1 ? "s" : ""} saved`,
      route: "/jobs" as const,
    },
    {
      icon: <Settings size={22} color="#C75B3B" />,
      label: "Settings",
      description: "Company info & preferences",
      route: "/settings" as const,
    },
    {
      icon: <Info size={22} color="#C75B3B" />,
      label: "About",
      description: "App info & pricing",
      route: "/about" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ruler size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Brickie</Text>
          <Text style={styles.subtitle}>Quick estimates for bricklayers</Text>
        </View>

        {/* Main CTA */}
        <Card style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <Camera size={40} color="#C75B3B" />
            <View style={styles.ctaText}>
              <Text style={styles.ctaTitle}>New Estimate</Text>
              <Text style={styles.ctaDescription}>
                Snap a photo and get an AI-powered material & labour estimate in
                seconds
              </Text>
            </View>
          </View>
          <Button
            title="Start Estimate"
            onPress={() => router.push("/estimate")}
            fullWidth
            size="lg"
          />
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>{item.icon}</View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <ChevronRight size={20} color="#B8A393" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Estimates are for guidance only. Always verify on-site.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#C75B3B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C75B3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#544740",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#998272",
  },
  ctaCard: {
    padding: 24,
    marginBottom: 24,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  ctaText: {
    flex: 1,
    marginLeft: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#544740",
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: 14,
    color: "#998272",
    lineHeight: 20,
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F0EB",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FDF6F3",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#544740",
  },
  menuDescription: {
    fontSize: 13,
    color: "#998272",
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#B8A393",
    marginTop: 24,
  },
});
