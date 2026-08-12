import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { TaskComment } from "@/types";
import { formatDateTime } from "@/utils/dates";

interface Props {
  taskId: string;
  comments: TaskComment[];
}

export function CommentSection({ taskId, comments }: Props) {
  const colors = useColors();
  const { users, currentUser } = useAuth();
  const { addComment } = useTasks();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await addComment(taskId, trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </Text>

      {comments.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          No comments yet.
        </Text>
      )}

      {comments.map((comment) => {
        const author = users.find((u) => u.id === comment.authorId) ?? null;
        return (
          <View key={comment.id} style={[styles.comment, { borderTopColor: colors.border }]}>
            <Avatar user={author} size={28} fallbackLabel="?" />
            <View style={styles.commentBody}>
              <View style={styles.commentMeta}>
                <Text style={[styles.authorName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {author?.name ?? "Unknown"}
                </Text>
                <Text style={[styles.timestamp, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {formatDateTime(comment.createdAt)}
                </Text>
              </View>
              <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {comment.text}
              </Text>
            </View>
          </View>
        );
      })}

      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Avatar user={currentUser} size={28} />
        <TextInput
          accessibilityLabel="Add a comment"
          placeholder="Add a comment…"
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Post comment"
          onPress={handleSend}
          disabled={!text.trim() || sending}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed || !text.trim() || sending ? 0.4 : 1 })}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="send" size={18} color={colors.primary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  heading: {
    fontSize: 13,
  },
  empty: {
    fontSize: 14,
  },
  comment: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  authorName: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    minHeight: 36,
    maxHeight: 120,
  },
});
