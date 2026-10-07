import { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Typography } from '@/components/typography'
import { DrawerView } from './drawer-view'
import { DrawerTreeRow } from './drawer-tree-row'

import { useNotes } from '@/hooks/use-notes'
import { useStorage } from '@/hooks/use-storage'
import { useStorageEffect } from '@/hooks/use-storage-effect'
import { toggleInSet } from '@/utils/toggle-in-set'
import { buildTagTree, collectTagKeys, flattenTagTree } from '@/utils/drawer-tags'

import { ArrowDownward } from '@/icons/arrow-downward'
import { ArrowUpward } from '@/icons/arrow-upward'
import { CollapseAll } from '@/icons/collapse-all'
import { ExpandAll } from '@/icons/expand-all'
import { SortByAlpha } from '@/icons/sort-by-alpha'

import { DEFAULT_TAG_SORT, TAG_SORT_LABELS, TAG_SORTS } from '@/constants/tags'
import { SPACING, OPACITY } from '@/constants/theme'
import { DRAWER_TOOLBAR_KEYS } from '@/constants/drawer-views'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const TagRow = memo(function TagRow({ tagKey, name, depth, count, hasChildren, expanded, onToggle }) {
    return (
        <DrawerTreeRow
            compact={true}
            label={name}
            depth={depth}
            count={count}
            collapsed={!expanded}
            expandable={hasChildren}
            onPress={() => onToggle(tagKey)}
        />
    )
})

function TagsEmpty() {
    const { t } = useTranslation()

    return (
        <View style={styles.empty}>
            <Typography opacity={OPACITY.muted}>
                {t('message.tags.empty')}
            </Typography>
        </View>
    )
}

export function DrawerTagsView() {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { setItem } = useStorage()
    const [sort, setSort] = useState(DEFAULT_TAG_SORT)
    const [expandedTags, setExpandedTags] = useState(() => new Set())

    const tree = useMemo(() => buildTagTree(notes), [notes])
    const rows = useMemo(() => flattenTagTree(tree, expandedTags, sort), [tree, expandedTags, sort])

    useStorageEffect(STORAGE_KEYS.TAG_SORT, (stored) => {
        if (TAG_SORT_LABELS[stored]) setSort(stored)
    })

    const onChangeSort = useCallback((next) => {
        setSort(next)
        setItem(STORAGE_KEYS.TAG_SORT, next)
    }, [setItem])

    const onToggleCollapseAll = useCallback(() => {
        setExpandedTags((current) => (
            current.size > 0 ? new Set() : new Set(collectTagKeys(tree))
        ))
    }, [tree])

    const anyExpanded = expandedTags.size > 0

    const toolbarItems = useMemo(() => {
        const sortItem = (key, [firstIcon, secondIcon], first, second) => {
            const next = sort === first ? second : first

            return {
                key,
                icon: sort === second ? secondIcon : firstIcon,
                style: sort !== first && sort !== second && styles.inactive,
                onPress: () => onChangeSort(next),
                accessibilityLabel: t(TAG_SORT_LABELS[next])
            }
        }

        return [
            sortItem('sort-name', [SortByAlpha, SortByAlpha], TAG_SORTS.NAME_ASC, TAG_SORTS.NAME_DESC),
            sortItem('sort-usage', [ArrowDownward, ArrowUpward], TAG_SORTS.COUNT_DESC, TAG_SORTS.COUNT_ASC),
            {
                key: DRAWER_TOOLBAR_KEYS.TOGGLE_ALL,
                icon: anyExpanded ? CollapseAll : ExpandAll,
                onPress: onToggleCollapseAll,
                accessibilityLabel: t(anyExpanded ? 'drawer.collapse_all' : 'drawer.expand_all')
            }
        ]
    }, [sort, onChangeSort, anyExpanded, onToggleCollapseAll, t])

    const onToggleTag = useCallback((key) => setExpandedTags((current) => toggleInSet(current, key)), [])

    const renderItem = useCallback(({ item }) => {
        return (
            <TagRow
                tagKey={item.key}
                name={item.name}
                depth={item.depth}
                count={item.count}
                hasChildren={item.hasChildren}
                expanded={item.expanded}
                onToggle={onToggleTag}
            />
        )
    }, [onToggleTag])

    return (
        <DrawerView
            data={rows}
            renderItem={renderItem}
            toolbarItems={toolbarItems}
            ListEmptyComponent={TagsEmpty}
        />
    )
}

const styles = StyleSheet.create({
    inactive: {
        opacity: OPACITY.disabled
    },
    empty: {
        paddingVertical: SPACING.lg,
        paddingStart: SPACING.sm
    }
})
