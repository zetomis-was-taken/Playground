import { useSchedulerContext } from "@/src/state/scheduler-context";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CellState = "none" | "free" | "busy";

export default function TimeSlotSelector() {
  const { timeSlotStates, setTimeSlotStates } = useSchedulerContext();
  const days = ["T2", "T3", "T4", "T5", "T6", "T7"];
  const periods = Array.from({ length: 10 }, (_, i) => i + 1);

  const handlePressCell = (day: string, period: number) => {
    const key = `${day}-${period}`;
    const currentState = (timeSlotStates[key] || "none") as CellState;

    let nextState: CellState = "none";
    if (currentState === "none") nextState = "free";
    else if (currentState === "free") nextState = "busy";
    else nextState = "none";

    setTimeSlotStates({
      ...timeSlotStates,
      [key]: nextState,
    });
  };

  const getCellColor = (state: CellState) => {
    switch (state) {
      case "free":
        return "#C8E6C9"; // Xanh lá
      case "busy":
        return "#FFCDD2"; // Đỏ nhạt
      default:
        return "#FAFAFA"; // Trắng ngà
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>2. Chọn thời gian rảnh / bận</Text>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#FAFAFA" }]} />
          <Text style={styles.legendText}>Trống</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#C8E6C9" }]} />
          <Text style={styles.legendText}>Rảnh</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#FFCDD2" }]} />
          <Text style={styles.legendText}>Bận</Text>
        </View>
      </View>
      <Text style={styles.hint}>Chạm vào các ô để đổi trạng thái</Text>

      <View style={styles.gridContainer}>
        {/* Header Ngày */}
        <View style={styles.row}>
          <View style={styles.headerCorner} />
          {days.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.headerText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Các dòng (Tiết) */}
        {periods.map((period) => (
          <View key={`period-${period}`} style={styles.row}>
            <View style={styles.periodHeader}>
              <Text style={styles.headerText}>T{period}</Text>
            </View>

            {/* Các ô (Cells) */}
            {days.map((day) => {
              const key = `${day}-${period}`;
              const state = (timeSlotStates[key] || "none") as CellState;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.cell,
                    { backgroundColor: getCellColor(state) },
                  ]}
                  onPress={() => handlePressCell(day, period)}
                />
              );
            })}
          </View>
        ))}
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
    color: "#333",
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#555",
  },
  hint: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
  },
  gridContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  headerCorner: {
    width: 40,
    backgroundColor: "#F0F0F0",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  dayHeader: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  periodHeader: {
    width: 40,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
  },
  cell: {
    flex: 1,
    height: 30, // Chiều cao cố định để demo
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
});
