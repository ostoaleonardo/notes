import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple } from 'react-native-paper'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { AnimatedList } from '@/components/animated/animated-list'
import { AnimatedView } from '@/components/animated/animated-view'
import { Typography } from '@/components/typography'
import { SPACING, OPACITY, RADIUS } from '@/constants/theme'

export function SearchResults({ results, aliasById, onOpenResult }) {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <AnimatedList
                gap={SPACING.xxxs}
                data={results}
                keyExtractor={(note) => note.path}
                emptyLabel={t('message.notes.empty')}
                keyboardShouldPersistTaps='always'
                renderItem={({ item }) => (
                    <AnimatedView
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                    >
                        <TouchableRipple
                            accessibilityRole='button'
                            onPress={() => onOpenResult(item.path)}
                        >
                            <View style={styles.item}>
                                <Typography
                                    bold={true}
                                    numberOfLines={1}
                                >
                                    {item.title || t('notes.untitled')}
                                </Typography>
                                {aliasById.has(item.repositoryId) && (
                                    <Typography
                                        opacity={OPACITY.muted}
                                        variant='caption'
                                    >
                                        {aliasById.get(item.repositoryId)}
                                    </Typography>
                                )}
                            </View>
                        </TouchableRipple>
                    </AnimatedView>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.lg
    },
    item: {
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    }
})
