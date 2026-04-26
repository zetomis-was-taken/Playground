import { Difficulty, useSchedulerContext } from "@/src/state/scheduler-context";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function generateId() {
  return `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "none", label: "Không" },
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
];

const DAY_LABELS: Record<string, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
};

function formatSchedules(
  schedules: { dayOfWeek: string; startPeriod: number; endPeriod: number }[],
) {
  return schedules
    .map(
      (item) =>
        `${DAY_LABELS[item.dayOfWeek] || item.dayOfWeek}: T${item.startPeriod}-${item.endPeriod}`,
    )
    .join(" | ");
}

function difficultyLabel(value: Difficulty) {
  return (
    DIFFICULTY_OPTIONS.find((item) => item.value === value)?.label || "Không"
  );
}

export default function SubjectPreferences() {
  const {
    classes,
    requiredSubjectGroups,
    addRequiredSubjectGroup,
    removeRequiredSubjectGroup,
  } = useSchedulerContext();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("none");
  const [isSubjectListOpen, setIsSubjectListOpen] = useState(false);

  const subjectRows = useMemo(() => {
    const map = new Map<
      string,
      { subjectId: string; subjectName: string; schedulesText: string }
    >();

    classes.forEach((cls) => {
      if (!map.has(cls.subjectId)) {
        map.set(cls.subjectId, {
          subjectId: cls.subjectId,
          subjectName: cls.subjectName,
          schedulesText: formatSchedules(cls.schedules),
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.subjectId.localeCompare(b.subjectId),
    );
  }, [classes]);

  const selectedSubject = useMemo(
    () => subjectRows.find((row) => row.subjectId === selectedSubjectId),
    [selectedSubjectId, subjectRows],
  );

  const handleAddSubject = () => {
    if (!selectedSubject) {
      return;
    }

    const duplicated = requiredSubjectGroups.some(
      (group) => group.options[0]?.subjectId === selectedSubject.subjectId,
    );

    if (duplicated) {
      return;
    }

    addRequiredSubjectGroup({
      id: generateId(),
      label: `${selectedSubject.subjectId} - ${selectedSubject.subjectName}`,
      options: [
        {
          subjectId: selectedSubject.subjectId,
          difficulty: selectedDifficulty,
        },
      ],
    });

    setSelectedSubjectId(null);
    setSelectedDifficulty("none");
    setIsSubjectListOpen(false);
  };

  const renderSubjectOption = (subject: {
    subjectId: string;
    subjectName: string;
    schedulesText: string;
  }) => {
    const isSelected = subject.subjectId === selectedSubject?.subjectId;

    return (
      <TouchableOpacity
        key={subject.subjectId}
        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
        onPress={() => {
          setSelectedSubjectId(subject.subjectId);
          setIsSubjectListOpen(false);
        }}
      >
        <Text style={styles.optionCode}>
          {subject.subjectId} - {subject.subjectName}
        </Text>
        <Text style={styles.optionName}>
          {subject.schedulesText || "Chưa có lịch"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>3. Danh sách môn học ưu tiên</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Chọn môn học từ danh sách đã upload</Text>
        {subjectRows.length === 0 ? (
          <Text style={styles.hint}>
            Chưa có danh sách môn. Hãy upload file lịch học trước.
          </Text>
        ) : (
          <>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setIsSubjectListOpen((prev) => !prev)}
            >
              <View style={styles.selectorContent}>
                <Text style={styles.selectorText}>
                  {selectedSubject
                    ? `${selectedSubject.subjectId} - ${selectedSubject.subjectName}`
                    : "Sổ xuống để chọn môn học"}
                </Text>
                <Text style={styles.selectorArrow}>
                  {isSubjectListOpen ? "▲" : "▼"}
                </Text>
              </View>
            </TouchableOpacity>

            {isSubjectListOpen ? (
              <View style={styles.selectorList}>
                <ScrollView nestedScrollEnabled style={styles.selectorScroll}>
                  {subjectRows.map(renderSubjectOption)}
                </ScrollView>
              </View>
            ) : null}
            {selectedSubject ? (
              <Text style={styles.hint}>
                Lịch học: {selectedSubject.schedulesText}
              </Text>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Chọn độ khó cho môn này</Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.difficultyChip,
                selectedDifficulty === option.value &&
                  styles.difficultyChipActive,
              ]}
              onPress={() => setSelectedDifficulty(option.value)}
            >
              <Text
                style={[
                  styles.difficultyChipText,
                  selectedDifficulty === option.value &&
                    styles.difficultyChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.finalAddButton}
        onPress={handleAddSubject}
      >
        <Text style={styles.finalAddButtonText}>+ Thêm môn học</Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {requiredSubjectGroups.length === 0 ? (
          <Text style={styles.emptyText}>
            Chưa có môn ưu tiên. Hãy thêm ít nhất 1 môn.
          </Text>
        ) : (
          requiredSubjectGroups.map((item) => (
            <View key={item.id} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{item.label}</Text>
                <TouchableOpacity
                  onPress={() => removeRequiredSubjectGroup(item.id)}
                >
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              </View>
              {(() => {
                const selected = subjectRows.find(
                  (row) => row.subjectId === item.options[0]?.subjectId,
                );
                if (!selected) {
                  return (
                    <Text style={styles.subjectDetail}>
                      Không tìm thấy thông tin lịch học
                    </Text>
                  );
                }

                return (
                  <>
                    <Text style={styles.subjectDetail}>
                      Độ khó:{" "}
                      {difficultyLabel(item.options[0]?.difficulty || "none")}
                    </Text>
                    <Text style={styles.subjectDetail}>
                      {selected.schedulesText}
                    </Text>
                  </>
                );
              })()}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F9F9F9",
    color: "#333",
  },
  hint: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9F9F9",
  },
  selectorText: {
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectorArrow: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
  },
  selectorList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FFF",
    maxHeight: 180,
  },
  selectorScroll: {
    maxHeight: 180,
  },
  optionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionRowSelected: {
    backgroundColor: "#EAF4FF",
  },
  optionCode: {
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  optionName: {
    color: "#666",
    fontSize: 12,
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  difficultyChip: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
  },
  difficultyChipActive: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  difficultyChipText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  difficultyChipTextActive: {
    color: "#2E7D32",
  },
  finalAddButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  finalAddButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  listContainer: {
    marginTop: 14,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
  },
  subjectCard: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  deleteText: {
    color: "#FF5252",
    fontWeight: "600",
    fontSize: 13,
    paddingHorizontal: 4,
  },
  subjectDetail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
