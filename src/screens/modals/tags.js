import { useCallback } from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import { TagOption } from '@/screens/notes/tag-option'
import { Typography } from '@/components/typography'
import { Separator } from '@/components/separator/separator'

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
        <FlatList
            alignItems='center'
            data={allTags}
            keyExtractor={(name) => name}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.lg }}
            ItemSeparatorComponent={<Separator style={{ marginHorizontal: SPACING.xxl }} />}
            renderItem={renderItem}
            ListEmptyComponent={() => (
                <View style={{ paddingTop: 64 }}>
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
