import { Colors } from '@/constants/theme';
import { DisplayClass } from '@/src/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<DisplayClass[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Markdown note state mockup
  const [noteContent, setNoteContent] = useState('');
  const [bonusPoints, setBonusPoints] = useState(0);
  const [isAbsent, setIsAbsent] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('@display_classes');
        if (data) {
          setClasses(JSON.parse(data));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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

  // Chứa danh sách mockup hiển thị (Vì cần lọc theo ngày hiện tại, nhưng cho mục đích layout ta sẽ hiển thị 2-3 môn đầu tiên)
  const todayClasses = classes.slice(0, 3);
  const currentClass = todayClasses[0]; // Giả định môn đầu tiên đang diễn ra

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - Thời gian hiện tại */}
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.timeText}>
            {currentTime.toLocaleTimeString('vi-VN')}
          </Text>
        </View>

        {/* Danh sách môn học hôm nay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch học hôm nay</Text>
          {todayClasses.map((cls, idx) => {
            const isHighlight = idx === 0; // Highlight môn đầu tiên
            return (
              <View key={cls.id} style={[styles.classCard, isHighlight && styles.classCardHighlight]}>
                <View>
                  <Text style={[styles.className, isHighlight && styles.textHighlight]}>{cls.subjectName}</Text>
                  <Text style={[styles.classDetail, isHighlight && styles.textHighlight]}>Lớp: {cls.className} | Phòng: {cls.location}</Text>
                  <Text style={[styles.classType, isHighlight && styles.textHighlight]}>
                    {cls.type === 'theory' ? 'Lý thuyết' : cls.type === 'practice' ? 'Thực hành' : 'Bài tập'}
                  </Text>
                </View>
                {isHighlight && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>ĐANG HỌC</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Layout Ghi chú Markdown */}
        {currentClass && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Ghi chú buổi học: {currentClass.subjectName}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setBonusPoints(p => p + 1)}>
                <Text style={styles.actionButtonText}>+1 Điểm ({bonusPoints})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isAbsent && styles.absentButtonActive]}
                onPress={() => setIsAbsent(!isAbsent)}>
                <Text style={[styles.actionButtonText, isAbsent && styles.textWhite]}>
                  {isAbsent ? 'Đã đánh vắng' : 'Đánh vắng'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.markdownInput}
              multiline
              placeholder="Viết ghi chú (hỗ trợ Markdown)..."
              value={noteContent}
              onChangeText={setNoteContent}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Lưu Ghi Chú</Text>
            </TouchableOpacity>
          </View>
        )}
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

  header: { alignItems: 'center', marginBottom: 30 },
  dateText: { fontSize: 16, color: Colors.textSecondary || '#666', marginBottom: 5, textTransform: 'capitalize' },
  timeText: { fontSize: 36, fontWeight: 'bold', color: Colors.primary },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text || '#333', marginBottom: 15 },

  classCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  classCardHighlight: { backgroundColor: Colors.primary, borderColor: Colors.primary, borderWidth: 1 },
  className: { fontSize: 16, fontWeight: 'bold', color: Colors.text || '#333', marginBottom: 4 },
  classDetail: { fontSize: 14, color: Colors.textSecondary || '#666', marginBottom: 4 },
  classType: { fontSize: 12, color: Colors.textSecondary || '#666', fontStyle: 'italic' },
  textHighlight: { color: '#fff' },
  liveBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: 'bold', color: Colors.primary },

  noteSection: { backgroundColor: '#fff', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  actionButton: { flex: 1, paddingVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: Colors.text || '#333' },
  absentButtonActive: { backgroundColor: '#e74c3c' },
  textWhite: { color: '#fff' },

  markdownInput: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 15, minHeight: 150, fontSize: 16, color: Colors.text || '#333', marginBottom: 15 },

  saveButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
