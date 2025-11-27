import { StyleSheet, Text, View } from "react-native"
import { colors } from "../theme/colors"
import GoldButton from "../components/GoldButton"
import { router } from "expo-router"

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Midnight Court</Text>
      <Text style={styles.subtitle}>For your voice. For your case.</Text>

      <GoldButton title="Start Your Argument"
      onPress={() => router.push("/templates")} />

      <Text style={styles.helper}>
        Create law-ready slides right from your phone.
      </Text>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: colors.ivory,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 40,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  }

})
