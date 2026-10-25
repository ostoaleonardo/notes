import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { Keyboard, Pressable, StyleSheet, View } from 'react-native'

import { SearchFilters } from './search-filters'
import { SearchResults } from './search-results'
import { RecentSearches } from './recent-searches'
import { SavedSearches } from './saved-searches'
import { SearchBar } from '@/components/input/search-bar'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { useTags } from '@/hooks/use-tags'
import { useUtils } from '@/hooks/use-utils'
import { filterNotes } from '@/utils/search-filter'
import { parseSearchQuery } from '@/utils/search-query'
import { getEditorPath } from '@/utils/editor-path'
import { toggleSavedSearch, removeSavedSearch, parseStoredList } from '@/utils/saved-searches'

import { RECENT_SEARCHES_LIMIT } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { SPACING } from '@/constants/theme'

export function NoteSearch({ onClose, initialQuery = '' }) {
    const { repositories } = useRepositories()
    const { notes, notePaths } = useNotes()
    const { tags } = useTags()
    const { pinned } = useUtils()
    const { getItem, setItem } = useStorage()

    const [query, setQuery] = useState(initialQuery)
    const [recent, setRecent] = useState([])
    const [saved, setSaved] = useState([])

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

    const parsed = useMemo(() => parseSearchQuery(query), [query])

    const deferredQuery = useDeferredValue(query)
    const deferredParsed = useMemo(() => parseSearchQuery(deferredQuery), [deferredQuery])
    const hasResultsQuery = deferredQuery.trim() !== ''

    const results = useMemo(() => (
        hasResultsQuery ? filterNotes(notes, deferredParsed, { pinned, notePaths }) : []
    ), [hasResultsQuery, deferredParsed, notes, pinned, notePaths])

    const saveRecent = useCallback((term) => {
        if (!term) return

        const next = [term, ...recent.filter((entry) => entry !== term)].slice(0, RECENT_SEARCHES_LIMIT)
        setRecent(next)
        setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next))
    }, [recent, setItem])

    const onOpenResult = useCallback((id) => {
        saveRecent(trimmedQuery)
        onClose()
        router.push(getEditorPath(id))
    }, [saveRecent, trimmedQuery, onClose])

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
                value={query}
                onChangeText={setQuery}
            />

            <View style={styles.actions}>
                <SearchFilters
                    tags={tags}
                    saved={saved}
                    query={query}
                    setQuery={setQuery}
                    parsed={parsed}
                    onToggleSave={onToggleSaveSearch}
                />

                {hasResultsQuery ? (
                    <SearchResults
                        results={results}
                        aliasById={aliasById}
                        onOpenResult={onOpenResult}
                    />
                ) : (
                    <View style={styles.suggestions}>
                        <SavedSearches
                            saved={saved}
                            onSelect={setQuery}
                            onDelete={onDeleteSavedSearch}
                        />
                        <RecentSearches
                            recent={recent}
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
    suggestions: {
        gap: SPACING.xl
    },
    actions: {
        flex: 1,
        gap: SPACING.xl
    }
})
