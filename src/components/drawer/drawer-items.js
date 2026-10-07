import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { DrawerNotesView } from './drawer-notes-view'
import { DrawerTagsView } from './drawer-tags-view'
import { DrawerToolbar } from './drawer-toolbar'
import { DrawerTemplatesView } from './drawer-templates-view'
import { DrawerFilesView } from './drawer-files-view'
import { DrawerViewSwitcher } from './drawer-view-switcher'

import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'

import { FolderCode } from '@/icons/folder-code'
import { Settings } from '@/icons/settings'

import { DEFAULT_DRAWER_VIEW, DRAWER_VIEWS, DRAWER_ACTIONS } from '@/constants/drawer-views'
import { SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'
import { ROUTES } from '@/constants/routes'
import { TEST_IDS } from '@/constants/test-ids'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const VIEW_COMPONENTS = {
    [DRAWER_VIEWS.NOTES]: DrawerNotesView,
    [DRAWER_VIEWS.TEMPLATES]: DrawerTemplatesView,
    [DRAWER_VIEWS.TAGS]: DrawerTagsView,
    [DRAWER_VIEWS.FILES]: DrawerFilesView
}

export function DrawerItems({ navigation }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { setItem } = useStorage()
    const insets = useSafeAreaInsets()
    const [view, setView] = useState(null)

    useStorageEffect(STORAGE_KEYS.DRAWER_VIEW, (stored) => {
        setView(VIEW_COMPONENTS[stored] ? stored : DEFAULT_DRAWER_VIEW)
    })

    const closeDrawer = useCallback(() => {
        navigation.dispatch({ type: DRAWER_ACTIONS.CLOSE })
    }, [navigation])

    const onOpenRepositories = useCallback(() => router.push(ROUTES.REPOSITORIES), [])
    const onOpenSettings = useCallback(() => router.push(ROUTES.SETTINGS), [])

    const onChangeView = useCallback((next) => {
        setView(next)
        setItem(STORAGE_KEYS.DRAWER_VIEW, next)
    }, [setItem])

    const footerItems = useMemo(() => [
        {
            icon: FolderCode,
            onPress: onOpenRepositories,
            testID: TEST_IDS.DRAWER_REPOSITORIES,
            label: t('drawer.repositories')
        },
        {
            icon: Settings,
            onPress: onOpenSettings,
            testID: TEST_IDS.DRAWER_SETTINGS,
            label: t('title.settings')
        }
    ], [onOpenRepositories, onOpenSettings, t])

    const ActiveView = VIEW_COMPONENTS[view]

    return (
        <>
            {ActiveView && <ActiveView closeDrawer={closeDrawer} />}

            <View style={{ paddingTop: SPACING.lg, paddingBottom: insets.bottom }}>
                <DrawerToolbar>
                    <View style={styles.actions}>
                        <View style={styles.switcher}>
                            {view && (
                                <DrawerViewSwitcher
                                    view={view}
                                    onChange={onChangeView}
                                />
                            )}
                        </View>
                        <IconToggleGroup
                            buttons={footerItems}
                            background={colors.onBackground + TRANSPARENT[10]}
                        />
                    </View>
                </DrawerToolbar>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    actions: {
        flex: 1,
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center'
    },
    switcher: {
        flex: 1
    }
})
