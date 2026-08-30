import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { getScreenContentStyle } from '@/utils'

export default function WorkspaceLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'ios_from_right',
                contentStyle: getScreenContentStyle(colors)
            }}
        >
            <Stack.Screen name='home/index' />
            <Stack.Screen name='notes/new' />
            <Stack.Screen name='notes/[slug]' />
            <Stack.Screen name='templates/[filename]' />
        </Stack>
    )
}
