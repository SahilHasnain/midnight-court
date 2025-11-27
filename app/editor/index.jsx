import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors"
import { TextInput } from "react-native";
import GoldButton from "@/components/GoldButton"



export default function EditorScreen() {
    const { template } = useLocalSearchParams();

    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("");
    const [points, setPoints] = useState([""]);

    useEffect(() => {
        if (template === "case") {
            setTitle("Case Summary");
            setSubtitle("Facts & Issues");
        } else if (template === "judgement") {
            setTitle("judgement")
            setSubtitle("Holding & Reasoning");
        } else if (template === "arguments") {
            setTitle("Arguments vs Counter")
            setSubtitle("Key Points");
        } else if (template === "precedent") {
            setTitle("Legal Precedents");
            setSubtitle("Important Cases");
        } else if (template === "verdict") {
            setTitle("Verdict & Conclusion");
            setSubtitle("Final Stand");
        } else {
            setTitle("Title Slide");
            setSubtitle("Topic");
        }
    }, [template])

    const updatePoint = (i, text) => {
        const arr = [...points]
        arr[i] = text;
        setPoints(arr);
    }

    const addPoint = () => {
        setPoints((prev) => [...prev, ""]);
    }

    const goToExport = () => {
        router.push({
            pathname: "/export",
            params: {
                title,
                subtitle,
                points: JSON.stringify(points.filter((p) => p.trim().length > 0))
            }
        })
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Edit your slide</Text>

            <TextInput value={title}
                onChangeText={setTitle}
                placeholder="Heading"
                placeholderTextColor="#6B7280"
                style={styles.input}
            />

            <TextInput value={subtitle} onChangeText={setSubtitle} placeholder="SubTitle" placeholderTextColor="#6B7280" style={styles.input} />

            {points.map((p, i) => (
                <TextInput
                    key={i}
                    value={p}
                    onChangeText={(t) => updatePoint(i, t)}
                    placeholder={`Point ${i + 1}`} placeholderTextColor="#6B7280"
                    style={styles.input}
                />
            ))}

            <GoldButton title="Add Point" onPress={addPoint} style={{marginBottom: 10}} />
            <GoldButton title="continue" onPress={goToExport} />

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundColor,
        padding: 50
    },
    heading: {
        color: colors.ivory,
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16
    },
    input: {
        backgroundColor: "pink",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "purple",
        color: colors.textPrimary,
        marginBottom: 10,
    }
})