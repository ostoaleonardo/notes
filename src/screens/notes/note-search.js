import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { SearchFilterPanel } from './search-filter-panel'
import { SearchChips } from './search-chips'
import { SearchFilterButton } from './search-filter-button'
import { SearchResults } from './search-results'
import { SearchResultsToolbar } from './search-results-toolbar'
import { RecentSearches } from './recent-searches'
import { SavedSearches } from './saved-searches'
import { SearchBar } from '@/components/input/search-bar'
import { SearchClearButton } from '@/components/input/search-clear-button'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useSearchClear } from '@/hooks/use-search-clear'
import { useSearchOptions } from '@/hooks/use-search-options'
import { useStorage } from '@/hooks/use-storage'
import { useTags } from '@/hooks/use-tags'
import { useUtils } from '@/hooks/use-utils'
import { searchNotes } from '@/utils/search-filter'
import { collectHighlights } from '@/utils/search-context'
import { getQueryChips } from '@/utils/search-query'
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
    const { tags } = useTags()
    const { pinned } = useUtils()
    const { notes, notePaths } = useNotes()
    const { getItem, setItem } = useStorage()
    const { repositories } = useRepositories()

    const [query, setQuery] = useState(initialQuery)
    const [recent, setRecent] = useState([])
    const [saved, setSaved] = useState([])
    const [panelOpen, setPanelOpen] = useState(false)

    const options = useSearchOptions()
    const { fieldRef, onClear } = useSearchClear(setQuery)

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
        <Pressable accessible={false} style={styles.container} onPress={Keyboard.dismiss}>
            <SearchBar
                ref={fieldRef}
                value={query}
                onChangeText={setQuery}
                label={t('drawer.search')}
                testID={TEST_IDS.SEARCH_INPUT}
                endAdornment={(
                    <View style={styles.end}>
                        <SearchFilterButton
                            active={panelOpen}
                            onPress={onTogglePanel}
                        />

                        {!!query && <SearchClearButton onPress={onClear} />}
                    </View>
                )}
            />

            <View style={styles.actions}>
                {panelOpen && (
                    <SearchFilterPanel
                        ast={ast}
                        tags={tags}
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
                            matchCase={matchCase}
                            moreContext={moreContext}
                            isSaved={isSaved}
                            canSave={!!trimmedQuery}
                            onToggleSave={onToggleSaveSearch}
                            onChangeSort={options.onChangeSort}
                            onToggleMatchCase={options.onToggleMatchCase}
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
                        style={styles.suggestions}
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
        flex: 1
    },
    end: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    suggestions: {
        gap: SPACING.xl
    },
    actions: {
        flex: 1,
        gap: SPACING.xl
    }
})
