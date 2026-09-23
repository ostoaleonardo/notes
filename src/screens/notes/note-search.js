import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { Divider } from 'react-native-paper'

import { SearchFilters } from './search-filters'
import { SearchResults } from './search-results'
import { RecentSearches } from './recent-searches'
import { SavedSearches } from './saved-searches'
import { SearchInput } from '@/components/input/search-input'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { useTags } from '@/hooks/use-tags'
import { useUtils } from '@/hooks/use-utils'
import { filterNotes } from '@/utils/search-query'
import { getEditorPath } from '@/utils/editor-path'
import { toggleSavedSearch, removeSavedSearch } from '@/utils/saved-searches'

import { RECENT_SEARCHES_LIMIT } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function NoteSearch({ onClose }) {
    const { repositories } = useRepositories()
    const { notes } = useNotes()
    const { tags } = useTags()
    const { pinned } = useUtils()
    const { getItem, setItem } = useStorage()

    const [query, setQuery] = useState('')
    const [recent, setRecent] = useState([])
    const [saved, setSaved] = useState([])

    const trimmedQuery = query.trim()

    useEffect(() => {
        getItem(STORAGE_KEYS.RECENT_SEARCHES).then((value) => {
            if (value) setRecent(JSON.parse(value))
        })

        getItem(STORAGE_KEYS.SAVED_SEARCHES).then((value) => {
            if (value) setSaved(JSON.parse(value))
        })
    }, [])

    const aliasById = useMemo(() => (
        new Map(repositories.map((repository) => [repository.id, repository.alias]))
    ), [repositories])

    const results = useMemo(() => (
        trimmedQuery ? filterNotes(notes, trimmedQuery, { tags, pinned }) : []
    ), [trimmedQuery, notes, tags, pinned])

    const saveRecent = (term) => {
        if (!term) return

        const next = [term, ...recent.filter((entry) => entry !== term)].slice(0, RECENT_SEARCHES_LIMIT)
        setRecent(next)
        setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next))
    }

    const onOpenResult = (id) => {
        saveRecent(trimmedQuery)
        onClose()
        router.push(getEditorPath(id))
    }

    const onToggleSaveSearch = () => {
        const next = toggleSavedSearch(saved, trimmedQuery, randomUUID())
        setSaved(next)
        setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(next))
    }

    const onDeleteSavedSearch = (id) => {
        const next = removeSavedSearch(saved, id)
        setSaved(next)
        setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(next))
    }

    return (
        <View style={styles.container}>
            <SearchInput
                autoFocus
                value={query}
                onChangeText={setQuery}
            />

            <View style={styles.actions}>
                <SearchFilters
                    tags={tags}
                    saved={saved}
                    query={query}
                    setQuery={setQuery}
                    onToggleSave={onToggleSaveSearch}
                />

                {trimmedQuery ? (
                    <>
                        <Divider />
                        <SearchResults
                            results={results}
                            aliasById={aliasById}
                            onOpenResult={onOpenResult}
                        />
                    </>
                ) : (
                    <>
                        <SavedSearches
                            saved={saved}
                            onSelect={setQuery}
                            onDelete={onDeleteSavedSearch}
                        />
                        <RecentSearches
                            recent={recent}
                            onSelect={setQuery}
                        />
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    actions: {
        flex: 1,
        gap: 16,
        paddingTop: 16
    }
})
