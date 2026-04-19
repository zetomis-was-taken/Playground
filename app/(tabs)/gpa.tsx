import { Colors } from '@/constants/theme';
import { DisplayClass } from '@/src/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GradeColumn {
  id: string;
  name: string;
  weight: string;
}

export default function GpaScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<DisplayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([
    { id: '1', name: 'Chuyên cần', weight: '10' }
  ]);

  // State to store multiple scores per column. Key is column ID.
  const [scores, setScores] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('@display_classes');
        if (data) {
          const parsed = JSON.parse(data) as DisplayClass[];
          // Lấy môn lý thuyết để tính điểm trung bình môn
          const theoryClasses = parsed.filter(c => c.type === 'theory');
          setClasses(theoryClasses);
          if (theoryClasses.length > 0) {
            setSelectedClassId(theoryClasses[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.emptyContent}><Text>Đang tải...</Text></View></SafeAreaView>;
  }

  if (classes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Text style={styles.title}>Chưa có lịch học</Text>
          <Text style={styles.subtitle}>Vui lòng upload danh sách lịch học ở phần cài đặt để tiếp tục.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/settings')}>
            <Text style={styles.primaryButtonText}>Đi tới Cài đặt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const addColumn = () => {
    setGradeColumns([...gradeColumns, { id: Math.random().toString(), name: '', weight: '' }]);
  };

  const updateColumn = (id: string, field: 'name' | 'weight', value: string) => {
    setGradeColumns(gradeColumns.map(col => col.id === id ? { ...col, [field]: value } : col));
  };

  const removeColumn = (id: string) => {
    setGradeColumns(gradeColumns.filter(col => col.id !== id));
  };

  const handleScoreChange = (colId: string, index: number, value: string) => {
    const colScores = scores[colId] || [''];
    const newScores = [...colScores];
    newScores[index] = value;
    setScores({ ...scores, [colId]: newScores });
  };

  const addScoreInput = (colId: string) => {
    const colScores = scores[colId] || [''];
    setScores({ ...scores, [colId]: [...colScores, ''] });
  };

  const removeScoreInput = (colId: string, index: number) => {
    const colScores = scores[colId] || [''];
    if (colScores.length <= 1) {
      setScores({ ...scores, [colId]: [''] }); // clear if last
    } else {
      const newScores = colScores.filter((_, i) => i !== index);
      setScores({ ...scores, [colId]: newScores });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Quản lý Điểm & GPA</Text>

        {/* 1. Dropdown chọn môn học */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn môn học</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
            {classes.map(cls => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classChip, selectedClassId === cls.id && styles.classChipSelected]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Text style={[styles.classChipText, selectedClassId === cls.id && styles.classChipTextSelected]}>
                  {cls.subjectName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 2. Thiết lập Rules (Cột điểm) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết lập Cột Điểm</Text>
          <View style={styles.ruleContainer}>
            {gradeColumns.map((col, index) => (
              <View key={col.id} style={styles.ruleRow}>
                <TextInput
                  style={[styles.input, styles.inputName]}
                  placeholder="Tên cột (VD: Giữa kỳ)"
                  value={col.name}
                  onChangeText={(val) => updateColumn(col.id, 'name', val)}
                />
                <TextInput
                  style={[styles.input, styles.inputWeight]}
                  placeholder="%"
                  keyboardType="numeric"
                  value={col.weight}
                  onChangeText={(val) => updateColumn(col.id, 'weight', val)}
                />
                {gradeColumns.length > 1 && (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => removeColumn(col.id)}>
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addColumn}>
              <Text style={styles.addButtonText}>+ Thêm cột điểm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Stub Nhập điểm (Vertical) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhập Điểm</Text>
          <View style={styles.verticalScoresContainer}>
            {gradeColumns.map((col) => {
              const colScores = scores[col.id] || [''];
              return (
                <View key={col.id} style={styles.verticalScoreCard}>
                  <View style={styles.verticalScoreHeader}>
                    <Text style={styles.verticalScoreTitle}>{col.name || 'Chưa đặt tên'}</Text>
                    <Text style={styles.verticalScoreWeight}>{col.weight || '0'}%</Text>
                  </View>

                  {colScores.map((score, sIdx) => (
                    <View key={sIdx} style={styles.verticalInputRow}>
                      <TextInput
                        style={styles.verticalScoreInput}
                        placeholder="Nhập điểm (0-10)"
                        keyboardType="decimal-pad"
                        value={score}
                        onChangeText={(val) => handleScoreChange(col.id, sIdx, val)}
                      />
                      {colScores.length > 1 && (
                        <TouchableOpacity
                          style={styles.verticalRemoveBtn}
                          onPress={() => removeScoreInput(col.id, sIdx)}
                        >
                          <Text style={styles.verticalRemoveBtnText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <TouchableOpacity style={styles.verticalAddBtn} onPress={() => addScoreInput(col.id)}>
                    <Text style={styles.verticalAddBtnText}>+ Thêm đầu điểm</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.verticalTotalCard}>
              <Text style={styles.verticalTotalText}>Tổng kết môn:</Text>
              <Text style={styles.verticalTotalScore}>0.0</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Lưu Điểm</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: Colors.text || '#333' },
  subtitle: { fontSize: 16, color: Colors.textSecondary || '#666', marginBottom: 20, textAlign: 'center' },
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  screenTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text || '#333', marginBottom: 15 },

  classSelector: { flexDirection: 'row', paddingBottom: 5 },
  classChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 20, marginRight: 10 },
  classChipSelected: { backgroundColor: Colors.primary },
  classChipText: { fontSize: 14, color: Colors.text || '#333' },
  classChipTextSelected: { color: '#fff', fontWeight: 'bold' },

  ruleContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text || '#333' },
  inputName: { flex: 3 },
  inputWeight: { flex: 1, textAlign: 'center' },
  deleteButton: { padding: 10, backgroundColor: '#ffeeee', borderRadius: 8 },
  deleteButtonText: { color: '#e74c3c', fontWeight: 'bold' },
  addButton: { marginTop: 10, paddingVertical: 12, backgroundColor: '#eef5ff', borderRadius: 8, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary },
  addButtonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },

  verticalScoresContainer: { gap: 15 },
  verticalScoreCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  verticalScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  verticalScoreTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text || '#333' },
  verticalScoreWeight: { fontSize: 14, color: Colors.primary, fontWeight: 'bold' },
  verticalInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  verticalScoreInput: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, fontSize: 16, color: Colors.text || '#333' },
  verticalRemoveBtn: { backgroundColor: '#ffeeee', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  verticalRemoveBtnText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
  verticalAddBtn: { marginTop: 5, paddingVertical: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  verticalAddBtnText: { color: Colors.textSecondary || '#666', fontSize: 14, fontWeight: '500' },

  verticalTotalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff5f5', borderRadius: 12, padding: 15, marginTop: 5 },
  verticalTotalText: { fontSize: 16, fontWeight: 'bold', color: Colors.text || '#333' },
  verticalTotalScore: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c' },

  saveButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
