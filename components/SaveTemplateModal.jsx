import { colors } from "@/theme/colors";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const EMOJI_OPTIONS = ['📝', '⚖️', '📋', '📜', '🏛️', '⚡', '🎯', '💼'];

export default function SaveTemplateModal({ visible, onClose, onSave }) {
    const [templateName, setTemplateName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('📝');

    const handleSave = () => {
        if (!templateName.trim()) {
            Alert.alert('Error', 'Please enter a template name');
            return;
        }

        onSave(templateName.trim(), description.trim(), selectedIcon);

        // Reset form
        setTemplateName('');
        setDescription('');
        setSelectedIcon('📝');
    };

    const handleCancel = () => {
        setTemplateName('');
        setDescription('');
        setSelectedIcon('📝');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Save as Template</Text>

                    <Text style={styles.label}>Template Name</Text>
                    <TextInput
                        style={styles.input}
                        value={templateName}
                        onChangeText={setTemplateName}
                        placeholder="e.g., My Argument Structure"
                        placeholderTextColor={colors.textSecondary}
                        maxLength={50}
                    />

                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Brief description of this template..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        maxLength={150}
                    />

                    <Text style={styles.label}>Icon</Text>
                    <View style={styles.iconGrid}>
                        {EMOJI_OPTIONS.map(emoji => (
                            <TouchableOpacity
                                key={emoji}
                                style={[
                                    styles.iconOption,
                                    selectedIcon === emoji && styles.iconSelected
                                ]}
                                onPress={() => setSelectedIcon(emoji)}
                            >
                                <Text style={styles.iconEmoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveText}>Save Template</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 24,
        width: '100%',
        maxWidth: 420,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: 'PlayfairDisplay',
        color: colors.gold,
        marginBottom: 20,
        textAlign: 'center',
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    label: {
        fontSize: 13,
        color: colors.gold,
        opacity: 0.95,
        letterSpacing: 0.2,
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: colors.textPrimary,
        fontFamily: 'Inter_400Regular',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    iconOption: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(212, 175, 55, 0.2)',
        backgroundColor: colors.background,
    },
    iconSelected: {
        borderColor: 'rgba(212, 175, 55, 0.6)',
        backgroundColor: colors.surface,
    },
    iconEmoji: {
        fontSize: 26,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 28,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    saveButton: {
        backgroundColor: colors.gold,
    },
    cancelText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    saveText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
    },
});
