import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { AppBar } from '@/components'
import { getScreenContentStyle } from '@/utils'

export default function NotesLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                header: (props) => (
                    <AppBar
                        props={props}
                        leading='back'
                    />
                ),

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
