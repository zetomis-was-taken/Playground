import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { PopulatedScheduleProfile } from '@/src/schemas';

interface ScheduleTableProps {
  profile: PopulatedScheduleProfile;
}

export default function ScheduleTable({ profile }: ScheduleTableProps) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const periods = Array.from({ length: 10 }, (_, i) => i + 1);

  const dayLabels: Record<string, string> = {
    mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7'
  };

  // grid[day][period] = string (Mã lớp/Tên môn)
  const grid: Record<string, Record<number, { name: string; type: string; color: string }>> = {};
  days.forEach(d => { grid[d] = {}; });

  const colors = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA'];

  profile.classes.forEach((pc, index) => {
    const color = colors[index % colors.length];

    // Lịch lý thuyết
    pc.classInfo.schedules.forEach(s => {
      for (let p = s.startPeriod; p <= s.endPeriod; p++) {
        grid[s.dayOfWeek][p] = { name: pc.classInfo.subjectName, type: 'LT', color };
      }
    });

    // Lịch thực hành
    if (pc.selectedPracticeGroup) {
      pc.selectedPracticeGroup.schedules.forEach(s => {
        for (let p = s.startPeriod; p <= s.endPeriod; p++) {
          grid[s.dayOfWeek][p] = { name: pc.classInfo.subjectName, type: 'TH', color };
        }
      });
    }

    // Lịch bài tập
    if (pc.selectedExerciseGroup) {
      pc.selectedExerciseGroup.schedules.forEach(s => {
        for (let p = s.startPeriod; p <= s.endPeriod; p++) {
          grid[s.dayOfWeek][p] = { name: pc.classInfo.subjectName, type: 'BT', color };
        }
      });
    }
  });

  const handleDownload = () => {
    // STUB: Logic tải file (vd: expo-file-system, expo-sharing)
    Alert.alert('Tải về', 'Sẽ tải cấu hình này về máy dưới dạng JSON.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Cấu hình môn học</Text>
          {profile.score !== undefined && (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{profile.score} điểm</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadText}>📥 Tải về</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={[styles.cell, styles.headerCell, styles.cornerCell]} />
            {days.map(d => (
              <View key={d} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>{dayLabels[d]}</Text>
              </View>
            ))}
          </View>

          {/* Body Rows */}
          {periods.map(period => (
            <View key={period} style={styles.row}>
              <View style={[styles.cell, styles.headerCell, styles.periodCell]}>
                <Text style={styles.headerText}>T{period}</Text>
              </View>
              {days.map(d => {
                const cellData = grid[d][period];
                return (
                  <View 
                    key={`${d}-${period}`} 
                    style={[
                      styles.cell, 
                      cellData ? { backgroundColor: cellData.color } : styles.emptyCell
                    ]}
                  >
                    {cellData && (
                      <>
                        <Text style={styles.cellTitle} numberOfLines={2}>{cellData.name}</Text>
                        <Text style={styles.cellType}>{cellData.type}</Text>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
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
  downloadButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 80,
    height: 50,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  emptyCell: {
    backgroundColor: '#FAFAFA',
  },
  headerCell: {
    backgroundColor: '#F0F0F0',
  },
  cornerCell: {
    width: 40,
  },
  periodCell: {
    width: 40,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  cellTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cellType: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  }
});
