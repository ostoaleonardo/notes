import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, useTheme } from 'react-native-paper'

import { Scroll } from '@/components/animated/scroll'
import { Typography } from '@/components/typography'

import { toggleTagQualifier } from '@/utils/search-query'

import { FONTS } from '@/constants/themes'

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
                    opacity={0.5}
                    variant='caption'
                >
                    {tags.length === 0 ? t('message.tags.empty') : t('title.tags') + ':'}
                </Typography>

                <View style={styles.chips}>
                    {tags.map((tag) => {
                        const selected = parsed.tags.includes(tag.name.toLowerCase())

                        return (
                            <Chip
                                key={tag.name}
                                mode={selected ? 'flat' : 'outlined'}
                                style={{
                                    borderRadius: 24,
                                    ...(selected && { backgroundColor: colors.onBackground })
                                }}
                                textStyle={{
                                    fontFamily: selected ? FONTS.azeretMedium : FONTS.azeretLight,
                                    ...(selected && { color: colors.background })
                                }}
                                onPress={() => setQuery(toggleTagQualifier(query, tag.name))}
                            >
                                {tag.name}
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
        paddingHorizontal: 16
    },
    carousel: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    chips: {
        gap: 3,
        flexDirection: 'row'
    }
})
