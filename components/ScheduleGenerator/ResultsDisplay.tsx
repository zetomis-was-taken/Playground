import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// Mock Data
const MOCK_RESULTS = [
  {
    id: '1',
    score: 95,
    title: 'Lịch Tối Ưu Nhất',
    summary: 'Nghỉ trọn vẹn Thứ 7, CN. Trống chiều Thứ 4.',
    details: [
      'Giải tích 1: T2 (Tiết 1-3)',
      'Lập trình Web: T3 (Tiết 4-6)',
      'Cấu trúc dữ liệu: T5 (Tiết 1-3)'
    ]
  },
  {
    id: '2',
    score: 88,
    title: 'Lịch Cân Bằng',
    summary: 'Dàn đều các ngày, không quá 4 tiết/ngày.',
    details: [
      'Giải tích 1: T2 (Tiết 4-6)',
      'Lập trình Web: T4 (Tiết 1-3)',
      'Cấu trúc dữ liệu: T6 (Tiết 1-3)'
    ]
  }
];

export default function ResultsDisplay() {
  const renderItem = ({ item }: { item: typeof MOCK_RESULTS[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{item.score} điểm</Text>
        </View>
      </View>
      
      <Text style={styles.summary}>{item.summary}</Text>
      
      <View style={styles.detailsContainer}>
        {item.details.map((detail, index) => (
          <Text key={index} style={styles.detailText}>• {detail}</Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kết Quả Đề Xuất</Text>
      
      <FlatList
        data={MOCK_RESULTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // Vì đã nằm trong ScrollView cha
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summary: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  detailsContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  }
});
