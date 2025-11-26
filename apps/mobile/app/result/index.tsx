import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PoundSterling,
  Clock,
  Boxes,
  FileText,
  Save,
  Plus,
} from "lucide-react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ResultBlock, ResultList } from "@/components/ResultBlock";
import { useStore } from "@/lib/store";
import { generatePDF } from "@/lib/pdf";
import {
  formatPriceRange,
  formatLabourRange,
  formatRange,
} from "@/lib/pricing";

export default function ResultScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    currentResult,
    photoUri,
    settings,
    saveCurrentJob,
    resetEstimate,
    getInputs,
  } = useStore();

  const inputs = getInputs();

  if (!currentResult || !inputs) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No estimate results available</Text>
          <Button
            title="Start New Estimate"
            onPress={() => {
              resetEstimate();
              router.replace("/estimate");
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveJob = async () => {
    setIsSaving(true);
    try {
      const job = await saveCurrentJob();
      if (job) {
        setSaved(true);
        Alert.alert("Saved", "Job has been saved successfully.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to save job. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create a temporary job object for PDF generation
      const tempJob = {
        id: `temp-${Date.now()}`,
        timestamp: Date.now(),
        inputs,
        outputs: currentResult,
        photoUri: inputs.photoUri,
      };

      await generatePDF(tempJob, settings);
    } catch (err) {
      console.error("PDF generation error:", err);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleNewEstimate = () => {
    resetEstimate();
    router.replace("/estimate");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Preview */}
        {photoUri && (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Job Info */}
        <View style={styles.jobInfo}>
          <Text style={styles.jobType}>{inputs.jobType}</Text>
          <Text style={styles.jobMeta}>
            {inputs.anchorType}: {inputs.anchorValue}m • {inputs.difficulty}
            {inputs.hasOpenings ? " • Has openings" : ""}
          </Text>
        </View>

        {/* Price (Highlighted) */}
        <ResultBlock
          label="Estimated Price"
          value={formatPriceRange(currentResult.recommended_price_gbp_range)}
          highlight
          icon={<PoundSterling size={18} color="rgba(255,255,255,0.8)" />}
        />

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <ResultBlock
              label="Labour"
              value={formatLabourRange(currentResult.labour_hours_range)}
              icon={<Clock size={16} color="#998272" />}
            />
          </View>
          <View style={styles.metricHalf}>
            <ResultBlock
              label="Area"
              value={`${currentResult.area_m2.toFixed(1)} m²`}
            />
          </View>
        </View>

        {/* Materials */}
        <Card title="Materials" style={styles.section}>
          <View style={styles.materialRow}>
            <Boxes size={16} color="#C75B3B" />
            <Text style={styles.materialLabel}>Bricks:</Text>
            <Text style={styles.materialValue}>
              {formatRange(currentResult.brick_count_range)}
            </Text>
          </View>
          <View style={styles.materialRow}>
            <Text style={styles.materialLabel}>Sand:</Text>
            <Text style={styles.materialValue}>
              {formatRange(currentResult.materials.sand_kg_range)} kg
            </Text>
          </View>
          <View style={styles.materialRow}>
            <Text style={styles.materialLabel}>Cement:</Text>
            <Text style={styles.materialValue}>
              {formatRange(currentResult.materials.cement_bags_range)} bags
            </Text>
          </View>
          {currentResult.materials.other?.length > 0 && (
            <View style={styles.otherMaterials}>
              <Text style={styles.otherLabel}>Other:</Text>
              {currentResult.materials.other.map((item, i) => (
                <Text key={i} style={styles.otherItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* Assumptions */}
        <ResultList
          title="Assumptions"
          items={currentResult.assumptions}
          type="info"
        />

        {/* Exclusions */}
        <ResultList
          title="Exclusions"
          items={currentResult.exclusions}
          type="warning"
        />

        {/* Notes */}
        {currentResult.notes?.length > 0 && (
          <Card title="Notes" style={styles.section}>
            {currentResult.notes.map((note, i) => (
              <Text key={i} style={styles.noteText}>
                {note}
              </Text>
            ))}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Generate PDF"
            variant="outline"
            onPress={handleGeneratePDF}
            loading={isGeneratingPDF}
            icon={<FileText size={18} color="#C75B3B" />}
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <Button
            title={saved ? "Saved" : "Save Job"}
            variant="secondary"
            onPress={handleSaveJob}
            loading={isSaving}
            disabled={saved}
            icon={<Save size={18} color="#544740" />}
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="New Estimate"
            onPress={handleNewEstimate}
            icon={<Plus size={18} color="#FFFFFF" />}
            fullWidth
          />
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This is an estimate only. Actual costs may vary based on site
          conditions, material prices, and scope changes.
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
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#998272",
    marginBottom: 16,
  },
  photoSection: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  jobInfo: {
    marginBottom: 16,
  },
  jobType: {
    fontSize: 20,
    fontWeight: "700",
    color: "#544740",
  },
  jobMeta: {
    fontSize: 14,
    color: "#998272",
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricHalf: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F0EB",
  },
  materialLabel: {
    flex: 1,
    fontSize: 14,
    color: "#655549",
    marginLeft: 8,
  },
  materialValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#544740",
  },
  otherMaterials: {
    paddingTop: 8,
  },
  otherLabel: {
    fontSize: 14,
    color: "#655549",
    marginBottom: 4,
  },
  otherItem: {
    fontSize: 13,
    color: "#998272",
    marginLeft: 8,
    marginBottom: 2,
  },
  actions: {
    marginTop: 24,
  },
  buttonSpacer: {
    height: 12,
  },
  disclaimer: {
    fontSize: 11,
    color: "#B8A393",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
  noteText: {
    fontSize: 14,
    color: "#655549",
    marginBottom: 8,
    lineHeight: 20,
  },
});
