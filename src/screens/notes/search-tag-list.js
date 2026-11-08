import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { GridItem } from '@/ui/grid/grid-item'
import { GroupedList } from '@/ui/grouped-list'
import { ListItem } from '@/ui/list-item'
import { useTheme } from '@/ui/hooks/use-theme'

import { getActiveTags, toggleTagQualifier } from '@/utils/search-query'

import { ArrowBack } from '@/icons/arrow-back'

import { BOTTOM_GAP, SPACING } from '@/constants/theme'
import { TEST_IDS } from '@/constants/test-ids'

const getTag = (tag) => tag

export const SearchTagList = ({
    ast,
    tags,
    query,
    setQuery,
    onBack
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()

    const activeTags = getActiveTags(ast)

    const onToggle = useCallback((tag) => setQuery(toggleTagQualifier(query, tag)), [query, setQuery])

    return (
        <View style={styles.container}>
            <View style={styles.back}>
                <ListItem
                    uppercase={false}
                    title={t('search.filters.tag')}
                    background={colors.surfaceVariant}
                    leadingIcon={ArrowBack}
                    onPress={onBack}
                />
            </View>

            <GroupedList
                paged
                data={tags}
                keyExtractor={getTag}
                style={styles.scroll}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={[styles.list, { paddingBottom: BOTTOM_GAP }]}
                renderItem={({ item }) => (
                    <GridItem
                        title={item}
                        active={activeTags.includes(item.toLowerCase())}
                        testID={TEST_IDS.SEARCH_TAG_PREFIX + item}
                        onPress={() => onToggle(item)}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        gap: SPACING.xxxs
    },
    back: {
        paddingHorizontal: SPACING.lg
    },
    scroll: {
        flex: 1
    },
    list: {
        gap: SPACING.xxxs,
        paddingHorizontal: SPACING.lg
    }
})
