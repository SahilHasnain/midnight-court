import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  lightColors,
  sizing,
  spacing,
  typography,
} from "../theme/designSystem";
import { pinAuth } from "../utils/pinAuth";

export default function PinModal({ visible, onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    const valid = await pinAuth.verifyPin(pin);
    if (valid) {
      await pinAuth.unlock();
      setPin("");
      onSuccess();
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  const handleCancel = () => {
    setPin("");
    setError("");
    onCancel?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="lock-closed"
              size={48}
              color={lightColors.accent.gold}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter PIN</Text>
          <Text style={styles.subtitle}>Access AI Features</Text>

          {/* PIN Input */}
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="••••••"
            placeholderTextColor={lightColors.text.tertiary}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            autoFocus
          />

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={16}
                color={lightColors.accent.error}
              />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              accessibilityLabel="Cancel PIN entry"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              accessibilityLabel="Submit PIN"
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 29, 33, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg, // 24px
  },

  modal: {
    backgroundColor: lightColors.background.primary,
    borderRadius: sizing.radiusXl, // 16px
    padding: spacing.xl, // 32px
    width: "100%",
    maxWidth: 400,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightColors.accent.goldLight,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.lg, // 24px
    borderWidth: sizing.borderMedium, // 2px
    borderColor: lightColors.accent.gold,
  },

  title: {
    ...typography.h2,
    color: lightColors.accent.gold,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.xs, // 4px
  },

  subtitle: {
    ...typography.body,
    color: lightColors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl, // 32px
  },

  input: {
    backgroundColor: lightColors.background.secondary,
    borderWidth: sizing.borderMedium, // 2px
    borderColor: lightColors.background.tertiary,
    borderRadius: sizing.radiusLg, // 12px
    padding: spacing.lg, // 24px
    fontSize: 28,
    color: lightColors.text.primary,
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: spacing.md, // 16px
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    fontWeight: "600",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs, // 4px
    backgroundColor: "rgba(229, 62, 62, 0.08)",
    paddingVertical: spacing.sm, // 8px
    paddingHorizontal: spacing.md, // 16px
    borderRadius: sizing.radiusMd, // 8px
    marginBottom: spacing.md, // 16px
    borderWidth: sizing.borderThin,
    borderColor: "rgba(229, 62, 62, 0.2)",
  },

  error: {
    ...typography.bodySmall,
    color: lightColors.accent.error,
    fontWeight: "500",
  },

  buttons: {
    flexDirection: "row",
    gap: spacing.md, // 16px
    marginTop: spacing.md, // 16px
  },

  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md, // 16px
    borderRadius: sizing.radiusLg, // 12px
    backgroundColor: lightColors.background.secondary,
    borderWidth: sizing.borderThin,
    borderColor: lightColors.background.tertiary,
    alignItems: "center",
    justifyContent: "center",
    minHeight: sizing.touchTarget, // 44px
  },

  cancelText: {
    ...typography.button,
    color: lightColors.text.secondary,
    fontWeight: "600",
  },

  submitButton: {
    flex: 1,
    paddingVertical: spacing.md, // 16px
    borderRadius: sizing.radiusLg, // 12px
    backgroundColor: lightColors.accent.gold,
    alignItems: "center",
    justifyContent: "center",
    minHeight: sizing.touchTarget, // 44px
    shadowColor: lightColors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  submitText: {
    ...typography.button,
    color: lightColors.background.primary,
    fontWeight: "600",
  },
});
