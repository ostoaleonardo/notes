import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Keyboard, Pressable, StyleSheet } from 'react-native'
import { FadeInDown, FadeOutUp } from 'react-native-reanimated'

import { SearchFilters } from './search-filters'
import { SearchResults } from './search-results'
import { RecentSearches } from './recent-searches'
import { SavedSearches } from './saved-searches'
import { AnimatedView } from '@/components/animated/animated-view'
import { SearchInput } from '@/components/input/search-input'

import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { useTags } from '@/hooks/use-tags'
import { useUtils } from '@/hooks/use-utils'
import { filterNotes } from '@/utils/search-query'
import { getEditorPath } from '@/utils/editor-path'
import { toggleSavedSearch, removeSavedSearch } from '@/utils/saved-searches'

import { RADIUS } from '@/constants/themes'
import { RECENT_SEARCHES_LIMIT } from '@/constants/default-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function NoteSearch() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { repositories } = useRepositories()
    const { notes } = useNotes()
    const { tags } = useTags()
    const { pinned } = useUtils()
    const { getItem, setItem } = useStorage()

    const [query, setQuery] = useState('')
    const [expanded, setExpanded] = useState(false)
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

    const collapse = () => setExpanded(false)

    const onOutsideTap = () => {
        Keyboard.dismiss()
        collapse()
    }

    return (
        <Pressable
            style={styles.overlay}
            onPress={expanded ? onOutsideTap : undefined}
        >
            <SearchInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('drawer.search')}
                onFocus={() => setExpanded(true)}
                onBlur={collapse}
            />

            {expanded && (
                <AnimatedView
                    style={styles.search}
                    entering={FadeInDown}
                    exiting={FadeOutUp}
                >
                    <AnimatedView
                        style={{
                            ...styles.actions,
                            backgroundColor: colors.surface
                        }}
                    >
                        <SearchFilters
                            query={query}
                            setQuery={setQuery}
                            tags={tags}
                            saved={saved}
                            onToggleSave={onToggleSaveSearch}
                        />

                        {trimmedQuery ? (
                            <SearchResults
                                results={results}
                                aliasById={aliasById}
                                onOpenResult={onOpenResult}
                            />
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
                    </AnimatedView>
                </AnimatedView>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({

    overlay: {
        position: 'absolute',
        inset: 0,
        zIndex: 10
    },
    search: {
        width: '100%',
        borderRadius: RADIUS.outer
    },
    actions: {
        gap: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        borderRadius: RADIUS.outer
    }
})
