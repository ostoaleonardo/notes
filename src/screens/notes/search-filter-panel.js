import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { SearchTagList } from './search-tag-list'
import { SearchValueDialog } from './search-value-dialog'
import { GroupedGrid } from '@/ui/grid/grouped-grid'

import { addQualifier, buildQualifier, hasQualifier, toggleQualifier } from '@/utils/search-query'

import { AttachFile } from '@/icons/attach-file'
import { Checklist } from '@/icons/checklist'
import { DoneAll } from '@/icons/done-all'
import { Folder } from '@/icons/folder'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Keep } from '@/icons/keep'
import { NoteStack } from '@/icons/note-stack'
import { Notes } from '@/icons/notes'
import { Picture } from '@/icons/picture'
import { Tag } from '@/icons/tag'
import { Title } from '@/icons/title'

import {
    SEARCH_FILTER_COLUMNS,
    SEARCH_FILTER_KINDS,
    SEARCH_FILTER_OPTIONS
} from '@/constants/search-filters'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const FILTER_ICONS = {
    tag: Tag,
    path: Folder,
    file: NoteStack,
    property: FormatListBulleted,
    'task-todo': Checklist,
    'task-done': DoneAll,
    images: Picture,
    files: AttachFile,
    pinned: Keep,
    content: Notes,
    line: FormatListBulleted,
    section: Title
}

const toQualifier = (option, value) => {
    if (option.kind === SEARCH_FILTER_KINDS.PROPERTY) return `[${value}]`

    return buildQualifier(option.operator, value)
}

export const SearchFilterPanel = ({ ast, tags, query, setQuery }) => {
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
                tags={tags}
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
