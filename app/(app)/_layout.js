import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { LoadingOverlay } from '@/ui/layout'
import { useTheme } from '@/ui/hooks/use-theme'
import { AppBar } from '@/shared/components/app-bar/app-bar'
import { IndexingNotice } from '@/shared/components/indexing-notice'

import { useNotes } from '@/shared/hooks/use-notes'
import { useIndexingStatus } from '@/shared/hooks/use-indexing-status'
import { useNavigationReadiness } from '@/shared/hooks/use-navigation-readiness'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { useRepositoryReconciliation } from '@/shared/hooks/use-repository-reconciliation'
import { useImportMarkdown } from '@/shared/hooks/use-import-markdown'
import { getScreenContentStyle } from '@/shared/utils/screen-content-style'
import { getEditorPath } from '@/shared/utils/editor-path'
import { pushOnce } from '@/shared/utils/navigation'
import { bootMark } from '@/shared/utils/boot-mark'
import { BOOT_MARKS } from '@/shared/constants/boot-marks'

const useDevMenu = __DEV__ ? require('@/shared/hooks/use-dev-menu').useDevMenu : () => {}

const isIndexing = (status) => status !== null

export default function AppLayout() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { importing } = useImportMarkdown()
    const { loading: notesLoading } = useNotes()
    const indexing = useIndexingStatus(isIndexing)

    const {
        loading,
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
        activeRepository,
        notesLoading
    })

    useEffect(() => {
        if (isReady || needsGate || indexing) {
            bootMark(BOOT_MARKS.SPLASH_HIDE)
            SplashScreen.hideAsync()
        }
    }, [isReady, needsGate, indexing])

    useEffect(() => {
        if (showDrawer && pendingWelcomeNoteId) {
            pushOnce(getEditorPath(pendingWelcomeNoteId))
            clearPendingWelcomeNote()
        }
    }, [
        showDrawer,
        pendingWelcomeNoteId,
        clearPendingWelcomeNote
    ])

    if (shouldRenderNothing) {
        return indexing && (
            <>
                <LoadingOverlay />
                <IndexingNotice />
            </>
        )
    }

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
                    <Stack.Screen name='connections/index' />
                    <Stack.Screen
                        name='connections/pending'
                        options={{
                            headerShown: true,
                            title: t('connections.pending.title'),
                            header: (props) => <AppBar title={props.options.title} />
                        }}
                    />
                    <Stack.Screen
                        name='version-history'
                        options={{
                            headerShown: true,
                            title: t('title.version_history'),
                            header: (props) => (
                                <AppBar
                                    title={props.options.title}
                                    trailing={props.options.headerRight?.({})}
                                />
                            )
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
            <IndexingNotice />
        </>
    )
}
