import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, useTheme } from 'react-native-paper'

import { Scroll } from '@/components/animated/scroll'
import { Typography } from '@/components/typography'

import { toggleTagQualifier } from '@/utils/search-query'

import { FONTS, SPACING, OPACITY, RADIUS } from '@/constants/theme'

export function SearchTagFilters({ query, setQuery, tags, parsed }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    return (
        <Scroll
            horizontal
            overScrollMode='never'
            keyboardShouldPersistTaps='always'
            contentContainerStyle={styles.scroll}
        >
            <View style={styles.carousel}>
                <Typography
                    opacity={OPACITY.muted}
                    variant='caption'
                >
                    {tags.length === 0 ? t('message.tags.empty') : t('title.tags') + ':'}
                </Typography>

                <View style={styles.chips}>
                    {tags.map((tag) => {
                        const selected = parsed.tags.includes(tag.toLowerCase())

                        return (
                            <Chip
                                key={tag}
                                mode={selected ? 'flat' : 'outlined'}
                                style={{
                                    borderRadius: RADIUS.xl,
                                    ...(selected && { backgroundColor: colors.onBackground })
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
            </View>
        </Scroll>
    )
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: SPACING.lg
    },
    carousel: {
        gap: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center'
    },
    chips: {
        gap: SPACING.xxs,
        flexDirection: 'row'
    }
})
