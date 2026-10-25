import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import { TagOption } from '@/screens/notes/tag-option'
import { Typography } from '@/components/typography'
import { GroupedList } from '@/components/grouped-list'

import { useTags } from '@/hooks/use-tags'
import { hasTag, isSameTag } from '@/utils/tag-names'
import { SPACING, OPACITY } from '@/constants/theme'

export function Tags({ tags, setTags }) {
    const { t } = useTranslation()
    const { tags: allTags } = useTags()

    const onToggleTag = useCallback((name) => {
        setTags((previousTags) => hasTag(previousTags, name)
            ? previousTags.filter((tagName) => !isSameTag(tagName, name))
            : [...previousTags, name])
    }, [setTags])

    const renderItem = useCallback(({ item: name }) => (
        <TagOption
            id={name}
            tag={name}
            onToggle={onToggleTag}
            isSelected={hasTag(tags, name)}
        />
    ), [tags, onToggleTag])

    return (
        <GroupedList
            component={FlatList}
            data={allTags}
            keyExtractor={(name) => name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={Separator}
            renderItem={renderItem}
            ListEmptyComponent={() => (
                <View style={{ paddingTop: SPACING.xxxxl }}>
                    <Typography
                        opacity={OPACITY.muted}
                    >
                        {t('message.tags.empty')}
                    </Typography>
                </View>
            )}
        />
    )
}

const Separator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg
    },
    separator: {
        height: SPACING.xxxs
    }
})
