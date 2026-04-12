import { randomUUID } from 'expo-crypto'
import { useState, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedList, SmallInput, SquareButton, SwipeableCategory } from '@/components'
import { UpdateCategory } from '@/screens/modals'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export default function Categories() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()

    const {
        categories,
        addCategory,
        deleteCategory
    } = useCategories()

    const [category, setCategory] = useState('')
    const [selectedId, setSelectedId] = useState('')
    const [visible, setVisible] = useState(false)
    const [isOpen, setIsOpen] = useState(null)

    const showDialog = useCallback(() => setVisible(true), [])
    const hideDialog = useCallback(() => setVisible(false), [])

    const onOpenDialog = useCallback((id) => {
        showDialog()
        setSelectedId(id)
    }, [showDialog])

    const onSave = useCallback((category) => {
        addCategory({
            id: randomUUID(),
            name: category.trim()
        })

        setCategory('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }, [addCategory, vibrate])

    const onDelete = useCallback((id) => {
        deleteCategory(id)
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }, [deleteCategory, vibrate])

    const userCategories = useMemo(() => categories.slice(1), [categories])

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <SmallInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('placeholder.category')}
                    accessibilityLabel={t('placeholder.category')}
                />
                <SquareButton
                    onPress={() => onSave(category)}
                    disabled={category.trim().length === 0}
                    accessibilityLabel={t('action.add')}
                />
            </View>

            <AnimatedList
                gap={2}
                data={userCategories}
                keyExtractor={({ id }) => id}
                emptyLabel={t('message.categories.empty')}
                renderItem={({ item, index }) => (
                    <SwipeableCategory
                        category={item.name}
                        isOpen={isOpen === item.id}
                        onPress={() => onOpenDialog(item.id)}
                        onOpen={() => setIsOpen(item.id)}
                        onDelete={() => onDelete(item.id)}
                        isFirst={index === 0}
                        isLast={index === userCategories.length - 1}
                    />
                )}
            />

            <UpdateCategory
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
