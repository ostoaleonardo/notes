import { useCallback, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import { SmallInput, SquareButton, Typography, Separator } from '@/components'
import { TagOption } from '../notes'
import { useTags, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export function Tags({ tags, setTags }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { tags: allTags, addTag } = useTags()

    const [tag, setTag] = useState('')

    const onSaveTag = () => {
        addTag({
            id: randomUUID(),
            name: tag.trim()
        })

        setTag('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    const onTags = (id) => {
        if (!tags.includes(id)) {
            setTags([...tags, id])
        } else {
            setTags(tags.filter((tagId) => tagId !== id))
        }
    }

    const renderItems = useCallback(({ id, name }) => (
        <TagOption
            key={id}
            tag={name}
            onPress={() => onTags(id)}
            isSelected={tags.includes(id)}
        />
    ), [tags])

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
                renderItem={({ item }) => renderItems(item)}
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
