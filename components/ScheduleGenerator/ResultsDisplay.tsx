import { PopulatedScheduleProfile } from '@/src/schemas';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScheduleTable from './ScheduleTable';

interface ResultsDisplayProps {
  schedules: PopulatedScheduleProfile[];
}

export default function ResultsDisplay({ schedules }: ResultsDisplayProps) {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: PopulatedScheduleProfile }) => (
    <ScheduleTable profile={item} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Kết Quả Đề Xuất</Text>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
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
