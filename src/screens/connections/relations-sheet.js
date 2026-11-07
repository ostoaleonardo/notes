import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import { EntityBadge } from './entity-badge'
import { RelationList } from './relation-list'
import { SECTION_ICONS } from './entity-icon'
import { ButtonGroup } from '@/ui/button/button-group'
import { TonalButton } from '@/ui/button/tonal-button'
import { ModalBottomSheet } from '@/ui/modal/modal-bottom-sheet'
import { EmptyMessage } from '@/ui/modal/empty-message'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useDelayedValue } from '@/hooks/use-delayed-value'

import { describeEntity } from '@/utils/connection-caption'
import { entityKey, listRelations } from '@/utils/connection-model'
import { findSectionById, resolveSection, sectionId } from '@/utils/section-tabs'

import { ICON_TOGGLE } from '@/constants/components'
import { RELATIONS_SHEET } from '@/constants/connections'
import {
    CONNECTION_TAB_LABELS,
    CONNECTION_TYPES,
    CONNECTION_TYPE_LABELS
} from '@/constants/connections'
import { ICON_SIZE, OPACITY, BOTTOM_GAP, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const { ROOT } = CONNECTION_TYPES

export const RelationsSheet = memo(({
    sheet,
    entity,
    model,
    getTitle,
    onViewTree,
    primary
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { height } = useWindowDimensions()
    const [tabState, setTabState] = useState({ id: null, key: null })

    const id = entity ? entityKey(entity) : null

    const relations = useMemo(() => (
        entity ? listRelations(entity, model) : []
    ), [entity, model])

    const current = resolveSection(relations, tabState, id)
    const currentId = current ? sectionId(id, current.key) : null
    const listedId = useDelayedValue(currentId, ICON_TOGGLE.expandDuration)
    const listed = findSectionById(relations, id, listedId) || current

    const getCaption = useCallback((item) => describeEntity(item, model, t), [model, t])

    const tabs = useMemo(() => relations.map((section) => {
        const active = section.key === current?.key

        return {
            icon: SECTION_ICONS[section.key],
            label: `${t(CONNECTION_TAB_LABELS[section.key])} ${section.entities.length}`,
            selected: active,
            onPress: () => setTabState({ id, key: section.key })
        }
    }), [relations, current, id, t])

    const onPrimary = useCallback(() => primary.onPress(entity), [primary, entity])

    const title = entity ? getTitle(entity) : ''
    const subtitle = entity
        ? `${t(CONNECTION_TYPE_LABELS[entity.type])} · ${getCaption(entity)}`
        : ''
    const maxHeight = height * RELATIONS_SHEET.listMaxRatio

    return (
        <ModalBottomSheet
            ref={sheet.ref}
            contentContainerStyle={styles.sheet}
        >
            {entity && (
                <View style={[styles.container, !primary && !listed && { paddingBottom: BOTTOM_GAP }]}>
                    <View style={styles.header}>
                        <EntityBadge
                            entity={entity}
                            title={title}
                            size={RELATIONS_SHEET.blobSize}
                            iconSize={ICON_SIZE.xxl}
                            fill={colors.tertiary}
                            color={entity.type === ROOT ? colors.onTertiary : colors.accentText}
                        />
                        <View style={styles.titles}>
                            <Typography
                                heading
                                numberOfLines={1}
                                fontSize={RELATIONS_SHEET.titleSize}
                            >
                                {entity.type === CONNECTION_TYPES.TAG ? `#${title}` : title}
                            </Typography>
                            <Typography
                                variant='bodySmall'
                                numberOfLines={1}
                                opacity={OPACITY.secondary}
                            >
                                {subtitle}
                            </Typography>
                        </View>
                    </View>

                    {tabs.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.tabsScroll}
                            contentContainerStyle={styles.tabs}
                        >
                            <ButtonGroup expandSelected buttons={tabs} />
                        </ScrollView>
                    )}

                    <View style={[styles.body, { maxHeight }]}>
                        {listed && (
                            <RelationList
                                style={styles.list}
                                entities={listed.entities}
                                getTitle={getTitle}
                                onSelect={onViewTree}
                            />
                        )}

                        {!current && (
                            <EmptyMessage style={styles.empty}>
                                {t('connections.no_relations')}
                            </EmptyMessage>
                        )}
                    </View>

                    {primary && (
                        <View style={[styles.footer, { paddingBottom: BOTTOM_GAP }]}>
                            <TonalButton
                                testID={TEST_IDS.CONNECTIONS_RELATIONS_PRIMARY}
                                onPress={onPrimary}
                            >
                                {primary.label}
                            </TonalButton>
                        </View>
                    )}
                </View>
            )}
        </ModalBottomSheet>
    )
})

const styles = StyleSheet.create({
    sheet: {
        flex: 0
    },
    container: {
        flexShrink: 1
    },
    header: {
        gap: SPACING.md,
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center'
    },
    titles: {
        flex: 1
    },
    tabsScroll: {
        flexGrow: 0,
        marginBottom: SPACING.md
    },
    tabs: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.lg
    },
    body: {
        flexShrink: 1
    },
    list: {
        flexShrink: 1
    },
    empty: {
        paddingTop: SPACING.md,
        paddingHorizontal: SPACING.xl
    },
    footer: {
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
