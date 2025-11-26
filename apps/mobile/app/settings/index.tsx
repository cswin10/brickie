import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Save, Eye, EyeOff, Trash2 } from "lucide-react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { useStore } from "@/lib/store";
import { clearAllJobs } from "@/lib/storage";

export default function SettingsScreen() {
  const {
    settings,
    apiKey,
    updateSettings,
    setApiKey,
    loadSettings,
    loadApiKey,
    loadJobs,
    savedJobs,
  } = useStore();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [dayRate, setDayRate] = useState(settings.defaultDayRate.toString());
  const [disclaimer, setDisclaimer] = useState(settings.disclaimerText);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadApiKey();
  }, []);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setDayRate(settings.defaultDayRate.toString());
    setDisclaimer(settings.disclaimerText);
  }, [settings]);

  useEffect(() => {
    setApiKeyInput(apiKey);
  }, [apiKey]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const parsedDayRate = parseFloat(dayRate) || 220;

      await updateSettings({
        companyName: companyName.trim(),
        defaultDayRate: parsedDayRate,
        disclaimerText: disclaimer.trim(),
      });

      await setApiKey(apiKeyInput.trim());

      Alert.alert("Saved", "Settings have been updated.");
    } catch (err) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearJobs = () => {
    Alert.alert(
      "Clear All Jobs",
      `Are you sure you want to delete all ${savedJobs.length} saved jobs? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await clearAllJobs();
            await loadJobs();
            Alert.alert("Cleared", "All saved jobs have been deleted.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* API Key */}
        <Card title="OpenAI API Key" style={styles.section}>
          <Text style={styles.hint}>
            Required for AI-powered estimates. Get your key from{" "}
            <Text style={styles.link}>platform.openai.com</Text>
          </Text>
          <View style={styles.apiKeyContainer}>
            <Input
              placeholder="sk-..."
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.apiKeyInput}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff size={20} color="#998272" />
              ) : (
                <Eye size={20} color="#998272" />
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Company Info */}
        <Card title="Company Info" style={styles.section}>
          <Input
            label="Company Name"
            placeholder="Your Company Ltd"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <Input
            label="Default Day Rate"
            placeholder="220"
            keyboardType="decimal-pad"
            value={dayRate}
            onChangeText={setDayRate}
            suffix="GBP/day"
          />
        </Card>

        {/* Disclaimer */}
        <Card title="PDF Disclaimer" style={styles.section}>
          <Input
            placeholder="Enter disclaimer text for PDFs..."
            value={disclaimer}
            onChangeText={setDisclaimer}
            multiline
            numberOfLines={4}
            containerStyle={styles.disclaimerInput}
          />
        </Card>

        {/* Save Button */}
        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={isSaving}
          icon={<Save size={18} color="#FFFFFF" />}
          fullWidth
          size="lg"
        />

        {/* Data Management */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearJobs}
            disabled={savedJobs.length === 0}
          >
            <Trash2 size={18} color="#C75B3B" />
            <Text style={styles.dangerButtonText}>
              Clear All Saved Jobs ({savedJobs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Your API key and settings are stored locally on your device and
            never sent to our servers.
          </Text>
        </View>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: "#998272",
    marginBottom: 12,
    lineHeight: 18,
  },
  link: {
    color: "#C75B3B",
    fontWeight: "500",
  },
  apiKeyContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  apiKeyInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeButton: {
    padding: 16,
    marginTop: 24,
  },
  disclaimerInput: {
    marginBottom: 0,
  },
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E8DFD7",
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#998272",
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FDF6F3",
    borderRadius: 12,
  },
  dangerButtonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#C75B3B",
  },
  infoSection: {
    marginTop: 24,
  },
  infoText: {
    fontSize: 12,
    color: "#B8A393",
    textAlign: "center",
    lineHeight: 16,
  },
});
