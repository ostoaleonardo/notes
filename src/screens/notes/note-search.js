import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Keyboard, Pressable, StyleSheet } from 'react-native'
import { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { AnimatedView, SearchInput } from '@/components'
import { SearchFilters } from './search-filters'
import { SearchResults } from './search-results'
import { RecentSearches } from './recent-searches'
import { useNotes, useRepositories, useStorage, useTabs, useTags, useUtils } from '@/hooks'
import { filterNotes, parseSearchQuery } from '@/utils'
import { COMMONS, RECENT_SEARCHES_LIMIT, STORAGE_KEYS } from '@/constants'

export function NoteSearch() {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { repositories } = useRepositories()
    const { notes } = useNotes()
    const { tags } = useTags()
    const { pinned } = useUtils()
    const { openTab } = useTabs()
    const { getItem, setItem } = useStorage()

    const [query, setQuery] = useState('')
    const [expanded, setExpanded] = useState(false)
    const [recent, setRecent] = useState([])

    const trimmedQuery = query.trim()
    const parsed = parseSearchQuery(query)

    useEffect(() => {
        getItem(STORAGE_KEYS.RECENT_SEARCHES).then((value) => {
            if (value) setRecent(JSON.parse(value))
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
        openTab(id)
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
                        {tags.length > 0 && (
                            <SearchFilters
                                query={query}
                                setQuery={setQuery}
                                parsed={parsed}
                                tags={tags}
                            />
                        )}

                        {trimmedQuery ? (
                            <SearchResults
                                results={results}
                                aliasById={aliasById}
                                onOpenResult={onOpenResult}
                            />
                        ) : (
                            <RecentSearches
                                recent={recent}
                                onSelect={setQuery}
                            />
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
        borderRadius: COMMONS.radius
    },
    actions: {
        gap: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        borderRadius: COMMONS.radius
    }
})
