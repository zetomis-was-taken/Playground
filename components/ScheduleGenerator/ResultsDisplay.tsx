import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { PopulatedScheduleProfile } from '@/src/schemas';
import ScheduleTable from './ScheduleTable';

// Mock Data bám sát cấu trúc PopulatedScheduleProfileSchema
const MOCK_PROFILES: PopulatedScheduleProfile[] = [
  {
    id: '1',
    score: 95,
    isMain: false,
    classes: [
      {
        classInfo: {
          subjectId: 'IT001',
          subjectName: 'Giải tích 1',
          className: 'IT001.1',
          credits: 3,
          capacity: 100,
          enrolled: 50,
          cohort: 2024,
          schedules: [{ dayOfWeek: 'mon', startPeriod: 1, endPeriod: 3, location: 'A.101' }]
        }
      },
      {
        classInfo: {
          subjectId: 'IT002',
          subjectName: 'Lập trình Web',
          className: 'IT002.1',
          credits: 4,
          capacity: 80,
          enrolled: 40,
          cohort: 2024,
          schedules: [{ dayOfWeek: 'tue', startPeriod: 4, endPeriod: 6, location: 'B.201' }]
        },
        selectedPracticeGroup: {
          groupId: 'TH1',
          capacity: 40,
          enrolled: 20,
          location: 'Lab 1',
          schedules: [{ dayOfWeek: 'thu', startPeriod: 1, endPeriod: 3, location: 'Lab 1' }]
        }
      }
    ]
  },
  {
    id: '2',
    score: 88,
    isMain: false,
    classes: [
      {
        classInfo: {
          subjectId: 'IT001',
          subjectName: 'Giải tích 1',
          className: 'IT001.2',
          credits: 3,
          capacity: 100,
          enrolled: 50,
          cohort: 2024,
          schedules: [{ dayOfWeek: 'mon', startPeriod: 4, endPeriod: 6, location: 'A.102' }]
        }
      },
      {
        classInfo: {
          subjectId: 'IT002',
          subjectName: 'Lập trình Web',
          className: 'IT002.2',
          credits: 4,
          capacity: 80,
          enrolled: 40,
          cohort: 2024,
          schedules: [{ dayOfWeek: 'wed', startPeriod: 1, endPeriod: 3, location: 'B.202' }]
        }
      }
    ]
  }
];

export default function ResultsDisplay() {
  const renderItem = ({ item }: { item: PopulatedScheduleProfile }) => (
    <ScheduleTable profile={item} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kết Quả Đề Xuất</Text>
      
      <FlatList
        data={MOCK_PROFILES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // Vì đã nằm trong ScrollView cha
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
});
