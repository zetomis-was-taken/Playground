import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * [STUB] Subject Preferences
 * 
 * @TODO_TEAM: Implement logic form thêm môn học và chọn độ khó.
 * 
 * HƯỚNG DẪN THIẾT KẾ STATE:
 * Để xử lý cấu trúc phân nhánh (nested objects) cho thuật toán, bạn nên dùng cấu trúc sau:
 * 
 * type Difficulty = 'Không' | 'Dễ' | 'Trung bình' | 'Cao';
 * 
 * interface SubjectRequirement {
 *   id: string; // uuid
 *   name: string; // Tên môn (VD: Toán)
 *   difficulty: Difficulty;
 *   // Môn học thay thế (Logical OR)
 *   alternatives: string[]; // Mảng các tên môn hoặc id môn có thể thay thế
 *   // Môn học phụ bắt buộc (Logical AND - VD: Thực hành, Bài tập)
 *   corequisites: string[]; 
 * }
 * 
 * const [subjects, setSubjects] = useState<SubjectRequirement[]>([]);
 * 
 * Gợi ý UI: Dùng Modal hoặc BottomSheet để form nhập liệu không chiếm quá nhiều diện tích.
 */
export default function SubjectPreferences() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>3. Cấu hình Môn học & Độ khó</Text>

      {/* Form Giả lập */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tên môn học</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập tên môn (VD: Cấu trúc dữ liệu)" 
          editable={false} // STUB
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Độ khó ưu tiên</Text>
        {/* Giả lập Dropdown */}
        <View style={styles.dropdownStub}>
          <Text style={styles.dropdownText}>Trung bình (▾)</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Môn học thay thế / Yêu cầu đi kèm</Text>
        <TextInput 
          style={styles.input} 
          placeholder="VD: Toán ƯD (Thay thế)" 
          editable={false} // STUB
        />
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Thêm môn học</Text>
      </TouchableOpacity>

      {/* Demo List */}
      <View style={styles.demoList}>
        <Text style={styles.demoItem}>• Giải tích 1 (Dễ)</Text>
        <Text style={styles.demoItem}>• Lập trình Web (Cao) + Thực hành Web</Text>
      </View>
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
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  demoItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  }
});
