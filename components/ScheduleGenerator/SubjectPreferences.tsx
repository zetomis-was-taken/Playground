import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * [STUB] Subject Preferences
 * 
 * @TODO_TEAM: Implement logic form thêm môn học và chọn độ khó.
 * 
 * HƯỚNG DẪN THIẾT KẾ STATE:
 * Tính năng này cho phép người dùng cấu hình một **danh sách (array)** các môn họ muốn học.
 * State chính sẽ là một array các Object, giúp dễ dàng map() ra UI và thêm/xóa tùy thích.
 * 
 * type Difficulty = 'Không' | 'Dễ' | 'Trung bình' | 'Cao';
 * 
 * interface SubjectRequirement {
 *   id: string; // uuid
 *   name: string; // Tên môn (VD: Lập trình Web)
 *   difficulty: Difficulty;
 *   // Môn học thay thế (Logical OR - VD: Có thể đổi sang học Mobile)
 *   alternatives: string[]; // Mảng các tên môn hoặc id môn có thể thay thế
 *   // Môn học phụ bắt buộc (Logical AND - VD: Bắt buộc kèm Thực hành Web)
 *   corequisites: string[]; 
 * }
 * 
 * const [subjects, setSubjects] = useState<SubjectRequirement[]>([]);
 * 
 * Gợi ý UI: Khi bấm "+ Thêm môn học", mở một Modal/BottomSheet form để điền, sau đó push vào array `subjects`.
 */
export default function SubjectPreferences() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>3. Danh sách môn học ưu tiên</Text>

      <View style={styles.demoList}>
        {/* Item 1 */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>Giải tích 1</Text>
            <TouchableOpacity><Text style={styles.deleteText}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.subjectDetail}>Độ khó: Dễ</Text>
        </View>

        {/* Item 2 */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>Lập trình Web</Text>
            <TouchableOpacity><Text style={styles.deleteText}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.subjectDetail}>Độ khó: Cao</Text>
          <Text style={styles.subjectDetail}>Yêu cầu đi kèm: Thực hành Web</Text>
        </View>

        {/* Item 3 */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectName}>Tư tưởng Hồ Chí Minh</Text>
            <TouchableOpacity><Text style={styles.deleteText}>✕</Text></TouchableOpacity>
          </View>
          <Text style={styles.subjectDetail}>Độ khó: Trung bình</Text>
          <Text style={styles.subjectDetail}>Thay thế: Triết học Mác-Lênin</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Thêm môn học</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
    color: '#333',
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
    color: '#999',
  },
  dropdownStub: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9F9F9',
  },
  dropdownText: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  demoList: {
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteText: {
    color: '#FF5252',
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  subjectDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  }
});
