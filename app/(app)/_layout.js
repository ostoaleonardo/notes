import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { LoadingOverlay } from '@/components/layout'
import {
    useNotes,
    useDevMenu,
    useRepositories,
    useRepositoryReconciliation,
    useImportMarkdown
} from '@/hooks'

export default function AppLayout() {
    const { colors } = useTheme()
    const { importing } = useImportMarkdown()
    const { loading: notesLoading } = useNotes()

    const {
        loading,
        reconciled,
        activeRepository
    } = useRepositories()

    useRepositoryReconciliation()
    useDevMenu()

    if (loading || !reconciled) return null

    const isReady = !!activeRepository && !notesLoading

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,

                    contentStyle: {
                        backgroundColor: colors.background
                    }
                }}
            >
                <Stack.Protected guard={isReady}>
                    <Stack.Screen name='(stack)' />
                </Stack.Protected>

                <Stack.Protected guard={!isReady}>
                    <Stack.Screen name='repository-gate' />
                </Stack.Protected>
            </Stack>

            {importing && <LoadingOverlay />}
        </>
    )
}
