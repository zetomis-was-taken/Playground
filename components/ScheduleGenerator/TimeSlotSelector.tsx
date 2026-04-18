import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * [STUB] Time Slot Selector
 * 
 * @TODO_TEAM: Implement logic chọn thời gian rảnh.
 * 
 * HƯỚNG DẪN IMPLEMENT TÍNH NĂNG KÉO THẢ (DRAG & DROP):
 * 1. Không nên dùng các TouchableOpacity đơn lẻ cho từng ô nếu muốn vuốt chọn nhiều ô.
 * 2. Gợi ý thư viện: Sử dụng `PanResponder` của React Native hoặc `react-native-gesture-handler`.
 * 3. Cách làm với PanResponder:
 *    - Gắn 1 PanResponder vào View cha bọc toàn bộ Grid.
 *    - Trong `onPanResponderMove`, lấy tọa độ (x, y) của ngón tay.
 *    - Tính toán xem tọa độ đó đang nằm ở ô (row, col) nào dựa trên chiều rộng/cao của mỗi ô.
 *    - Lưu trạng thái các ô đã được "quét" qua vào một state (Set hoặc Mảng 2D).
 * 4. State Management:
 *    - Dùng ma trận boolean 10x6 (10 tiết, 6 ngày) hoặc mảng chứa các object `{ day: number, period: number }`.
 */
export default function TimeSlotSelector() {
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const periods = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>2. Chọn thời gian rảnh</Text>
      <Text style={styles.hint}>Kéo thả để chọn nhiều ô (Stub)</Text>

      <View style={styles.gridContainer}>
        {/* Header Ngày */}
        <View style={styles.row}>
          <View style={styles.headerCorner} />
          {days.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.headerText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Các dòng (Tiết) */}
        {periods.map((period) => (
          <View key={`period-${period}`} style={styles.row}>
            <View style={styles.periodHeader}>
              <Text style={styles.headerText}>T{period}</Text>
            </View>
            
            {/* Các ô (Cells) */}
            {days.map((day) => (
              <View 
                key={`${day}-${period}`} 
                style={styles.cell} 
              />
            ))}
          </View>
        ))}
      </View>
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
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  headerCorner: {
    width: 40,
    backgroundColor: '#F0F0F0',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayHeader: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  periodHeader: {
    width: 40,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  cell: {
    flex: 1,
    height: 30, // Chiều cao cố định để demo
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
});
