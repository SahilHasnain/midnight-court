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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gold,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    iconOption: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    iconSelected: {
        borderColor: colors.gold,
        backgroundColor: colors.surface,
    },
    iconEmoji: {
        fontSize: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveButton: {
        backgroundColor: colors.gold,
    },
    cancelText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    saveText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
