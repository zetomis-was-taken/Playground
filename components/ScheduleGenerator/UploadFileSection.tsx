import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UploadFileSection() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    try {
      setIsUploading(true);

      // Mở document picker để chọn file JSON
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);

      // Đọc nội dung file
      const fileContent = await FileSystem.readAsStringAsync(file.uri);

      // Validate JSON format
      const parsedData = JSON.parse(fileContent);

      // Lưu vào AsyncStorage
      await AsyncStorage.setItem('@schedule_data', JSON.stringify(parsedData));

      Alert.alert('Thành công', 'Đã tải và lưu dữ liệu lịch học thành công!');
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Lỗi', 'Không thể đọc file hoặc file không đúng định dạng JSON.');
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
          {isUploading ? 'Đang xử lý...' : 'Chọn File JSON'}
        </Text>
      </TouchableOpacity>

      {fileName && (
        <Text style={styles.fileName}>Đã chọn: {fileName}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadingButton: {
    backgroundColor: '#A0C3EB',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
