import { colors } from "@/theme/colors";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

/**
 * Simple toast notification component
 * Usage: <Toast message="Action completed" visible={true} duration={2000} />
 */
export default function Toast({ message, visible, duration = 2000 }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(duration),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, duration, fadeAnim]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.toast}>
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    toast: {
        backgroundColor: colors.toast,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        shadowColor: "rgba(0,0,0,0.4)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    message: {
        color: colors.ivory,
        fontSize: 14,
        fontWeight: "600",
        fontFamily: "Inter_600SemiBold",
        textAlign: "center",
    },
});
