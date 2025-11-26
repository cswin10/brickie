import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { X, Camera, ImageIcon } from "lucide-react-native";

interface PhotoPreviewProps {
  uri: string | null;
  onClear: () => void;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
}

export function PhotoPreview({
  uri,
  onClear,
  onTakePhoto,
  onPickPhoto,
}: PhotoPreviewProps) {
  if (uri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.placeholder}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onTakePhoto}>
          <Camera size={32} color="#C75B3B" />
          <Text style={styles.actionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onPickPhoto}>
          <ImageIcon size={32} color="#C75B3B" />
          <Text style={styles.actionText}>Upload</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Take or upload a photo of the job for AI estimation
      </Text>
    </View>
  );
}

const { width } = Dimensions.get("window");
const imageHeight = Math.min(width - 32, 300);

const styles = StyleSheet.create({
  previewContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: imageHeight,
    borderRadius: 16,
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  placeholder: {
    backgroundColor: "#F9F6F3",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8DFD7",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#544740",
  },
  hint: {
    fontSize: 12,
    color: "#998272",
    textAlign: "center",
    maxWidth: 250,
  },
});
