import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { Stack, router } from 'expo-router'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'

import { LoadingOverlay } from '@/components/layout'
import { AppBar } from '@/components/app-bar/app-bar'

import { useNotes } from '@/hooks/use-notes'
import { useDevMenu } from '@/hooks/use-dev-menu'
import { useNavigationReadiness } from '@/hooks/use-navigation-readiness'
import { useRepositories } from '@/hooks/use-repositories'
import { useRepositoryReconciliation } from '@/hooks/use-repository-reconciliation'
import { useImportMarkdown } from '@/hooks/use-import-markdown'
import { getScreenContentStyle } from '@/utils/screen-content-style'
import { getEditorPath } from '@/utils/editor-path'

export default function AppLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { importing } = useImportMarkdown()
    const { loading: notesLoading } = useNotes()

    const {
        loading,
        reconciled,
        activeRepository,
        pendingWelcomeNoteId,
        clearPendingWelcomeNote
    } = useRepositories()

    useRepositoryReconciliation()
    useDevMenu()

    const {
        isReady,
        needsGate,
        showDrawer,
        shouldRenderNothing
    } = useNavigationReadiness({
        loading,
        reconciled,
        activeRepository,
        notesLoading
    })

    useEffect(() => {
        if (isReady || needsGate) {
            SplashScreen.hideAsync()
        }
    }, [isReady, needsGate])

    useEffect(() => {
        if (showDrawer && pendingWelcomeNoteId) {
            router.push(getEditorPath(pendingWelcomeNoteId))
            clearPendingWelcomeNote()
        }
    }, [
        showDrawer,
        pendingWelcomeNoteId,
        clearPendingWelcomeNote
    ])

    if (shouldRenderNothing) return null

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
