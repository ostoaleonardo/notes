import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { getScreenContentStyle } from '@/utils'

export default function NotesLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: getScreenContentStyle(colors)
            }}
        >
            <Stack.Screen
                name='index'
            />
            <Stack.Screen
                name='edit/[slug]'
            />
        </Stack>
    )
}
