import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, useTheme } from 'react-native-paper'

import { Scroll } from '@/components/animated/scroll'
import { Typography } from '@/components/typography'
import { FilterToggleGroup } from '@/components/button/filter-toggle-group'

import { parseSearchQuery, toggleTagQualifier, togglePinnedQualifier, toggleImageQualifier } from '@/utils/search-query'

import { Check } from '@/icons/check'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { Picture } from '@/icons/picture'
import { Plus } from '@/icons/plus'

export function SearchFilters({ query, setQuery, tags, saved, onToggleSave }) {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const trimmedQuery = query.trim()
    const parsed = parseSearchQuery(query)
    const canSave = !!trimmedQuery
    const isSaved = saved.some((entry) => entry.query === trimmedQuery)

    return (
        <View style={styles.container}>
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
                                    textStyle={selected ? { color: colors.background } : undefined}
                                    onPress={() => setQuery(toggleTagQualifier(query, tag.name))}
                                >
                                    {tag.name}
                                </Chip>
                            )
                        })}
                    </View>
                </View>
            </Scroll>

            <FilterToggleGroup
                buttons={[
                    {
                        icon: Picture,
                        label: t('search.has_image'),
                        selected: parsed.hasImage,
                        onPress: () => setQuery(toggleImageQualifier(query))
                    },
                    {
                        icon: parsed.pinned ? KeepFilled : Keep,
                        label: t('search.pinned'),
                        selected: parsed.pinned,
                        onPress: () => setQuery(togglePinnedQualifier(query))
                    },
                    {
                        icon: isSaved ? Check : Plus,
                        label: t(isSaved ? 'search.unsave' : 'search.save'),
                        selected: isSaved,
                        disabled: !canSave,
                        onPress: onToggleSave
                    }
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 12
    },
    scroll: {
        paddingHorizontal: 16,
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
