import { Colors } from '@/constants/theme';
import { CourseProgress, DisplayClass, GradeComponent } from '@/src/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GradeColumn {
  id: string;
  name: string;
  weight: string;
  scores: string[];
}

interface GradeErrors {
  name?: string;
  weight?: string;
  scores: Record<number, string>;
}

const STORAGE_KEY = '@course_progress';
const AVAILABLE_WEIGHTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const AVAILABLE_NAMES = ['Chuyên cần', 'Giữa kì', 'Cuối kì'];
const AVAILABLE_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function toGradeColumns(components: GradeComponent[]): GradeColumn[] {
  return components.map((component) => ({
    id: component.id,
    name: component.name,
    weight: String(component.weight),
    scores: component.scores?.map(String) ?? [''],
  }));
}

function toCourseProgress(classId: string, columns: GradeColumn[]): CourseProgress {
  return {
    classId,
    gradeComponents: columns.map((col) => ({
      id: col.id,
      name: col.name.trim(),
      weight: Number(col.weight) || 0,
      scores: col.scores
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value) && value >= 0 && value <= 10),
    })),
  };
}

function buildScoreInputs(columns: GradeColumn[], existingInputs: Record<string, string[]> = {}) {
  return columns.reduce((acc, col) => {
    acc[col.id] = existingInputs[col.id] ?? (col.scores.length > 0 ? col.scores : ['']);
    return acc;
  }, {} as Record<string, string[]>);
}

function buildRuleValidationErrors(columns: GradeColumn[], existingErrors: Record<string, GradeErrors> = {}) {
  const nextErrors: Record<string, GradeErrors> = {};

  columns.forEach((col) => {
    const errors: GradeErrors = { scores: existingErrors[col.id]?.scores ?? {} };
    if (!col.name.trim()) {
      errors.name = 'Tên cột là bắt buộc';
    }

    const weightValue = Number(col.weight);
    if (col.weight.trim() === '' || Number.isNaN(weightValue) || weightValue < 0 || weightValue > 100) {
      errors.weight = 'Phải là số từ 0 đến 100';
    }

    nextErrors[col.id] = errors;
  });

  return nextErrors;
}

function validateRules(columns: GradeColumn[]) {
  const nextErrors = buildRuleValidationErrors(columns);
  const valid = Object.values(nextErrors).every((error) => !error.name && !error.weight);
  return { valid, nextErrors };
}

function validateScoreColumn(scores: string[]) {
  const errors: Record<number, string> = {};
  let valid = true;

  scores.forEach((score, index) => {
    if (score.trim() === '') {
      errors[index] = 'Yêu cầu nhập điểm';
      valid = false;
      return;
    }
    const value = Number(score);
    if (Number.isNaN(value) || value < 0 || value > 10) {
      errors[index] = 'Điểm phải nằm trong khoảng 0-10';
      valid = false;
    }
  });

  return { valid, errors };
}

function validateScores(columns: GradeColumn[]) {
  const nextErrors: Record<string, GradeErrors> = {};
  let valid = true;

  columns.forEach((col) => {
    const errors: GradeErrors = { scores: {} };
    col.scores.forEach((score, index) => {
      if (score.trim() === '') {
        errors.scores[index] = 'Yêu cầu nhập điểm';
        valid = false;
        return;
      }
      const value = Number(score);
      if (Number.isNaN(value) || value < 0 || value > 10) {
        errors.scores[index] = 'Điểm phải nằm trong khoảng 0-10';
        valid = false;
      }
    });
    nextErrors[col.id] = errors;
  });

  return { valid, nextErrors };
}

