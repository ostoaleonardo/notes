import { useCallback, useState } from 'react'
import { randomUUID } from 'expo-crypto'
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
import { useHaptics } from '@/hooks/use-haptics'

import { FEEDBACK_TYPES } from '@/constants/feedback-types'

export function Tags({ tags, setTags }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { tags: allTags, addTag } = useTags()

    const [tag, setTag] = useState('')

    const onSaveTag = () => {
        const result = addTag({
            id: randomUUID(),
            name: tag.trim()
        })

        if (result === 'duplicate') {
            ToastAndroid.show(t('tags.already_added'), ToastAndroid.SHORT)
            return
        }

        setTag('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    const onToggleTag = useCallback((id) => {
        setTags((previousTags) => previousTags.includes(id)
            ? previousTags.filter((tagId) => tagId !== id)
            : [...previousTags, id])
    }, [setTags])

    const renderItem = useCallback(({ item: { id, name } }) => (
        <TagOption
            id={id}
            tag={name}
            onToggle={onToggleTag}
            isSelected={tags.includes(id)}
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
                keyExtractor={({ id }) => id}
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
