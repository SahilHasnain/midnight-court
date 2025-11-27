import { FlatList, View } from "react-native";
import { colors } from "@/theme/colors"
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";



const TEMPLATES = [
    { id: "title", name: "Title Slide" },
    { id: "case", name: "Case Summary" },
    { id: "judgement", name: "Judgement" },
    { id: "arguments", name: "Arguments vs Counter" },
    { id: "precedent", name: "Legal Precedent" },
    { id: "verdict", name: "Verdict & Conclusion" },
];

export default function TemplateScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Choose your starting point</Text>

            <FlatList
                data={TEMPLATES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push({
                            pathname: "/editor",
                            params: { template: item.id }
                        })
                        }
                    >
                        <Text style={styles.cardText}>{item.name}</Text>
                    </TouchableOpacity>
                )} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        marginTop: 40,
    },
    heading: {
        color: colors.ivory,
        fontSize: 20,
        marginLeft: 10,
        fontWeight: "600",
    },
    card: {
        backgroundColor: "pink",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "purple"
    },
    cardText: {
        color: colors.ivory,
        fontSize: 15,
        fontWeight: "500"
    }

})