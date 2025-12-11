import { colors } from "@/theme/colors";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * TimelineBlock - Vertical timeline for case progression
 * Chunk 7: Timeline Block
 */
export default function TimelineBlock({ block, onUpdate, onDelete }) {
    const [showPreview, setShowPreview] = useState(false);

    const updateEvent = (index, field, value) => {
        const newEvents = [...block.data.events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        onUpdate({
            ...block,
            data: { ...block.data, events: newEvents }
        });
    };

    const addEvent = () => {
        const newEvents = [...block.data.events, { date: '', event: '' }];
        onUpdate({
            ...block,
            data: { ...block.data, events: newEvents }
        });
    };

    const deleteEvent = (index) => {
        if (block.data.events.length > 1) {
            const newEvents = block.data.events.filter((_, i) => i !== index);
            onUpdate({
                ...block,
                data: { ...block.data, events: newEvents }
            });
        }
    };

    // Parse markdown for preview
    const parseFormattedText = (text) => {
        if (!text) return [{ text: '', color: null }];

        const parts = [];
        let currentIndex = 0;
        const regex = /(\*[^*]+\*|~[^~]+~|_[^_]+_)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > currentIndex) {
                parts.push({
                    text: text.substring(currentIndex, match.index),
                    color: null
                });
            }

            const matched = match[0];
            if (matched.startsWith('*') && matched.endsWith('*')) {
                parts.push({ text: matched.slice(1, -1), color: colors.gold });
            } else if (matched.startsWith('~') && matched.endsWith('~')) {
                parts.push({ text: matched.slice(1, -1), color: '#ef4444' });
            } else if (matched.startsWith('_') && matched.endsWith('_')) {
                parts.push({ text: matched.slice(1, -1), color: '#3b82f6' });
            }

            currentIndex = match.index + matched.length;
        }

        if (currentIndex < text.length) {
            parts.push({
                text: text.substring(currentIndex),
                color: null
            });
        }

        return parts.length > 0 ? parts : [{ text, color: null }];
    };

    return (
        <View style={styles.container}>
            {/* Header with Delete */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>📅 Timeline</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => setShowPreview(!showPreview)}
                        style={styles.previewToggle}
                    >
                        <Text style={styles.previewToggleText}>
                            {showPreview ? '✏️' : '👁️'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showPreview ? (
                // Preview Mode - Vertical timeline with connector
                <View style={styles.previewContainer}>
                    {block.data.events.filter(e => e.date || e.event).map((event, idx) => (
                        <View key={idx} style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            {idx < block.data.events.length - 1 && (
                                <View style={styles.timelineConnector} />
                            )}
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineDate}>{event.date || 'No date'}</Text>
                                <Text style={styles.timelineEvent}>
                                    {parseFormattedText(event.event || 'No event').map((part, i) => (
                                        <Text key={i} style={{ color: part.color || colors.textSecondary }}>
                                            {part.text}
                                        </Text>
                                    ))}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                // Edit Mode
                <View style={styles.editContainer}>
                    {block.data.events.map((event, index) => (
                        <View key={index} style={styles.eventRow}>
                            <View style={styles.eventInputs}>
                                <TextInput
                                    value={event.date}
                                    onChangeText={(text) => updateEvent(index, 'date', text)}
                                    placeholder="Date (e.g., 15 Jan 2024)"
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.dateInput}
                                />
                                <TextInput
                                    value={event.event}
                                    onChangeText={(text) => updateEvent(index, 'event', text)}
                                    placeholder="Event description..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={styles.eventInput}
                                    multiline
                                />
                            </View>
                            {block.data.events.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => deleteEvent(index)}
                                    style={styles.deleteEventButton}
                                >
                                    <Text style={styles.deleteEventText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity onPress={addEvent} style={styles.addEventButton}>
                        <Text style={styles.addEventText}>+ Add Event</Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>*gold* ~red~ _blue_</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    },
    headerLabel: {
        color: colors.gold,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    previewToggle: {
        backgroundColor: colors.gold,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    previewToggleText: {
        fontSize: 14,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    editContainer: {
        gap: 12,
    },
    eventRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    eventInputs: {
        flex: 1,
        gap: 8,
    },
    dateInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        opacity: 0.95,
        letterSpacing: 0.2,
    },
    eventInput: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    deleteEventButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    deleteEventText: {
        color: '#ef4444',
        fontSize: 14,
    },
    addEventButton: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.25)',
        alignItems: 'center',
    },
    addEventText: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    hint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
    },
    previewContainer: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        position: 'relative',
        minHeight: 80,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.gold,
        marginTop: 4,
        zIndex: 2,
        borderWidth: 2,
        borderColor: colors.background,
    },
    timelineConnector: {
        position: 'absolute',
        left: 5,
        top: 16,
        bottom: 0,
        width: 2,
        backgroundColor: colors.borderGold,
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        marginLeft: 16,
        paddingBottom: 16,
    },
    timelineDate: {
        color: colors.gold,
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'Inter_700Bold',
        marginBottom: 6,
    },
    timelineEvent: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
    },
});
