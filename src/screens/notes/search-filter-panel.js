import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { FILTER_ICONS } from './search-filter-icons'
import { SearchTagList } from './search-tag-list'
import { SearchValueDialog } from './search-value-dialog'
import { GroupedGrid } from '@/ui/grid/grouped-grid'

import { addQualifier, buildQualifier, hasQualifier, toggleQualifier } from '@/utils/search-query'

import {
    SEARCH_FILTER_COLUMNS,
    SEARCH_FILTER_KINDS,
    SEARCH_FILTER_OPTIONS
} from '@/constants/search-filters'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const toQualifier = (option, value) => {
    if (option.kind === SEARCH_FILTER_KINDS.PROPERTY) return `[${value}]`

    return buildQualifier(option.operator, value)
}

export const SearchFilterPanel = ({ ast, tagTree, query, setQuery }) => {
    const { t } = useTranslation()
    const [pending, setPending] = useState(null)
    const [showTags, setShowTags] = useState(false)

    const onSelect = useCallback((option) => {
        if (option.kind === SEARCH_FILTER_KINDS.TAGS) {
            setShowTags(true)
            return
        }

        if (option.kind === SEARCH_FILTER_KINDS.TOGGLE) {
            setQuery(toggleQualifier(query, option.operator, option.value))
            return
        }

        setPending(option)
    }, [query, setQuery])

    const onDismiss = useCallback(() => setPending(null), [])
    const onCloseTags = useCallback(() => setShowTags(false), [])

    const onSubmit = useCallback((option, value) => {
        setQuery(addQualifier(query, toQualifier(option, value)))
    }, [query, setQuery])

    const items = useMemo(() => SEARCH_FILTER_OPTIONS.map((option) => ({
        id: option.id,
        title: t(option.label),
        icon: FILTER_ICONS[option.id],
        active: option.kind === SEARCH_FILTER_KINDS.TOGGLE
            && hasQualifier(ast, option.operator, option.value),
        testID: TEST_IDS.SEARCH_FILTER_PREFIX + option.id,
        onPress: () => onSelect(option)
    })), [t, ast, onSelect])

    if (showTags) {
        return (
            <SearchTagList
                ast={ast}
                tagTree={tagTree}
                query={query}
                setQuery={setQuery}
                onBack={onCloseTags}
            />
        )
    }

    return (
        <View
            testID={TEST_IDS.SEARCH_FILTER_PANEL}
            style={styles.content}
        >
            <GroupedGrid
                items={items}
                columns={SEARCH_FILTER_COLUMNS}
            />

            <SearchValueDialog
                option={pending}
                onDismiss={onDismiss}
                onSubmit={onSubmit}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: SPACING.lg
    }
})
