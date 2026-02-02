import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { AppBar } from '@/components'
import { NoteAction } from '@/screens'

export default function NotesLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                header: (props) => {
                    const locked = props.route.name === 'unlock/[slug]'

                    return (
                        <AppBar
                            back={true}
                            right={!locked && <NoteAction />}
                            {...props}
                        />
                    )
                },

                contentStyle: {
                    backgroundColor: colors.background
                }
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
