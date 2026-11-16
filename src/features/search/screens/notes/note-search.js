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
import { SearchBar } from '@/shared/components/input/search-bar'

import { useNotes } from '@/shared/hooks/use-notes'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { useDebouncedValue } from '@/features/search/hooks/use-debounced-value'
import { useIndicatorFlag } from '@/features/search/hooks/use-indicator-flag'
import { useSearchOptions } from '@/features/search/hooks/use-search-options'
import { useSearchResults } from '@/features/search/hooks/use-search-results'
import { useStorage } from '@/shared/hooks/use-storage'
import { useUtils } from '@/shared/hooks/use-utils'
import { collectHighlights } from '@/features/search/utils/search-context'
import { getQueryChips } from '@/shared/utils/search-query'
import { buildTagTree } from '@/shared/utils/drawer-tags'
import { isEmptySearch, parseSearchQuery } from '@/shared/utils/search-parser'
import { getEditorPath } from '@/shared/utils/editor-path'
import { toggleSavedSearch, removeSavedSearch, parseStoredList } from '@/features/search/utils/saved-searches'
import { pushOnce } from '@/shared/utils/navigation'

import { RECENT_SEARCHES_LIMIT } from '@/shared/constants/default-values'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { SEARCH_DEBOUNCE_MS, SEARCH_PROGRESS_DELAY_MS, SEARCH_PROGRESS_MIN_MS } from '@/shared/constants/debounce'
import { SNIPPET_EXTENDED_LIMIT, SNIPPET_LIMIT } from '@/shared/constants/search-query'
import { SPACING } from '@/shared/constants/theme'
import { TEST_IDS } from '@/shared/constants/test-ids'

const isBlankQuery = (value) => value.trim() === ''
const NO_RESULTS = []

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

    const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS, isBlankQuery)
    const deferredQuery = useDeferredValue(debouncedQuery)
    const deferredAst = useMemo(() => parseSearchQuery(deferredQuery), [deferredQuery])
    const hasResultsQuery = !isEmptySearch(deferredAst)
    const { sort, matchCase, moreContext } = options

    const { results, done, scanning, loading, loadMore } = useSearchResults({
        enabled: hasResultsQuery,
        ast: deferredAst,
        notes,
        notePaths,
        pinned,
        matchCase,
        sort
    })

    const typing = !isBlankQuery(query) && query !== deferredQuery
    const pending = typing || loading
    const visibleResults = pending ? NO_RESULTS : results

    const showProgress = useIndicatorFlag(
        pending || scanning,
        SEARCH_PROGRESS_DELAY_MS,
        SEARCH_PROGRESS_MIN_MS
    )
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
                            count={visibleResults.length}
                            partial={!done}
                            searching={pending}
                            showLoader={showProgress}
                            sort={sort}
                            moreContext={moreContext}
                            isSaved={isSaved}
                            canSave={!!trimmedQuery}
                            onToggleSave={onToggleSaveSearch}
                            onChangeSort={options.onChangeSort}
                            onToggleMoreContext={options.onToggleMoreContext}
                        />
                        <SearchResults
                            results={visibleResults}
                            aliasById={aliasById}
                            highlights={highlights}
                            snippetLimit={moreContext ? SNIPPET_EXTENDED_LIMIT : SNIPPET_LIMIT}
                            onOpenResult={onOpenResult}
                            onLoadMore={loadMore}
                            loading={pending}
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
