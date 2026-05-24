import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  value: number | null;
  onConfirm: (ts: number) => void;
  onCancel: () => void;
  minDate?: number;
  maxDate?: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns the 0-based weekday (0 = Sun) of the first day of the month. */
function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePickerModal({ visible, value, onConfirm, onCancel, minDate, maxDate }: Props) {
  const colors = useColors();

  const initial = value ? new Date(value) : new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selectedDay, setSelectedDay] = useState(initial.getDate());

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const maxYear = todayY + 10;
  const minYear = todayY - 1;

  function prevMonth() {
    if (month === 0) { if (year > minYear) { setMonth(11); setYear((y) => y - 1); } }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { if (year < maxYear) { setMonth(0); setYear((y) => y + 1); } }
    else setMonth((m) => m + 1);
  }

  function handleDayPress(day: number) {
    setSelectedDay(day);
  }

  function handleConfirm() {
    // Use noon local time to avoid off-by-one date shifts from timezone offsets.
    const d = new Date(year, month, selectedDay, 12, 0, 0, 0);
    const ts = d.getTime();
    if (minDate && ts < minDate) return;
    if (maxDate && ts > maxDate) return;
    onConfirm(ts);
  }

  const numDays = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);

  // Build a flat array of cells: nulls for leading empty slots, then 1..numDays
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];
  // Pad to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  const safeSelected = Math.min(selectedDay, numDays);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderRadius: colors.radius },
            Platform.OS === "web" ? { maxWidth: 360 } : {},
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Month / Year navigation */}
          <View style={styles.navRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={prevMonth}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather name="chevron-left" size={22} color={colors.foreground} />
            </Pressable>

            <Text style={[styles.monthLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {MONTHS[month]} {year}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={nextMonth}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather name="chevron-right" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View style={styles.grid}>
            {DOW.map((d) => (
              <View key={d} style={styles.cell}>
                <Text style={[styles.dowText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {d}
                </Text>
              </View>
            ))}

            {/* Day cells */}
            {cells.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.cell} />;
              }

              const isSelected = day === safeSelected;
              const isToday = day === todayD && month === todayM && year === todayY;

              let cellBg = "transparent";
              if (isSelected) cellBg = colors.primary;
              else if (isToday) cellBg = colors.secondary;

              const textColor = isSelected ? "#fff" : isToday ? colors.primary : colors.foreground;

              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityLabel={`${MONTHS[month]} ${day}, ${year}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleDayPress(day)}
                  style={({ pressed }) => [
                    styles.cell,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={[
                    styles.dayCircle,
                    { backgroundColor: cellBg, borderRadius: 999 },
                  ]}>
                    <Text style={[
                      styles.dayText,
                      {
                        color: textColor,
                        fontFamily: isSelected || isToday ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}>
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.secondary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ color: colors.secondaryForeground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm date"
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.btn,
                { flex: 1, backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                Confirm
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    padding: 20,
    gap: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthLabel: {
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dowText: {
    fontSize: 12,
    paddingVertical: 4,
  },
  dayCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});
