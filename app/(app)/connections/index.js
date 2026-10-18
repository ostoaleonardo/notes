import { useCallback, useEffect, useMemo } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

import { ConnectionSheets } from '@/screens/connections/connection-sheets'
import { ConnectionsAppBar } from '@/screens/connections/connections-app-bar'
import { FocusCrumbs } from '@/screens/connections/focus-crumbs'
import { FocusPager } from '@/screens/connections/focus-pager'
import { FocusStage } from '@/screens/connections/focus-stage'

import { useConnectionsSession } from '@/hooks/use-connections-session'
import { useFocusNavigation } from '@/hooks/use-focus-navigation'

import { CONNECTION_TYPES } from '@/constants/connections'
import { SPACING } from '@/constants/theme'

const { NOTE, FILE, MISSING } = CONNECTION_TYPES

export default function Connections() {
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()

    const session = useConnectionsSession()
    const {
        model,
        getTitle,
        summary,
        relationsSheet,
        originSheet,
        onOpenEntity,
        onCreate,
        onOpenPending
    } = session

    const nav = useFocusNavigation(model)
    const { trail, focus, satellites, page, pages, enter, up, jump, setOrigin, turnPage } = nav

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (trail.length < 2) return false

            up()
            return true
        })

        return () => subscription.remove()
    }, [trail.length, up])

    const onPressNode = useCallback((entity, isCenter) => {
        if (isCenter) {
            relationsSheet.onOpen()
            return
        }

        if (entity.type === FILE) onOpenEntity(entity)
        else enter(entity)
    }, [relationsSheet, onOpenEntity, enter])

    const onEnterFromSheet = useCallback((entity) => {
        relationsSheet.onClose()
        enter(entity)
    }, [relationsSheet, enter])

    const onSelectOrigin = useCallback((entity) => {
        originSheet.onClose()
        setOrigin(entity)
    }, [originSheet, setOrigin])

    const sheetPrimary = useMemo(() => {
        if (focus.type === NOTE || focus.type === FILE) {
            return { label: t('connections.open'), onPress: onOpenEntity }
        }

        if (focus.type === MISSING) return { label: t('notes.create'), onPress: onCreate }

        return null
    }, [focus.type, t, onOpenEntity, onCreate])

    return (
        <View style={styles.screen}>
            <ConnectionsAppBar
                pendingCount={summary.orphans.length + summary.unresolved.length}
                onPending={onOpenPending}
                onSearch={originSheet.onOpen}
            />

            <View style={styles.crumbs}>
                <FocusCrumbs trail={trail} getTitle={getTitle} onJump={jump} />
            </View>

            <View style={styles.body}>
                <FocusStage
                    focus={focus}
                    focusTitle={getTitle(focus)}
                    satellites={satellites}
                    hasPager={pages > 1}
                    getTitle={getTitle}
                    emptyLabel={t('connections.no_relations')}
                    onPressNode={onPressNode}
                    onSwipe={turnPage}
                />

                {pages > 1 && (
                    <View
                        pointerEvents='box-none'
                        style={[styles.pager, { paddingBottom: insets.bottom + SPACING.sm }]}
                    >
                        <FocusPager page={page} pages={pages} onTurn={turnPage} />
                    </View>
                )}
            </View>

            <ConnectionSheets
                session={session}
                entity={focus}
                primary={sheetPrimary}
                onViewTree={onEnterFromSheet}
                onSelectOrigin={onSelectOrigin}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    crumbs: {
        paddingBottom: SPACING.sm
    },
    body: {
        flex: 1
    },
    pager: {
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute'
    }
})
