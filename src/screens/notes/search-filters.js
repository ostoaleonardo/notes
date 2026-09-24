import { StyleSheet, View } from 'react-native'

import { SearchTagFilters } from './search-tag-filters'
import { SearchToggleFilters } from './search-toggle-filters'

export function SearchFilters({ query, setQuery, tags, saved, parsed, onToggleSave }) {
    return (
        <View style={styles.container}>
            <SearchTagFilters
                query={query}
                setQuery={setQuery}
                tags={tags}
                parsed={parsed}
            />

            <View style={styles.filters}>
                <SearchToggleFilters
                    query={query}
                    setQuery={setQuery}
                    parsed={parsed}
                    saved={saved}
                    onToggleSave={onToggleSave}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 8
    },
    filters: {
        gap: 4,
        paddingHorizontal: 8,
        alignItems: 'center',
        flexDirection: 'row'
    }
})
