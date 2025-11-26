import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { PhotoPreview } from "@/components/PhotoPreview";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Toggle } from "@/components/Toggle";
import { useStore } from "@/lib/store";
import { estimateJob } from "@/lib/estimate";
import type { JobType, Difficulty, AnchorType } from "@/types/Estimate";

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: "Brickwork", value: "Brickwork" },
  { label: "Blockwork", value: "Blockwork" },
  { label: "Repointing", value: "Repointing" },
  { label: "Demo+Rebuild", value: "Demo+Rebuild" },
];

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Easy", value: "Easy" },
  { label: "Standard", value: "Standard" },
  { label: "Tricky", value: "Tricky" },
];

const ANCHOR_TYPES: { label: string; value: AnchorType }[] = [
  { label: "Length", value: "length" },
  { label: "Height", value: "height" },
];

export default function EstimateScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    photoUri,
    jobType,
    anchorType,
    anchorValue,
    difficulty,
    hasOpenings,
    isLoading,
    error,
    apiKey,
    setPhotoUri,
    setJobType,
    setAnchorType,
    setAnchorValue,
    setDifficulty,
    setHasOpenings,
    setCurrentResult,
    setLoading,
    setError,
    getInputs,
  } = useStore();

  // Clear any previous errors on mount
  useEffect(() => {
    setError(null);
    setValidationError(null);
  }, []);

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      // Web: use image picker instead
      await handlePickPhoto();
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take photos."
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapturePhoto = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          setShowCamera(false);
        }
      } catch (err) {
        console.error("Failed to take photo:", err);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      }
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Failed to pick image:", err);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleClearPhoto = () => {
    setPhotoUri(null);
  };

  const validateInputs = (): boolean => {
    if (!photoUri) {
      setValidationError("Please take or upload a photo of the job");
      return false;
    }

    if (!anchorValue || anchorValue.trim() === "") {
      setValidationError("Please enter an anchor dimension");
      return false;
    }

    const parsedValue = parseFloat(anchorValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      setValidationError("Please enter a valid positive number for the dimension");
      return false;
    }

    if (parsedValue > 100) {
      setValidationError("Dimension seems too large. Please check and enter in meters.");
      return false;
    }

    if (!apiKey) {
      setValidationError("OpenAI API key is required. Please add it in Settings.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleEstimate = async () => {
    if (!validateInputs()) {
      return;
    }

    const inputs = getInputs();
    if (!inputs) {
      setValidationError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await estimateJob(inputs, apiKey);
      setCurrentResult(result);
      router.push("/result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get estimate";
      setError(message);
      Alert.alert("Estimation Failed", message);
    } finally {
      setLoading(false);
    }
  };

  // Camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={(ref) => setCameraRef(ref)}
        >
          <SafeAreaView style={styles.cameraControls}>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowCamera(false)}
            />
            <View style={styles.captureButtonContainer}>
              <Button
                title="Capture"
                onPress={handleCapturePhoto}
                size="lg"
              />
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Section */}
        <Card title="Job Photo" style={styles.section}>
          <PhotoPreview
            uri={photoUri}
            onClear={handleClearPhoto}
            onTakePhoto={handleTakePhoto}
            onPickPhoto={handlePickPhoto}
          />
        </Card>

        {/* Job Type */}
        <Card title="Job Details" style={styles.section}>
          <SegmentedControl
            label="Job Type"
            options={JOB_TYPES}
            value={jobType}
            onChange={setJobType}
          />

          <SegmentedControl
            label="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={setDifficulty}
          />

          <Toggle
            label="Has Openings"
            description="Doors, windows, or other openings"
            value={hasOpenings}
            onChange={setHasOpenings}
          />
        </Card>

        {/* Anchor Dimension */}
        <Card title="Anchor Dimension" style={styles.section}>
          <Text style={styles.hint}>
            Enter one known dimension to help the AI estimate the job size
          </Text>

          <SegmentedControl
            options={ANCHOR_TYPES}
            value={anchorType}
            onChange={setAnchorType}
          />

          <Input
            label={anchorType === "length" ? "Length" : "Height"}
            placeholder="e.g., 4.5"
            keyboardType="decimal-pad"
            value={anchorValue}
            onChangeText={setAnchorValue}
            suffix="meters"
          />
        </Card>

        {/* Validation/Error Messages */}
        {(validationError || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError || error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={isLoading ? "Analysing Job..." : "Get Estimate"}
            onPress={handleEstimate}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="lg"
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
  section: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    color: "#998272",
    marginBottom: 12,
  },
  errorContainer: {
    backgroundColor: "#FDF6F3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#C75B3B",
  },
  errorText: {
    color: "#C75B3B",
    fontSize: 14,
  },
  submitSection: {
    marginTop: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  captureButtonContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
});
