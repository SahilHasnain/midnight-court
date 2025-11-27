import { colors } from "@/theme/colors";
import { StyleSheet, Text, TouchableOpacity } from "react-native";


export default function GoldButton({ title, onPress, style, textStyle }) {
    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress}
            style={[styles.button, style]} >
            <Text style={[styles.text, textStyle]}>{title}</Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.gold,
        paddingVertical: 14,
        borderRadius: 999,
        paddingHorizontal: 20,
    },
    text: {
        color: colors.background,
        fontSize: 16,
        fontWeight: "600",
    }
})