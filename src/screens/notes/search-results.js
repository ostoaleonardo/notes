import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { AnimatedList, Typography } from '@/components'
import { Divider, TouchableRipple } from 'react-native-paper'

export function SearchResults({ results, aliasById, onOpenResult }) {
    const { t } = useTranslation()

    return (
        <View style={styles.container}>
            <Divider />

            <AnimatedList
                gap={2}
                data={results}
                keyExtractor={(note) => note.id}
                emptyLabel={t('message.notes.empty')}
                keyboardShouldPersistTaps='always'
                renderItem={({ item }) => (
                    <TouchableRipple
                        onPress={() => onOpenResult(item.id)}
                    >
                        <View style={styles.item}>
                            <Typography
                                bold
                                numberOfLines={1}
                            >
                                {item.title || t('notes.untitled')}
                            </Typography>
                            {aliasById.has(item.repositoryId) && (
                                <Typography
                                    opacity={0.5}
                                    variant='caption'
                                >
                                    {aliasById.get(item.repositoryId)}
                                </Typography>
                            )}
                        </View>
                    </TouchableRipple>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16
    },
    item: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16
    }
})
