import { useEffect, useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen'
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
import { getScreenContentStyle } from '@/utils'

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

    const repositorySettled = !loading && reconciled
    const isReady = repositorySettled && !!activeRepository && !notesLoading
    const needsGate = repositorySettled && !activeRepository

    const gateEntered = useRef(false)
    if (needsGate) gateEntered.current = true

    useEffect(() => {
        if (isReady || needsGate) {
            SplashScreen.hideAsync()
        }
    }, [isReady, needsGate])

    if (!repositorySettled) return null
    if (!isReady && !needsGate && !gateEntered.current) return null

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: getScreenContentStyle(colors)
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
