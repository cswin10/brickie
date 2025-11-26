import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Trash2, FolderOpen } from "lucide-react-native";
import { useStore } from "@/lib/store";
import { formatPriceRange } from "@/lib/pricing";
import type { SavedJob } from "@/types/Estimate";

export default function JobsScreen() {
  const router = useRouter();
  const { savedJobs, loadJobs, deleteJob } = useStore();

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDeleteJob = (job: SavedJob) => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this saved job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteJob(job.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderJob = ({ item }: { item: SavedJob }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/jobs/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.jobContent}>
        {item.photoUri && (
          <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        )}
        <View style={styles.jobInfo}>
          <Text style={styles.jobType}>{item.inputs.jobType}</Text>
          <Text style={styles.jobPrice}>
            {formatPriceRange(item.outputs.recommended_price_gbp_range)}
          </Text>
          <Text style={styles.jobMeta}>
            {formatDate(item.timestamp)} • {item.inputs.anchorType}:{" "}
            {item.inputs.anchorValue}m
          </Text>
        </View>
        <View style={styles.jobActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteJob(item)}
          >
            <Trash2 size={18} color="#C75B3B" />
          </TouchableOpacity>
          <ChevronRight size={20} color="#B8A393" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (savedJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <FolderOpen size={48} color="#D4C5B8" />
          </View>
          <Text style={styles.emptyTitle}>No Saved Jobs</Text>
          <Text style={styles.emptyText}>
            Your saved estimates will appear here
          </Text>
          <TouchableOpacity
            style={styles.newEstimateLink}
            onPress={() => router.push("/estimate")}
          >
            <Text style={styles.newEstimateText}>Create your first estimate</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={savedJobs}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F5F0EB",
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#544740",
  },
  jobPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C75B3B",
    marginTop: 2,
  },
  jobMeta: {
    fontSize: 12,
    color: "#998272",
    marginTop: 4,
  },
  jobActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#544740",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#998272",
    textAlign: "center",
  },
  newEstimateLink: {
    marginTop: 24,
  },
  newEstimateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C75B3B",
  },
});
