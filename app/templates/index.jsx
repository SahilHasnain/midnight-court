import { colors } from "@/theme/colors";
import { getAllTemplates } from "@/utils/templateData";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TemplateScreen() {
    const [selectedTab, setSelectedTab] = useState('quick'); // 'quick' or 'full'
    const templates = getAllTemplates();
    const currentTemplates = selectedTab === 'quick' ? templates.quick : templates.full;

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
            </View>

            {/* Template List */}
            <View style={styles.listContent}>
                {currentTemplates.map((item) => (
                    <TouchableOpacity
                        key={item.id}
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
                                {item.type === 'full' && (
                                    <Text style={styles.slideCount}>
                                        📑 {item.slides.length} pre-configured slides
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.arrow}>
                            <Text style={styles.arrowText}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}
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
    }
})