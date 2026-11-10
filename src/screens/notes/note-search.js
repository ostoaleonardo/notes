import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SearchFilterPanel } from './search-filter-panel'
import { SearchChips } from './search-chips'
import { SearchOptions } from './search-options'
import { SearchResults } from './search-results'
import { SearchResultsToolbar } from './search-results-toolbar'
import { RecentSearches } from './recent-searches'
import { SavedSearches } from './saved-searches'
import { SearchBar } from '@/components/input/search-bar'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useSearchOptions } from '@/hooks/use-search-options'
import { useStorage } from '@/hooks/use-storage'
import { useUtils } from '@/hooks/use-utils'
import { searchNotes } from '@/utils/search-filter'
import { collectHighlights } from '@/utils/search-context'
import { getQueryChips } from '@/utils/search-query'
import { buildTagTree } from '@/utils/drawer-tags'
import { isEmptySearch, parseSearchQuery } from '@/utils/search-parser'
import { getEditorPath } from '@/utils/editor-path'
import { toggleSavedSearch, removeSavedSearch, parseStoredList } from '@/utils/saved-searches'
import { pushOnce } from '@/utils/navigation'

import { RECENT_SEARCHES_LIMIT } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SNIPPET_EXTENDED_LIMIT, SNIPPET_LIMIT } from '@/constants/search-query'
import { SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

export const NoteSearch = ({ onClose, initialQuery = '' }) => {
    const { t } = useTranslation()
    const { pinned } = useUtils()
    const { notes, notePaths } = useNotes()
    const { getItem, setItem } = useStorage()
    const { repositories } = useRepositories()

    const [query, setQuery] = useState(initialQuery)
    const [recent, setRecent] = useState([])
    const [saved, setSaved] = useState([])
    const [panelOpen, setPanelOpen] = useState(false)

    const options = useSearchOptions()
    const tagTree = useMemo(() => buildTagTree(notes), [notes])

    const trimmedQuery = query.trim()

    useEffect(() => {
        getItem(STORAGE_KEYS.RECENT_SEARCHES).then((value) => {
            if (value) setRecent(parseStoredList(value))
        })

        getItem(STORAGE_KEYS.SAVED_SEARCHES).then((value) => {
            if (value) setSaved(parseStoredList(value))
        })
    }, [getItem])

    const aliasById = useMemo(() => (
        new Map(repositories.map((repository) => [repository.id, repository.alias]))
    ), [repositories])

    const ast = useMemo(() => parseSearchQuery(query), [query])
    const chips = useMemo(() => getQueryChips(ast), [ast])

    const deferredQuery = useDeferredValue(query)
    const deferredAst = useMemo(() => parseSearchQuery(deferredQuery), [deferredQuery])
    const hasResultsQuery = !isEmptySearch(deferredAst)
    const { sort, matchCase, moreContext } = options

    const results = useMemo(() => (
        hasResultsQuery
            ? searchNotes(notes, deferredAst, { pinned, notePaths, matchCase }, sort)
            : []
    ), [hasResultsQuery, deferredAst, notes, pinned, notePaths, matchCase, sort])

    const highlights = useMemo(() => collectHighlights(deferredAst), [deferredAst])

    const onTogglePanel = useCallback(() => setPanelOpen((open) => !open), [])
    const isSaved = saved.some((entry) => entry.query === trimmedQuery)

    const saveRecent = useCallback((term) => {
        if (!term) return

        const next = [term, ...recent.filter((entry) => entry !== term)].slice(0, RECENT_SEARCHES_LIMIT)
        setRecent(next)
        setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next))
    }, [recent, setItem])

    const onOpenResult = useCallback((id) => {
        saveRecent(trimmedQuery)
        onClose()
        pushOnce(getEditorPath(id))
    }, [saveRecent, trimmedQuery, onClose])

    const onDeleteRecent = useCallback((term) => {
        const next = recent.filter((entry) => entry !== term)
        setRecent(next)
        setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next))
    }, [recent, setItem])

    const onToggleSaveSearch = useCallback(() => {
        const next = toggleSavedSearch(saved, trimmedQuery, randomUUID())
        setSaved(next)
        setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(next))
    }, [saved, trimmedQuery, setItem])

    const onDeleteSavedSearch = useCallback((id) => {
        const next = removeSavedSearch(saved, id)
        setSaved(next)
        setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(next))
    }, [saved, setItem])

    return (
        <Pressable
            accessible={false}
            style={styles.container}
            onPress={Keyboard.dismiss}
        >
            <View style={styles.header}>
                <View style={styles.field}>
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        label={t('drawer.search')}
                        testID={TEST_IDS.SEARCH_INPUT}
                    />
                </View>

                <SearchOptions
                    matchCase={matchCase}
                    panelOpen={panelOpen}
                    onToggleMatchCase={options.onToggleMatchCase}
                    onTogglePanel={onTogglePanel}
                />
            </View>

            <View style={styles.container}>
                {panelOpen && (
                    <SearchFilterPanel
                        ast={ast}
                        tagTree={tagTree}
                        query={query}
                        setQuery={setQuery}
                    />
                )}

                <SearchChips
                    chips={chips}
                    query={query}
                    setQuery={setQuery}
                />

                {panelOpen ? null : hasResultsQuery ? (
                    <>
                        <SearchResultsToolbar
                            count={results.length}
                            sort={sort}
                            moreContext={moreContext}
                            isSaved={isSaved}
                            canSave={!!trimmedQuery}
                            onToggleSave={onToggleSaveSearch}
                            onChangeSort={options.onChangeSort}
                            onToggleMoreContext={options.onToggleMoreContext}
                        />
                        <SearchResults
                            results={results}
                            aliasById={aliasById}
                            highlights={highlights}
                            snippetLimit={moreContext ? SNIPPET_EXTENDED_LIMIT : SNIPPET_LIMIT}
                            onOpenResult={onOpenResult}
                        />
                    </>
                ) : (
                    <View
                        testID={TEST_IDS.SEARCH_SUGGESTIONS}
                        style={styles.container}
                    >
                        <SavedSearches
                            saved={saved}
                            onSelect={setQuery}
                            onDelete={onDeleteSavedSearch}
                        />
                        <RecentSearches
                            recent={recent}
                            onDelete={onDeleteRecent}
                            onSelect={setQuery}
                        />
                    </View>
                )}
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: SPACING.xl
    },
    header: {
        flexDirection: 'row'
    },
    field: {
        flex: 1,
        marginLeft: SPACING.lg,
        marginRight: SPACING.sm
    }
})
