import { Colors } from "@/constants/theme";
import { ClassListSchema, DisplayClass } from "@/src/schemas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const fileText = await response.text();

      const jsonData = JSON.parse(fileText);
      const parsedData = ClassListSchema.safeParse(jsonData);

      if (!parsedData.success) {
        Alert.alert(
          "Lỗi định dạng",
          "File JSON không đúng định dạng danh sách lớp.",
        );
        console.error(parsedData.error);
        return;
      }

      const rawClasses = parsedData.data;
      const displayClasses: DisplayClass[] = [];

      rawClasses.forEach((cls) => {
        // Lớp lý thuyết
        if (cls.schedules && cls.schedules.length > 0) {
          displayClasses.push({
            id: generateUUID(),
            originalSubjectId: cls.subjectId,
            originalClassId: cls.className,
            type: "theory",
            subjectName: cls.subjectName,
            className: cls.className,
            location: cls.location || "Chưa rõ",
            schedules: cls.schedules,
          });
        }
        // Nhóm thực hành
        if (cls.practiceGroups) {
          cls.practiceGroups.forEach((group) => {
            displayClasses.push({
              id: generateUUID(),
              originalSubjectId: cls.subjectId,
              originalClassId: group.groupId,
              type: "practice",
              subjectName: cls.subjectName,
              className: group.groupId,
              location: group.location || cls.location || "Chưa rõ",
              schedules: group.schedules,
            });
          });
        }
        // Nhóm bài tập
        if (cls.exerciseGroups) {
          cls.exerciseGroups.forEach((group) => {
            displayClasses.push({
              id: generateUUID(),
              originalSubjectId: cls.subjectId,
              originalClassId: group.groupId,
              type: "exercise",
              subjectName: cls.subjectName,
              className: group.groupId,
              location: group.location || cls.location || "Chưa rõ",
              schedules: group.schedules,
            });
          });
        }
      });

      await AsyncStorage.setItem(
        "@display_classes",
        JSON.stringify(displayClasses),
      );
      Alert.alert(
        "Thành công",
        `Đã lưu ${displayClasses.length} lớp học (bao gồm lý thuyết, thực hành, bài tập)!`,
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể đọc hoặc parse file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.subtitle}>Tuỳ chọn ứng dụng</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload File Lịch Học (JSON)</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary,
  },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 40 },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
