import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Chip, IconButton } from 'react-native-paper'
import { Scroll, Typography } from '@/components'
import { toggleTagQualifier, togglePinnedQualifier } from '@/utils'
import { Keep, KeepFilled } from '@/icons'

export function SearchFilters({ query, setQuery, parsed, tags }) {
    const { t } = useTranslation()

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
                        {tags.map((tag) => (
                            <Chip
                                key={tag.name}
                                style={{ borderRadius: 24 }}
                                mode={parsed.tag === tag.name.toLowerCase() ? 'outlined' : 'flat'}
                                onPress={() => setQuery(toggleTagQualifier(query, tag.name))}
                            >
                                {tag.name}
                            </Chip>
                        ))}
                    </View>
                </View>
            </Scroll>

            <IconButton
                size={12}
                mode='outlined'
                selected={parsed.pinned}
                accessibilityLabel={t('search.pinned')}
                onPress={() => setQuery(togglePinnedQualifier(query))}
                icon={(props) => (
                    parsed.pinned
                        ? <KeepFilled {...props} />
                        : <Keep {...props} />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingRight: 8,
        flexDirection: 'row',
        justifyContent: 'space-between'
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
        gap: 2,
        flexDirection: 'row'
    }
})
