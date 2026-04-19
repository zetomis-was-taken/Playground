import { Colors } from '@/constants/theme';
import { ClassListSchema, DisplayClass } from '@/src/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async () => {
    console.log('Starting upload process');
    try {
      setLoading(true);
      console.log('Setting loading to true');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      console.log('DocumentPicker result:', result);

      if (result.canceled) {
        console.log('Upload canceled by user');
        return;
      }

      const fileUri = result.assets[0].uri;
      console.log('File URI:', fileUri);
      const response = await fetch(fileUri);
      console.log('Fetch response:', response);
      const fileText = await response.text();
      console.log('File text length:', fileText.length);

      const jsonData = JSON.parse(fileText);
      console.log('Parsed JSON data:', jsonData);
      const parsedData = ClassListSchema.safeParse(jsonData);

      if (!parsedData.success) {
        console.log('Parse failed:', parsedData.error);
        setMessage('Upload thất bại: File JSON không đúng định dạng danh sách lớp.');
        console.error(parsedData.error);
        return;
      }

      console.log('Parse successful, processing classes');
      const rawClasses = parsedData.data;
      const displayClasses: DisplayClass[] = [];

      rawClasses.forEach((cls) => {
        // Lớp lý thuyết
        if (cls.schedules && cls.schedules.length > 0) {
          displayClasses.push({
            id: generateUUID(),
            originalSubjectId: cls.subjectId,
            originalClassId: cls.className,
            type: 'theory',
            subjectName: cls.subjectName,
            className: cls.className,
            location: cls.location || 'Chưa rõ',
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
              type: 'practice',
              subjectName: cls.subjectName,
              className: group.groupId,
              location: group.location || cls.location || 'Chưa rõ',
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
              type: 'exercise',
              subjectName: cls.subjectName,
              className: group.groupId,
              location: group.location || cls.location || 'Chưa rõ',
              schedules: group.schedules,
            });
          });
        }
      });

      console.log('Display classes created:', displayClasses.length);
      await AsyncStorage.setItem('@display_classes', JSON.stringify(displayClasses));
      console.log('Data saved to AsyncStorage');
      setMessage(`Upload thành công: Đã lưu ${displayClasses.length} lớp học (bao gồm lý thuyết, thực hành, bài tập)!`);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload thất bại: Không thể đọc hoặc parse file.');
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.subtitle}>Tuỳ chọn ứng dụng</Text>

        {message && (
          <Text style={[styles.message, message.includes('thành công') ? styles.success : styles.error]}>
            {message}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={loading}>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: Colors.primary },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 40 },
  message: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  success: { color: Colors.success },
  error: { color: Colors.danger },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
