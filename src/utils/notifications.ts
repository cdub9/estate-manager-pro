import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { supabase } from "@/lib/supabase";

/**
 * Request permission and register this device's Expo Push Token in Supabase.
 * Called after login/register. Safe to call multiple times — silently skips
 * if running in a simulator or if the user denies permission.
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
  // Push tokens only work on physical devices
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    await supabase
      .from("profiles")
      .update({ push_token: data })
      .eq("id", userId);
  } catch (err) {
    // Non-critical — log and move on
    console.warn("Could not register push token:", err);
  }
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Send an assignment notification to one or more Expo push tokens.
 * Fire-and-forget — never throws.
 */
export async function sendAssignmentNotification(
  tokens: string[],
  taskTitle: string,
  assignerName: string,
  taskId: string,
): Promise<void> {
  if (tokens.length === 0) return;

  const messages: PushMessage[] = tokens.map((token) => ({
    to: token,
    title: "New task assigned",
    body: `${assignerName} assigned you to "${taskTitle}"`,
    data: { taskId },
  }));

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.warn("Could not send push notification:", err);
  }
}
