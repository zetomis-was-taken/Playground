import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
// import GenerateButton from './GenerateButton';
import GenerateButton from './GenerateButton';
import ResultsDisplay from './ResultsDisplay';
import SubjectPreferences from './SubjectPreferences';
import TimeSlotSelector from './TimeSlotSelector';
import UploadFileSection from './UploadFileSection';

export default function ScheduleGenerator() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tạo Lịch Học</Text>

        <UploadFileSection />

        <TimeSlotSelector />

        <SubjectPreferences />

        <GenerateButton />

        <ResultsDisplay />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
});
