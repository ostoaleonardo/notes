import { StyleSheet, View } from 'react-native'
import { Scroll } from '@/ui/animated/scroll'
import { Chip } from '@/ui/chip'

import { toggleTagQualifier } from '@/utils/search-query'

import { SPACING } from '@/constants/theme'

export const SearchTagFilters = ({
    query,
    setQuery,
    tags,
    parsed
}) => {
    if (tags.length === 0) return null

    return (
        <Scroll
            horizontal
            style={styles.scroll}
            overScrollMode='never'
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={styles.content}
        >
            <View style={styles.chips}>
                {tags.map((tag) => {
                    const selected = parsed.tags.includes(tag.toLowerCase())

                    return (
                        <Chip
                            key={tag}
                            selected={selected}
                            onPress={() => setQuery(toggleTagQualifier(query, tag))}
                        >
                            {tag}
                        </Chip>
                    )
                })}
            </View>
        </Scroll>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 0
    },
    content: {
        paddingHorizontal: SPACING.lg
    },
    chips: {
        gap: SPACING.xxs,
        flexDirection: 'row'
    }
})
