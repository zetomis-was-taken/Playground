import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

/**
 * [STUB] Generate Button
 * 
 * @TODO_TEAM: Implement logic gọi thuật toán xếp lịch.
 * 
 * HƯỚNG DẪN IMPLEMENT:
 * 1. Gắn hàm xử lý vào prop `onPress` của TouchableOpacity.
 * 2. Khi bắt đầu bấm:
 *    - `setIsLoading(true)` (Cần tạo state này ở component cha hoặc context).
 *    - Thu thập toàn bộ dữ liệu từ: TimeSlotSelector, SubjectPreferences, và JSON data.
 * 3. Gọi thuật toán (chạy đồng bộ hoặc đẩy vào Web Worker / InteractionManager nếu thuật toán quá nặng để tránh giật UI).
 * 4. Khi có kết quả:
 *    - Lưu kết quả vào state.
 *    - `setIsLoading(false)`.
 */
export default function GenerateButton() {
  const handleGenerate = () => {
    // Để trống theo yêu cầu. Team sẽ viết logic gọi thuật toán ở đây.
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGenerate}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>TÌM LỊCH HỌC PHÙ HỢP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B6B', // Màu sắc nổi bật
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
