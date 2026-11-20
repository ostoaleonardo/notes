import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { FadeInUp, FadeOutUp } from 'react-native-reanimated'

import { SearchResultRow } from './search-result-row'
import { AnimatedList } from '@/ui/animated/animated-list'
import { AnimatedView } from '@/ui/animated/animated-view'
import { GroupedList } from '@/ui/grouped-list'
import { BOTTOM_GAP, SPACING } from '@/shared/constants/theme'
import { TEST_IDS } from '@/shared/constants/test-ids'

const getNotePath = (note) => note.path

export const SearchResults = ({
    results,
    aliasById,
    highlights,
    snippetLimit,
    onOpenResult,
    onLoadMore,
    loading
}) => {
    const { t } = useTranslation()

    const onPress = (entity) => onOpenResult(entity.id)

    return (
        <View
            style={styles.container}
            testID={TEST_IDS.SEARCH_RESULTS}
        >
            <GroupedList
                paged
                component={AnimatedList}
                gap={SPACING.xxxs}
                data={results}
                onEndReached={onLoadMore}
                keyExtractor={getNotePath}
                emptyLabel={loading ? '' : t('search.empty')}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={[styles.list, { paddingBottom: BOTTOM_GAP }]}
                renderItem={({ item }) => (
                    <AnimatedView
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                    >
                        <SearchResultRow
                            note={item}
                            title={item.title || t('notes.untitled')}
                            caption={aliasById.get(item.folderId)}
                            highlights={highlights}
                            snippetLimit={snippetLimit}
                            onPress={onPress}
                        />
                    </AnimatedView>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    list: {
        paddingHorizontal: SPACING.lg
    }
})
