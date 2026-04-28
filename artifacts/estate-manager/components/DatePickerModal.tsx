import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
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
  onClose: () => void;
  onSelect: (timestamp: number) => void;
  onClear?: () => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function DatePickerModal({
  visible,
  value,
  onClose,
  onSelect,
  onClear,
}: Props) {
  const colors = useColors();
  const initial = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  React.useEffect(() => {
    if (visible) {
      const d = value ? new Date(value) : new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [visible, value]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: ({ day: number; ts: number } | null)[] = [];
    for (let i = 0; i < startWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(viewYear, viewMonth, day, 17, 0, 0, 0);
      cells.push({ day, ts: d.getTime() });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const todayKey = startOfDay(Date.now());
  const selectedKey = value ? startOfDay(value) : null;

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  function jumpToToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderRadius: colors.radius,
              ...(Platform.OS === "web" ? { maxWidth: 380 } : {}),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.navBtn,
                {
                  backgroundColor: colors.secondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="chevron-left" size={18} color={colors.secondaryForeground} />
            </Pressable>
            <Pressable onPress={jumpToToday} hitSlop={6}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_700Bold",
                  fontSize: 17,
                }}
              >
                {MONTHS[viewMonth]} {viewYear}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => shiftMonth(1)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.navBtn,
                {
                  backgroundColor: colors.secondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="chevron-right" size={18} color={colors.secondaryForeground} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <Text
                key={i}
                style={[
                  styles.weekday,
                  {
                    color: colors.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((cell, idx) => {
              if (!cell) return <View key={idx} style={styles.cell} />;
              const cellKey = startOfDay(cell.ts);
              const isToday = cellKey === todayKey;
              const isSelected = selectedKey === cellKey;
              return (
                <Pressable
                  key={idx}
                  onPress={() => {
                    onSelect(cell.ts);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.cell,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isToday
                        ? colors.secondary
                        : "transparent",
                      borderRadius: 999,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? "#fff"
                        : isToday
                        ? colors.primary
                        : colors.foreground,
                      fontFamily: isSelected || isToday
                        ? "Inter_700Bold"
                        : "Inter_500Medium",
                      fontSize: 14,
                    }}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            {onClear ? (
              <Pressable
                onPress={() => {
                  onClear();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.footerBtn,
                  {
                    backgroundColor: colors.secondary,
                    borderRadius: colors.radius,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.secondaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  Clear date
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                  flex: 1,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.secondaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
