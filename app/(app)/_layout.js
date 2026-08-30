import { useEffect, useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { Stack } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { LoadingOverlay } from '@/components/layout'
import { AppBar } from '@/components'
import {
    useNotes,
    useDevMenu,
    useRepositories,
    useRepositoryReconciliation,
    useImportMarkdown
} from '@/hooks'
import { getScreenContentStyle } from '@/utils'

export default function AppLayout() {
    const { t } = useTranslation()
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

    const wasReady = useRef(false)

    if (isReady) wasReady.current = true
    const showDrawer = !needsGate && wasReady.current

    useEffect(() => {
        if (isReady || needsGate) {
            SplashScreen.hideAsync()
        }
    }, [isReady, needsGate])

    if (!repositorySettled) return null
    if (!isReady && !needsGate && !gateEntered.current && !wasReady.current) return null

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'ios_from_right',
                    contentStyle: getScreenContentStyle(colors)
                }}
            >
                <Stack.Protected guard={showDrawer}>
                    <Stack.Screen name='(drawer)' />
                    <Stack.Screen
                        name='tags/index'
                        options={{
                            headerShown: true,
                            title: t('title.tags'),
                            header: (props) => <AppBar title={props.options.title} />
                        }}
                    />
                    <Stack.Screen
                        name='repositories/index'
                        options={{
                            headerShown: true,
                            title: t('title.repositories'),
                            header: (props) => <AppBar title={props.options.title} />
                        }}
                    />
                    <Stack.Screen
                        name='settings/index'
                        options={{
                            headerShown: true,
                            title: t('title.settings'),
                            header: (props) => <AppBar title={props.options.title} />
                        }}
                    />
                    <Stack.Screen
                        name='image-viewer'
                        options={{
                            presentation: 'transparentModal',
                            animation: 'fade'
                        }}
                    />
                </Stack.Protected>

                <Stack.Protected guard={!showDrawer}>
                    <Stack.Screen name='repository-gate' />
                </Stack.Protected>
            </Stack>

            {(showDrawer && notesLoading || importing) && <LoadingOverlay />}
        </>
    )
}
