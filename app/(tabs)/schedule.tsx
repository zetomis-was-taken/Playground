import ScheduleGenerator from '@/components/ScheduleGenerator';
import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <ScheduleGenerator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
