import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PoundSterling,
  Clock,
  Boxes,
  FileText,
  Trash2,
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
import type { SavedJob } from "@/types/Estimate";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<SavedJob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { savedJobs, loadJobs, deleteJob, settings } = useStore();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (id && savedJobs.length > 0) {
      const found = savedJobs.find((j) => j.id === id);
      setJob(found || null);
    }
  }, [id, savedJobs]);

  const handleDelete = () => {
    if (!job) return;

    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this saved job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteJob(job.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleGeneratePDF = async () => {
    if (!job) return;

    setIsGeneratingPDF(true);
    try {
      await generatePDF(job, settings);
    } catch (err) {
      console.error("PDF generation error:", err);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Job not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Preview */}
        {job.photoUri && (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: job.photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Job Info */}
        <View style={styles.jobInfo}>
          <Text style={styles.jobType}>{job.inputs.jobType}</Text>
          <Text style={styles.jobDate}>{formatDate(job.timestamp)}</Text>
          <Text style={styles.jobMeta}>
            {job.inputs.anchorType}: {job.inputs.anchorValue}m •{" "}
            {job.inputs.difficulty}
            {job.inputs.hasOpenings ? " • Has openings" : ""}
          </Text>
        </View>

        {/* Price (Highlighted) */}
        <ResultBlock
          label="Estimated Price"
          value={formatPriceRange(job.outputs.recommended_price_gbp_range)}
          highlight
          icon={<PoundSterling size={18} color="rgba(255,255,255,0.8)" />}
        />

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <ResultBlock
              label="Labour"
              value={formatLabourRange(job.outputs.labour_hours_range)}
              icon={<Clock size={16} color="#998272" />}
            />
          </View>
          <View style={styles.metricHalf}>
            <ResultBlock
              label="Area"
              value={`${job.outputs.area_m2.toFixed(1)} m²`}
            />
          </View>
        </View>

        {/* Materials */}
        <Card title="Materials" style={styles.section}>
          <View style={styles.materialRow}>
            <Boxes size={16} color="#C75B3B" />
            <Text style={styles.materialLabel}>Bricks:</Text>
            <Text style={styles.materialValue}>
              {formatRange(job.outputs.brick_count_range)}
            </Text>
          </View>
          <View style={styles.materialRow}>
            <Text style={styles.materialLabel}>Sand:</Text>
            <Text style={styles.materialValue}>
              {formatRange(job.outputs.materials.sand_kg_range)} kg
            </Text>
          </View>
          <View style={styles.materialRow}>
            <Text style={styles.materialLabel}>Cement:</Text>
            <Text style={styles.materialValue}>
              {formatRange(job.outputs.materials.cement_bags_range)} bags
            </Text>
          </View>
          {job.outputs.materials.other?.length > 0 && (
            <View style={styles.otherMaterials}>
              <Text style={styles.otherLabel}>Other:</Text>
              {job.outputs.materials.other.map((item, i) => (
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
          items={job.outputs.assumptions}
          type="info"
        />

        {/* Exclusions */}
        <ResultList
          title="Exclusions"
          items={job.outputs.exclusions}
          type="warning"
        />

        {/* Notes */}
        {job.outputs.notes?.length > 0 && (
          <Card title="Notes" style={styles.section}>
            {job.outputs.notes.map((note, i) => (
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
            title="Delete Job"
            variant="ghost"
            onPress={handleDelete}
            icon={<Trash2 size={18} color="#C75B3B" />}
            fullWidth
          />
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
    height: 200,
    borderRadius: 12,
  },
  jobInfo: {
    marginBottom: 16,
  },
  jobType: {
    fontSize: 24,
    fontWeight: "700",
    color: "#544740",
  },
  jobDate: {
    fontSize: 13,
    color: "#B8A393",
    marginTop: 4,
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
  noteText: {
    fontSize: 14,
    color: "#655549",
    marginBottom: 8,
    lineHeight: 20,
  },
});
