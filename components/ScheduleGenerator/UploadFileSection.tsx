import { useSchedulerContext } from "@/src/state/scheduler-context";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function UploadFileSection() {
  const { sourceFileName, parseAndSetSourceData } = useSchedulerContext();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      // Mở document picker để chọn file JSON
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];

      let fileContent = "";

      // Xử lý đọc file đa nền tảng (Web vs Mobile)
      if (Platform.OS === "web") {
        // Trên Web: DocumentPicker trả về thuộc tính 'file' chứa object File của HTML5
        const webFile = (file as any).file;
        if (webFile) {
          fileContent = await webFile.text();
        } else {
          throw new Error("Không tìm thấy file trên Web");
        }
      } else {
        // Trên Mobile: Sử dụng API mới của expo-file-system
        const fileObj = new File(file.uri);
        fileContent = await fileObj.text();
      }

      // Validate JSON format
      const parsedData = JSON.parse(fileContent);
      const parsingResult = parseAndSetSourceData(file.name, parsedData);
      if (!parsingResult.ok) {
        throw new Error(parsingResult.message || "Dữ liệu JSON không hợp lệ.");
      }

      // Alert trên Web đôi khi hoạt động không ổn định tùy trình duyệt, fallback về window.alert nếu cần
      if (Platform.OS === "web") {
        window.alert("Thành công: Đã tải dữ liệu lịch học thành công!");
      } else {
        Alert.alert("Thành công", "Đã tải dữ liệu lịch học thành công!");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể đọc file hoặc file không đúng định dạng JSON.";

      if (Platform.OS === "web") {
        window.alert(`Lỗi: ${errorMessage}`);
      } else {
        Alert.alert("Lỗi", errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>1. Tải lên dữ liệu môn học (JSON)</Text>

      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.uploadingButton]}
        onPress={handleUpload}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>
          {isUploading ? "Đang xử lý..." : "Chọn File JSON"}
        </Text>
      </TouchableOpacity>

      {sourceFileName && (
        <Text style={styles.fileName}>Đã chọn: {sourceFileName}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadingButton: {
    backgroundColor: "#A0C3EB",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
