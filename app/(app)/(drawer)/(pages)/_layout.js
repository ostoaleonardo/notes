import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { getScreenContentStyle } from '@/utils'

export default function PagesLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: getScreenContentStyle(colors)
            }}
        >
            <Stack.Screen name='settings/index' />
            <Stack.Screen name='tags/index' />
        </Stack>
    )
}
