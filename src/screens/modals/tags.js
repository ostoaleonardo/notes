import { useCallback, useState } from 'react'
import { StyleSheet, ToastAndroid, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import { TagOption } from '../notes/tag-option'
import { SmallInput } from '@/components/input/small-input'
import { SquareButton } from '@/components/button/square-button'
import { Typography } from '@/components/typography'
import { Separator } from '@/components/separator/separator'

import { useTags } from '@/hooks/use-tags'
import { hasTag, isSameTag } from '@/utils/tag-names'

export function Tags({ tags, setTags }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { tags: allTags, saveTag } = useTags()

    const [tag, setTag] = useState('')

    const onSaveTag = () => {
        const notify = (message) => ToastAndroid.show(message, ToastAndroid.SHORT)
        if (saveTag(tag, notify) === 'success') setTag('')
    }

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
        <>
            <View style={styles.container}>
                <SmallInput
                    value={tag}
                    onChangeText={setTag}
                    placeholder={t('placeholder.tag')}
                    background={colors.surfaceVariant}
                />
                <SquareButton
                    disabled={!tag.trim()}
                    onPress={onSaveTag}
                />
            </View>

            <FlatList
                alignItems='center'
                data={allTags}
                keyExtractor={(name) => name}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
                ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View style={{ paddingTop: 64 }}>
                        <Typography
                            opacity={0.5}
                        >
                            {t('message.tags.empty')}
                        </Typography>
                    </View>
                )}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        padding: 16,
        paddingTop: 0,
        flexDirection: 'row'
    }
})
