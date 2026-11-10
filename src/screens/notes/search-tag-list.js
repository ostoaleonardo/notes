import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { TreeRow } from '@/ui/tree-row'
import { GroupedList } from '@/ui/grouped-list'
import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { flattenTagTree } from '@/utils/drawer-tags'
import { toggleInSet } from '@/utils/toggle-in-set'
import { getActiveTags, toggleTagQualifier } from '@/utils/search-query'

import { ArrowBack } from '@/icons/arrow-back'

import { BOTTOM_GAP, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const getRowKey = (row) => row.id

const TagRow = memo(({
    row,
    selected,
    showSlot,
    onSelect,
    onExpand
}) => {
    const onPress = useCallback(() => onSelect(row.key), [onSelect, row.key])
    const onToggle = useCallback(() => onExpand(row.key), [onExpand, row.key])

    return (
        <View testID={TEST_IDS.SEARCH_TAG_PREFIX + row.key}>
            <TreeRow
                label={row.name}
                depth={row.depth}
                count={row.count}
                selected={selected}
                onPress={onPress}
                collapsed={!row.expanded}
                expandable={row.hasChildren}
                showSlot={showSlot}
                onExpand={row.hasChildren ? onToggle : undefined}
            />
        </View>
    )
})

export const SearchTagList = ({
    ast,
    tagTree,
    query,
    setQuery,
    onBack
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const [expanded, setExpanded] = useState(() => new Set())

    const activeTags = getActiveTags(ast)
    const rows = useMemo(() => flattenTagTree(tagTree, expanded), [tagTree, expanded])
    const hasNested = useMemo(() => [...tagTree.values()].some((node) => node.children.size > 0), [tagTree])

    const onSelect = useCallback((key) => setQuery(toggleTagQualifier(query, key)), [query, setQuery])
    const onExpand = useCallback((key) => setExpanded((current) => toggleInSet(current, key)), [])

    return (
        <View style={styles.container}>
            <View style={styles.back}>
                <ListItem
                    uppercase={false}
                    title={t('search.filters.tag')}
                    background={colors.surfaceVariant}
                    leadingIcon={ArrowBack}
                    onPress={onBack}
                />
            </View>

            <GroupedList
                paged
                data={rows}
                keyExtractor={getRowKey}
                style={styles.scroll}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={[styles.list, { paddingBottom: BOTTOM_GAP }]}
                renderItem={({ item }) => (
                    <TagRow
                        row={item}
                        selected={activeTags.includes(item.key)}
                        showSlot={hasNested}
                        onSelect={onSelect}
                        onExpand={onExpand}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        gap: SPACING.xxxs
    },
    back: {
        paddingHorizontal: SPACING.lg
    },
    scroll: {
        flex: 1
    },
    list: {
        paddingHorizontal: SPACING.lg
    }
})
