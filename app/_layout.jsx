import { StatusBar } from "react-native"
import { colors } from "../theme/colors"
import { Slot, Stack } from "expo-router"

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background
        }
      }} />
    </>
  )
}
