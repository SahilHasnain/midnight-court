import { colors } from "@/theme/colors";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TEMPLATES = [
    {
        id: "title",
        name: "Title Slide",
        icon: "⚖️",
        description: "Start with authority and presence"
    },
    {
        id: "case",
        name: "Case Summary",
        icon: "📋",
        description: "Facts, issues, and parties involved"
    },
    {
        id: "judgement",
        name: "Judgement",
        icon: "⚡",
        description: "Court's ruling and legal reasoning"
    },
    {
        id: "arguments",
        name: "Arguments vs Counter",
        icon: "⚔️",
        description: "Present both sides with clarity"
    },
    {
        id: "precedent",
        name: "Legal Precedent",
        icon: "📚",
        description: "Cite landmark cases and rulings"
    },
    {
        id: "verdict",
        name: "Verdict & Conclusion",
        icon: "🏛️",
        description: "Final stand and key takeaways"
    },
];

export default function TemplateScreen() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.heading}>Choose Your Template</Text>
                <View style={styles.goldLine} />
                <Text style={styles.subheading}>
                    Every great argument begins with structure
                </Text>
            </View>

            {/* Template List */}
            <FlatList
                data={TEMPLATES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => router.push({
                            pathname: "/editor",
                            params: { template: item.id }
                        })}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>{item.icon}</Text>
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardDescription}>{item.description}</Text>
                            </View>
                        </View>
                        <View style={styles.arrow}>
                            <Text style={styles.arrowText}>›</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
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
    }
})