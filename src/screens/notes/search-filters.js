import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, IconButton, Tooltip, useTheme } from 'react-native-paper'

import { Scroll } from '@/components/animated/scroll'
import { Typography } from '@/components/typography'
import { FilterToggleGroup } from '@/components/button/filter-toggle-group'

import {
    parseSearchQuery,
    toggleTagQualifier,
    togglePinnedQualifier,
    toggleImageQualifier,
    toggleContentQualifier
} from '@/utils/search-query'

import { Check } from '@/icons/check'
import { Keep } from '@/icons/keep'
import { KeepFilled } from '@/icons/keep-filled'
import { NoteStack } from '@/icons/note-stack'
import { Picture } from '@/icons/picture'
import { Plus } from '@/icons/plus'

import { FONTS } from '@/constants/themes'

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

            <View style={styles.filters}>
                <Tooltip title={t('search.in_content')}>
                    <IconButton
                        size={16}
                        mode={parsed.inContent ? 'contained' : 'outlined'}
                        iconColor={parsed.inContent ? colors.background : colors.onBackground}
                        containerColor={parsed.inContent ? colors.onBackground : undefined}
                        onPress={() => setQuery(toggleContentQualifier(query))}
                        icon={(props) => <NoteStack width={16} height={16} {...props} />}
                        accessibilityLabel={t('search.in_content')}
                    />
                </Tooltip>

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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 8
    },
    scroll: {
        paddingHorizontal: 16,
    },
    filters: {
        gap: 4,
        alignItems: 'center',
        paddingHorizontal: 8,
        flexDirection: 'row',
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
