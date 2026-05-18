import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePickerModal({ visible, value, onConfirm, onCancel, minDate, maxDate }: Props) {
  const colors = useColors();
  const now = value ? new Date(value) : new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours() === 0 ? 12 : now.getHours());
  const [minute, setMinute] = useState(MINUTES.reduce((prev, curr) =>
    Math.abs(curr - now.getMinutes()) < Math.abs(prev - now.getMinutes()) ? curr : prev
  ));

  const numDays = daysInMonth(year, month);
  const safeDay = Math.min(day, numDays);

  const maxYear = new Date().getFullYear() + 10;
  const minYear = new Date().getFullYear() - 1;

  function handleConfirm() {
    const d = new Date(year, month, safeDay, hour, minute, 0, 0);
    const ts = d.getTime();
    if (minDate && ts < minDate) return;
    if (maxDate && ts > maxDate) return;
    onConfirm(ts);
  }

  const cardBg = { backgroundColor: colors.card, borderRadius: colors.radius };
  const labelStyle = { color: colors.mutedForeground, fontFamily: "Inter_500Medium" as const, fontSize: 12 };
  const valueStyle = { color: colors.foreground, fontFamily: "Inter_600SemiBold" as const, fontSize: 15 };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderRadius: colors.radius },
            Platform.OS === "web" ? { maxWidth: 420 } : {},
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Pick a date & time
          </Text>

          {/* Month / Year row */}
          <View style={styles.row}>
            <View style={[styles.pickerCol, cardBg]}>
              <Text style={labelStyle}>Month</Text>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  onPress={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
                </Pressable>
                <Text style={valueStyle}>{MONTHS[month].slice(0, 3)}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  onPress={() => setMonth((m) => (m === 11 ? 0 : m + 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.pickerCol, cardBg]}>
              <Text style={labelStyle}>Day</Text>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous day"
                  onPress={() => setDay((d) => (d === 1 ? numDays : d - 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
                </Pressable>
                <Text style={valueStyle}>{safeDay}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next day"
                  onPress={() => setDay((d) => (d === numDays ? 1 : d + 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.pickerCol, cardBg]}>
              <Text style={labelStyle}>Year</Text>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous year"
                  onPress={() => setYear((y) => Math.max(minYear, y - 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
                </Pressable>
                <Text style={valueStyle}>{year}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next year"
                  onPress={() => setYear((y) => Math.min(maxYear, y + 1))}
                  hitSlop={8}
                >
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Time row */}
          <View style={[styles.row, { marginTop: 8 }]}>
            <View style={[styles.pickerCol, cardBg]}>
              <Text style={labelStyle}>Hour</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollPicker}
              >
                {HOURS.map((h) => (
                  <Pressable
                    key={h}
                    accessibilityRole="radio"
                    accessibilityLabel={`${h}:00`}
                    accessibilityState={{ checked: hour === h }}
                    onPress={() => setHour(h)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor: hour === h ? colors.primary : colors.secondary,
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: hour === h ? "#fff" : colors.secondaryForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                      }}
                    >
                      {pad(h)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.pickerCol, cardBg]}>
              <Text style={labelStyle}>Min</Text>
              <View style={styles.stepper}>
                {MINUTES.map((m) => (
                  <Pressable
                    key={m}
                    accessibilityRole="radio"
                    accessibilityLabel={`${m} minutes`}
                    accessibilityState={{ checked: minute === m }}
                    onPress={() => setMinute(m)}
                    style={[
                      styles.timePill,
                      {
                        backgroundColor: minute === m ? colors.primary : colors.secondary,
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: minute === m ? "#fff" : colors.secondaryForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                      }}
                    >
                      :{pad(m)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

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
              accessibilityLabel="Confirm date and time"
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
    gap: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  pickerCol: {
    flex: 1,
    padding: 10,
    gap: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scrollPicker: {
    flexDirection: "row",
    gap: 4,
    paddingBottom: 2,
  },
  timePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});
