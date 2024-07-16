import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'

export default function AppLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,

                contentStyle: {
                    backgroundColor: colors.background
                }
            }}
        >
            <Stack.Screen name='(stack)' />
        </Stack>
    )
}
