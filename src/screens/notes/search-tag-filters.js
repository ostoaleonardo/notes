import { StyleSheet, View } from 'react-native'
import { Chip, useTheme } from 'react-native-paper'

import { Scroll } from '@/components/animated/scroll'

import { toggleTagQualifier } from '@/utils/search-query'

import { FONTS, RADIUS, SPACING } from '@/constants/theme'

export function SearchTagFilters({ query, setQuery, tags, parsed }) {
    const { colors } = useTheme()

    if (tags.length === 0) return null

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={styles.scroll}
        >
            <View style={styles.chips}>
                {tags.map((tag) => {
                    const selected = parsed.tags.includes(tag.toLowerCase())

                    return (
                        <Chip
                            key={tag}
                            mode='flat'
                            style={{
                                borderRadius: RADIUS.xl,
                                backgroundColor: selected ? colors.onBackground : colors.surfaceVariant
                            }}
                            textStyle={{
                                fontFamily: selected ? FONTS.azeretMedium : FONTS.azeretLight,
                                ...(selected && { color: colors.background })
                            }}
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
        paddingHorizontal: SPACING.lg
    },
    chips: {
        gap: SPACING.xxs,
        flexDirection: 'row'
    }
})
