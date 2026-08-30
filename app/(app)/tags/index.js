import { randomUUID } from 'expo-crypto'
import { useState, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedList, SmallInput, SquareButton, SwipeableTag } from '@/components'
import { UpdateTag } from '@/screens/modals'
import { useTags, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export default function Tags() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()

    const {
        tags,
        addTag,
        deleteTag
    } = useTags()

    const [tag, setTag] = useState('')
    const [selectedId, setSelectedId] = useState('')
    const [visible, setVisible] = useState(false)
    const [isOpen, setIsOpen] = useState(null)

    const showDialog = useCallback(() => setVisible(true), [])
    const hideDialog = useCallback(() => setVisible(false), [])

    const onOpenDialog = useCallback((id) => {
        showDialog()
        setSelectedId(id)
    }, [showDialog])

    const onSave = useCallback((tag) => {
        addTag({
            id: randomUUID(),
            name: tag.trim()
        })

        setTag('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }, [addTag, vibrate])

    const onDelete = useCallback((id) => {
        deleteTag(id)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }, [deleteTag, vibrate])

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <SmallInput
                    value={tag}
                    onChangeText={setTag}
                    placeholder={t('placeholder.tag')}
                    accessibilityLabel={t('placeholder.tag')}
                />
                <SquareButton
                    onPress={() => onSave(tag)}
                    disabled={tag.trim().length === 0}
                    accessibilityLabel={t('action.add')}
                />
            </View>

            <AnimatedList
                gap={2}
                data={tags}
                keyExtractor={({ id }) => id}
                emptyLabel={t('message.tags.empty')}
                renderItem={({ item, index }) => (
                    <SwipeableTag
                        tag={item.name}
                        isOpen={isOpen === item.id}
                        onPress={() => onOpenDialog(item.id)}
                        onOpen={() => setIsOpen(item.id)}
                        onDelete={() => onDelete(item.id)}
                        isFirst={index === 0}
                        isLast={index === tags.length - 1}
                    />
                )}
            />

            <UpdateTag
                visible={visible}
                onDismiss={hideDialog}
                selectedId={selectedId}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    top: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8
    }
})