export default function GpaScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<DisplayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [gradeColumns, setGradeColumns] = useState<GradeColumn[]>([
    { id: generateUUID(), name: 'Chuyên cần', weight: '10', scores: [''] },
  ]);
  const [savedRuleColumns, setSavedRuleColumns] = useState<GradeColumn[]>([]);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({});
  const [errors, setErrors] = useState<Record<string, GradeErrors>>({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showWeightOptions, setShowWeightOptions] = useState<Record<string, boolean>>({});
  const [showNameOptions, setShowNameOptions] = useState<Record<string, boolean>>({});
  const [showScoreOptions, setShowScoreOptions] = useState<Record<string, Record<number, boolean>>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('@display_classes');
        if (data) {
          const parsed = JSON.parse(data) as DisplayClass[];
          const theoryClasses = parsed.filter((c) => c.type === 'theory');
          setClasses(theoryClasses);
          if (theoryClasses.length > 0) {
            setSelectedClassId(theoryClasses[0].id);
          }
        }

        const progressData = await AsyncStorage.getItem(STORAGE_KEY);
        if (progressData) {
          setProgressMap(JSON.parse(progressData) as Record<string, CourseProgress>);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      return;
    }

    const savedProgress = progressMap[selectedClassId];
    if (savedProgress) {
      const loaded = toGradeColumns(savedProgress.gradeComponents);
      setGradeColumns(loaded);
      setSavedRuleColumns(loaded);
      setScoreInputs(buildScoreInputs(loaded));
      setErrors({});
      setShowWeightOptions({});
      return;
    }

    setGradeColumns([{ id: generateUUID(), name: 'Chuyên cần', weight: '10', scores: [''] }]);
    setSavedRuleColumns([]);
    setScoreInputs({});
    setErrors({});
    setShowWeightOptions({});
  }, [selectedClassId, progressMap]);

  const totalWeight = useMemo(
    () => gradeColumns.reduce((sum, col) => sum + (Number(col.weight) || 0), 0),
    [gradeColumns],
  );

  const totalScore = useMemo(() => {
    return savedRuleColumns.reduce((sum, col) => {
      const scores = scoreInputs[col.id] || [''];
      const validScores = scores
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value) && value >= 0 && value <= 10);
      if (validScores.length === 0) {
        return sum;
      }
      const average = validScores.reduce((total, current) => total + current, 0) / validScores.length;
      const weight = Number(col.weight);
      if (Number.isNaN(weight) || weight <= 0) {
        return sum;
      }
      return sum + (average * weight) / 100;
    }, 0);
  }, [savedRuleColumns, scoreInputs]);

  const addColumn = () => {
    const nextColumns = [
      ...gradeColumns,
      { id: generateUUID(), name: '', weight: '', scores: [''] },
    ];
    setGradeColumns(nextColumns);
    setErrors((prev) => ({ ...prev, ...buildRuleValidationErrors(nextColumns, prev) }));
  };

  const updateColumn = (id: string, field: 'name' | 'weight', value: string) => {
    const nextColumns = gradeColumns.map((col) => (col.id === id ? { ...col, [field]: value } : col));
    setGradeColumns(nextColumns);
    setErrors((prev) => ({ ...prev, ...buildRuleValidationErrors(nextColumns, prev) }));
  };

  const removeColumn = (id: string) => {
    const nextColumns = gradeColumns.filter((col) => col.id !== id);
    setGradeColumns(nextColumns);
    setErrors((prev) => buildRuleValidationErrors(nextColumns, prev));
  };

  const toggleWeightOptions = (id: string) => {
    setShowWeightOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chooseWeight = (id: string, value: number) => {
    updateColumn(id, 'weight', String(value));
    setShowWeightOptions((prev) => ({ ...prev, [id]: false }));
  };

  const toggleNameOptions = (id: string) => {
    setShowNameOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chooseName = (id: string, value: string) => {
    updateColumn(id, 'name', value);
    setShowNameOptions((prev) => ({ ...prev, [id]: false }));
  };

  const toggleScoreOptions = (colId: string, index: number) => {
    setShowScoreOptions((prev) => ({
      ...prev,
      [colId]: { ...prev[colId], [index]: !prev[colId]?.[index] },
    }));
  };

  const chooseScore = (colId: string, index: number, value: number) => {
    handleScoreChange(colId, index, String(value));
    setShowScoreOptions((prev) => ({
      ...prev,
      [colId]: { ...prev[colId], [index]: false },
    }));
  };

  const handleScoreChange = (colId: string, index: number, value: string) => {
    const currentScores = scoreInputs[colId] ?? [''];
    const nextScores = [...currentScores];
    nextScores[index] = value;

    setScoreInputs((current) => ({
      ...current,
      [colId]: nextScores,
    }));

    const scoreValidation = validateScoreColumn(nextScores);
    setErrors((prev) => ({
      ...prev,
      [colId]: {
        ...(prev[colId] ?? { scores: {} }),
        scores: scoreValidation.errors,
      },
    }));
  };

  const addScoreInput = (colId: string) => {
    setScoreInputs((current) => ({
      ...current,
      [colId]: [...(current[colId] || ['']), ''],
    }));
  };

  const removeScoreInput = (colId: string, index: number) => {
    setScoreInputs((current) => {
      const next = (current[colId] || ['']).filter((_, idx) => idx !== index);
      return { ...current, [colId]: next.length > 0 ? next : [''] };
    });
  };

  const saveRules = async () => {
    setStatusMessage('');
    const rules = validateRules(gradeColumns);
    const combinedErrors: Record<string, GradeErrors> = {};

    gradeColumns.forEach((col) => {
      combinedErrors[col.id] = {
        name: rules.nextErrors[col.id]?.name,
        weight: rules.nextErrors[col.id]?.weight,
        scores: {},
      };
    });

    setErrors(combinedErrors);

    if (!rules.valid) {
      setStatusMessage('Vui lòng sửa các trường đỏ trước khi lưu luật.');
      return;
    }

    if (!selectedClassId) {
      setStatusMessage('Chưa chọn môn học để lưu.');
      return;
    }

    setSaving(true);
    try {
      const ruleColumnsToSave = gradeColumns.map((col) => ({
        ...col,
        scores: scoreInputs[col.id] ?? [''],
      }));
      const progress = toCourseProgress(selectedClassId, ruleColumnsToSave);
      const nextProgressMap = { ...progressMap, [selectedClassId]: progress };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgressMap));
      setProgressMap(nextProgressMap);
      setSavedRuleColumns(ruleColumnsToSave);
      setScoreInputs(buildScoreInputs(ruleColumnsToSave, scoreInputs));
      setStatusMessage('Luật điểm đã được lưu.');
    } catch (e) {
      console.error(e);
      setStatusMessage('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRules = () => saveRules();

  const handleSaveScores = async () => {
    setStatusMessage('');
    if (!selectedClassId) {
      setStatusMessage('Chưa chọn môn học để lưu điểm.');
      return;
    }

    const scoreColumns: GradeColumn[] = savedRuleColumns.map((col) => ({
      ...col,
      scores: scoreInputs[col.id] ?? [''],
    }));

    const scoreCheck = validateScores(scoreColumns);
    const combinedErrors: Record<string, GradeErrors> = {};

    savedRuleColumns.forEach((col) => {
      combinedErrors[col.id] = {
        name: undefined,
        weight: undefined,
        scores: scoreCheck.nextErrors[col.id]?.scores ?? {},
      };
    });

    setErrors((prev) => ({ ...prev, ...combinedErrors }));

    if (!scoreCheck.valid) {
      setStatusMessage('Vui lòng sửa các điểm đỏ trước khi lưu.');
      return;
    }

    setSaving(true);
    try {
      const progress = toCourseProgress(selectedClassId, scoreColumns);
      const nextProgressMap = { ...progressMap, [selectedClassId]: progress };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgressMap));
      setProgressMap(nextProgressMap);
      setSavedRuleColumns(scoreColumns);
      setStatusMessage('Điểm đã được lưu.');
    } catch (e) {
      console.error(e);
      setStatusMessage('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Text>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Quản lý Điểm & GPA</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn môn học</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classSelector}>
            {classes.map((cls) => (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết lập Luật điểm</Text>
          <View style={styles.ruleContainer}>
            {gradeColumns.map((col) => {
              const error = errors[col.id] || { name: undefined, weight: undefined, scores: {} };
              return (
                <View key={col.id} style={styles.ruleGroup}>
                  <View style={styles.ruleRow}>
                    <TextInput
                      style={[styles.input, styles.inputName, error.name && styles.invalidInput]}
                      placeholder="Tên cột (VD: Giữa kỳ)"
                      value={col.name}
                      onChangeText={(val) => updateColumn(col.id, 'name', val)}
                    />
                    <TouchableOpacity style={styles.namePickerButton} onPress={() => toggleNameOptions(col.id)}>
                      <Text style={styles.namePickerButtonText}>{showNameOptions[col.id] ? 'v' : '^'}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, styles.inputWeight, error.weight && styles.invalidInput]}
                      placeholder="%"
                      keyboardType="numeric"
                      value={col.weight}
                      onChangeText={(val) => updateColumn(col.id, 'weight', val)}
                    />
                    <TouchableOpacity style={styles.weightPickerButton} onPress={() => toggleWeightOptions(col.id)}>
                      <Text style={styles.weightPickerButtonText}>{showWeightOptions[col.id] ? 'v' : '^'}</Text>
                    </TouchableOpacity>
                    {gradeColumns.length > 1 && (
                      <TouchableOpacity style={styles.deleteButton} onPress={() => removeColumn(col.id)}>
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {showNameOptions[col.id] && (
                    <View style={styles.nameOptionsRow}>
                      {AVAILABLE_NAMES.map((value) => (
                        <TouchableOpacity
                          key={value}
                          style={styles.nameOption}
                          onPress={() => chooseName(col.id, value)}
                        >
                          <Text style={styles.nameOptionText}>{value}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {showWeightOptions[col.id] && (
                    <View style={styles.weightOptionsRow}>
                      {AVAILABLE_WEIGHTS.map((value) => (
                        <TouchableOpacity
                          key={value}
                          style={styles.weightOption}
                          onPress={() => chooseWeight(col.id, value)}
                        >
                          <Text style={styles.weightOptionText}>{value}%</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {error.name ? <Text style={styles.errorText}>{error.name}</Text> : null}
                  {error.weight ? <Text style={styles.errorText}>{error.weight}</Text> : null}
                </View>
              );
            })}

            <TouchableOpacity style={styles.addButton} onPress={addColumn}>
              <Text style={styles.addButtonText}>+ Thêm cột điểm</Text>
            </TouchableOpacity>

            <Text style={styles.weightSummaryText}>Tổng % hiện tại: {totalWeight}%</Text>
            {totalWeight !== 100 ? (
              <Text style={styles.warningText}>Tổng phần trăm nên bằng 100% để tính GPA chính xác.</Text>
            ) : null}
          </View>

          <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSaveRules} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu Luật</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhập Điểm</Text>
          {savedRuleColumns.length === 0 ? (
            <View style={styles.rulesNoticeCard}>
              <Text style={styles.rulesNoticeText}>Bạn cần lưu luật điểm hợp lệ trước khi nhập điểm.</Text>
            </View>
          ) : (
            <>
              <View style={styles.verticalScoresContainer}>
                {savedRuleColumns.map((col) => {
                  const error = errors[col.id] || { name: undefined, weight: undefined, scores: {} };
                  const scores = scoreInputs[col.id] || [''];
                  return (
                    <View key={col.id} style={styles.verticalScoreCard}>
                      <View style={styles.verticalScoreHeader}>
                        <Text style={styles.verticalScoreTitle}>{col.name || 'Chưa đặt tên'}</Text>
                        <Text style={styles.verticalScoreWeight}>{col.weight || '0'}%</Text>
                      </View>

                      {scores.map((score, sIdx) => {
                        const scoreError = error.scores?.[sIdx];
                        return (
                          <View key={sIdx} style={styles.verticalInputRow}>
                            <TextInput
                              style={[styles.verticalScoreInput, scoreError && styles.invalidInput]}
                              placeholder="Nhập điểm (0-10)"
                              keyboardType="decimal-pad"
                              value={score}
                              onChangeText={(val) => handleScoreChange(col.id, sIdx, val)}
                            />
                            <TouchableOpacity style={styles.scorePickerButton} onPress={() => toggleScoreOptions(col.id, sIdx)}>
                              <Text style={styles.scorePickerButtonText}>{showScoreOptions[col.id]?.[sIdx] ? 'v' : '^'}</Text>
                            </TouchableOpacity>
                            {scores.length > 1 && (
                              <TouchableOpacity
                                style={styles.verticalRemoveBtn}
                                onPress={() => removeScoreInput(col.id, sIdx)}
                              >
                                <Text style={styles.verticalRemoveBtnText}>✕</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}

                      {Object.entries(showScoreOptions[col.id] || {}).some(([idx, show]) => show) && (
                        <View style={styles.scoreOptionsRow}>
                          {AVAILABLE_SCORES.map((value) => (
                            <TouchableOpacity
                              key={value}
                              style={styles.scoreOption}
                              onPress={() => {
                                const activeIndex = Object.keys(showScoreOptions[col.id] || {}).find(idx => showScoreOptions[col.id][Number(idx)]);
                                if (activeIndex !== undefined) {
                                  chooseScore(col.id, Number(activeIndex), value);
                                }
                              }}
                            >
                              <Text style={styles.scoreOptionText}>{value}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity style={styles.verticalAddBtn} onPress={() => addScoreInput(col.id)}>
                        <Text style={styles.verticalAddBtnText}>+ Thêm đầu điểm</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <View style={styles.verticalTotalCard}>
                  <Text style={styles.verticalTotalText}>Tổng điểm môn:</Text>
                  <Text style={styles.verticalTotalScore}>{totalScore.toFixed(2)}</Text>
                </View>
              </View>

              {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

              <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSaveScores} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Lưu Điểm</Text>}
              </TouchableOpacity>
            </>
          )}
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
  ruleGroup: { marginBottom: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text || '#333' },
  inputName: { flex: 3 },
  inputWeight: { flex: 1, textAlign: 'center' },
  namePickerButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eef5ff', justifyContent: 'center', alignItems: 'center' },
  namePickerButtonText: { color: Colors.primary, fontWeight: 'bold' },
  weightPickerButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eef5ff', justifyContent: 'center', alignItems: 'center' },
  weightPickerButtonText: { color: Colors.primary, fontWeight: 'bold' },
  nameOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  nameOption: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f6ff' },
  nameOptionText: { color: Colors.primary, fontWeight: '600' },
  weightOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  weightOption: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f6ff' },
  weightOptionText: { color: Colors.primary, fontWeight: '600' },
  deleteButton: { padding: 10, backgroundColor: '#ffeeee', borderRadius: 8 },
  deleteButtonText: { color: '#e74c3c', fontWeight: 'bold' },
  addButton: { marginTop: 10, paddingVertical: 12, backgroundColor: '#eef5ff', borderRadius: 8, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary },
  addButtonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
  invalidInput: { borderColor: '#e74c3c', borderWidth: 1, backgroundColor: '#fff1f0' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 4 },
  weightSummaryText: { marginTop: 10, fontSize: 14, color: Colors.textSecondary || '#666' },
  warningText: { marginTop: 4, fontSize: 13, color: '#e67e22' },
  rulesNoticeCard: { backgroundColor: '#fff6e6', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#f2c27b' },
  rulesNoticeText: { color: '#8a5d25', fontSize: 14, lineHeight: 20 },

  verticalScoresContainer: { gap: 15 },
  verticalScoreCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  verticalScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  verticalScoreTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text || '#333' },
  verticalScoreWeight: { fontSize: 14, color: Colors.primary, fontWeight: 'bold' },
  verticalInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  verticalScoreInput: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15, fontSize: 16, color: Colors.text || '#333' },
  scorePickerButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eef5ff', justifyContent: 'center', alignItems: 'center' },
  scorePickerButtonText: { color: Colors.primary, fontWeight: 'bold' },
  scoreOptionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  scoreOption: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f6ff' },
  scoreOptionText: { color: Colors.primary, fontWeight: '600' },
  verticalRemoveBtn: { backgroundColor: '#ffeeee', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  verticalRemoveBtnText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },
  verticalAddBtn: { marginTop: 5, paddingVertical: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  verticalAddBtnText: { color: Colors.textSecondary || '#666', fontSize: 14, fontWeight: '500' },

  verticalTotalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff5f5', borderRadius: 12, padding: 15, marginTop: 5 },
  verticalTotalText: { fontSize: 16, fontWeight: 'bold', color: Colors.text || '#333' },
  verticalTotalScore: { fontSize: 24, fontWeight: 'bold', color: '#e74c3c' },

  statusText: { marginTop: 12, color: Colors.primary, fontSize: 14 },
  saveButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.7 },
});
