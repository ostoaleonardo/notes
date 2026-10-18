import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { router, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { CreateNoteDialog } from '@/screens/connections/create-note-dialog'
import { EntityRow } from '@/screens/connections/entity-row'
import { HeroCard } from '@/screens/connections/hero-card'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'
import { Typography } from '@/components/typography'

import { useConnectionModel } from '@/hooks/use-connection-model'
import { useDelayedValue } from '@/hooks/use-delayed-value'
import { useMissingNote } from '@/hooks/use-missing-note'
import { entityKey, entityTitle, summarizeConnections } from '@/utils/connection-model'
import { getEditorPath } from '@/utils/editor-path'
import { buildPendingRows } from '@/utils/pending-rows'

import { Link } from '@/icons/link'
import { LinkOff } from '@/icons/link-off'

import { ICON_TOGGLE, SETTINGS_LIST } from '@/constants/components'
import { CONNECTION_TYPES, PENDING_TABS, PENDING_TAB_PARAM } from '@/constants/connections'
import { OPACITY, SPACING } from '@/constants/theme'

const { NOTE } = CONNECTION_TYPES

const Separator = () => <View style={styles.separator} />

export default function ConnectionsPending() {
    const { t } = useTranslation()
    const params = useLocalSearchParams()

    const model = useConnectionModel()
    const missingNote = useMissingNote()
    const { setMissing } = missingNote

    const [tab, setTab] = useState(
        params[PENDING_TAB_PARAM] === PENDING_TABS.UNRESOLVED
            ? PENDING_TABS.UNRESOLVED
            : PENDING_TABS.ORPHANS
    )

    const summary = useMemo(() => summarizeConnections(model), [model])
    const listedTab = useDelayedValue(tab, ICON_TOGGLE.expandDuration)
    const rows = useMemo(() => buildPendingRows(listedTab, summary), [listedTab, summary])

    const isOrphans = tab === PENDING_TABS.ORPHANS
    const total = isOrphans ? summary.orphans.length : summary.unresolved.length
    const affected = isOrphans ? summary.orphans.length : summary.brokenNotes

    const tabs = useMemo(() => [
        [PENDING_TABS.ORPHANS, Link, summary.orphans.length, 'orphans'],
        [PENDING_TABS.UNRESOLVED, LinkOff, summary.unresolved.length, 'unresolved']
    ].map(([value, icon, count, legend]) => {
        const active = value === tab

        return {
            icon,
            label: `${count} ${t(`connections.${legend}`)}`,
            selected: active,
            onPress: () => setTab(value)
        }
    }), [tab, summary, t])

    const onPressEntity = useCallback((entity) => {
        if (entity.type === NOTE) router.push(getEditorPath(entity.id))
        else setMissing({ title: entityTitle(entity, model), path: '' })
    }, [setMissing, model])

    const renderItem = useCallback(({ item, index }) => (
        <EntityRow
            entity={item}
            title={entityTitle(item, model)}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            onPress={onPressEntity}
        />
    ), [rows.length, model, onPressEntity])

    const header = (
        <View style={styles.header}>
            <HeroCard
                progress={summary.total ? affected / summary.total : 0}
                value={total}
                title={t(`connections.pending.${tab}.title`)}
            >
                <Typography variant='bodySmall' opacity={OPACITY.secondary}>
                    {t(`connections.pending.${tab}.description`)}
                </Typography>
            </HeroCard>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabs}
            >
                <IconToggleGroup expandSelected buttons={tabs} />
            </ScrollView>
        </View>
    )

    return (
        <View style={styles.screen}>
            <FlatList
                data={rows}
                renderItem={renderItem}
                keyExtractor={entityKey}
                ListHeaderComponent={header}
                ItemSeparatorComponent={Separator}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ListEmptyComponent={(
                    <Typography opacity={OPACITY.secondary} styleProps={styles.empty}>
                        {t(isOrphans ? 'message.orphans.empty' : 'message.unresolved.empty')}
                    </Typography>
                )}
            />

            <CreateNoteDialog missingNote={missingNote} />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    },
    list: {
        padding: SPACING.lg
    },
    header: {
        gap: SPACING.md,
        paddingBottom: SPACING.lg
    },
    tabs: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    separator: {
        height: SETTINGS_LIST.itemGap
    },
    empty: {
        paddingHorizontal: SPACING.sm
    }
})
