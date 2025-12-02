import { colors } from "@/theme/colors";
import { deleteCustomTemplate, getAllTemplates, getCustomTemplates } from "@/utils/templateData";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TemplateScreen() {
    const [selectedTab, setSelectedTab] = useState('quick'); // 'quick', 'full', or 'custom'
    const [customTemplates, setCustomTemplates] = useState([]);
    const templates = getAllTemplates();

    // Load custom templates
    useEffect(() => {
        loadCustomTemplates();
    }, []);

    const loadCustomTemplates = async () => {
        const customs = await getCustomTemplates();
        setCustomTemplates(Object.values(customs));
    };

    const handleDeleteCustomTemplate = async (templateId, templateName) => {
        Alert.alert(
            'Delete Template',
            `Are you sure you want to delete "${templateName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCustomTemplate(templateId);
                            await loadCustomTemplates();
                            Alert.alert('Success', 'Template deleted successfully');
                        } catch (_error) {
                            Alert.alert('Error', 'Failed to delete template');
                        }
                    }
                }
            ]
        );
    };

    const currentTemplates =
        selectedTab === 'quick' ? templates.quick :
            selectedTab === 'full' ? templates.full :
                customTemplates;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.heading}>Choose Your Template</Text>
                <View style={styles.goldLine} />
                <Text style={styles.subheading}>
                    Every great argument begins with structure
                </Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'quick' && styles.tabActive]}
                    onPress={() => setSelectedTab('quick')}
                >
                    <Text style={[styles.tabText, selectedTab === 'quick' && styles.tabTextActive]}>
                        Quick Start
                    </Text>
                    <Text style={styles.tabHint}>1-2 slides</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'full' && styles.tabActive]}
                    onPress={() => setSelectedTab('full')}
                >
                    <Text style={[styles.tabText, selectedTab === 'full' && styles.tabTextActive]}>
                        Full Presentation
                    </Text>
                    <Text style={styles.tabHint}>5-7 slides</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'custom' && styles.tabActive]}
                    onPress={() => setSelectedTab('custom')}
                >
                    <Text style={[styles.tabText, selectedTab === 'custom' && styles.tabTextActive]}>
                        Custom
                    </Text>
                    <Text style={styles.tabHint}>{customTemplates.length} saved</Text>
                </TouchableOpacity>
            </View>

            {/* Template List */}
            <View style={styles.listContent}>
                {currentTemplates.length === 0 && selectedTab === 'custom' ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyTitle}>No Custom Templates Yet</Text>
                        <Text style={styles.emptyText}>
                            Create a presentation in the editor and save it as a template to see it here.
                        </Text>
                    </View>
                ) : (
                    currentTemplates.map((item) => (
                        <View key={item.id} style={styles.cardWrapper}>
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.7}
                                onPress={() => router.push({
                                    pathname: "/editor",
                                    params: {
                                        template: item.id,
                                        templateType: item.type
                                    }
                                })}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.icon}>{item.icon}</Text>
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                        <Text style={styles.cardDescription}>{item.description}</Text>
                                        {item.slides && (
                                            <Text style={styles.slideCount}>
                                                📑 {item.slides.length} slide{item.slides.length !== 1 ? 's' : ''}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.arrow}>
                                    <Text style={styles.arrowText}>›</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Delete button for custom templates */}
                            {item.type === 'custom' && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteCustomTemplate(item.id, item.name)}
                                >
                                    <Text style={styles.deleteIcon}>🗑️</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    heading: {
        color: colors.gold,
        fontSize: 28,
        fontWeight: "700",
        letterSpacing: 0.5,
        fontFamily: "PlayfairDisplay_700Bold",
    },
    goldLine: {
        width: 60,
        height: 3,
        backgroundColor: colors.gold,
        marginTop: 8,
        marginBottom: 12,
        borderRadius: 2,
    },
    subheading: {
        color: colors.textSecondary,
        fontSize: 14,
        fontStyle: "italic",
        lineHeight: 20,
        fontFamily: "PlayfairDisplay_400Regular",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: colors.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.borderGold,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderGold,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ivory,
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 4,
        fontFamily: "Inter_600SemiBold",
    },
    cardDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: "Inter_400Regular",
    },
    arrow: {
        marginLeft: 12,
    },
    arrowText: {
        color: colors.gold,
        fontSize: 28,
        fontWeight: "300",
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        backgroundColor: colors.card,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderGold,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.gold,
    },
    tabText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 2,
    },
    tabTextActive: {
        color: colors.gold,
    },
    tabHint: {
        color: colors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        opacity: 0.7,
    },
    slideCount: {
        color: colors.gold,
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
        marginTop: 4,
    },
    cardWrapper: {
        position: 'relative',
        marginBottom: 14,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    deleteIcon: {
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        color: colors.gold,
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Inter_400Regular',
    },
})