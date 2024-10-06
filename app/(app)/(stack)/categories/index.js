import { randomUUID } from 'expo-crypto'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SmallInput, SnackBar, SquareButton } from '@/components'
import { CategoriesContainer, UpdateCategory } from '@/screens'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export default function Categories() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addCategory } = useCategories()

    const [category, setCategory] = useState('')
    const [selectedId, setSelectedId] = useState('')

    const [message, setMessage] = useState('')
    const [isUpdated, setIsUpdated] = useState(false)

    const [visible, setVisible] = useState(false)

    const showDialog = () => setVisible(true)
    const hideDialog = () => setVisible(false)

    useEffect(() => {
        if (isUpdated) {
            setSelectedId('')
            setIsUpdated(false)
            setMessage(t('message.categoryUpdated'))
        }
    }, [isUpdated])

    const onOpenDialog = (id) => {
        showDialog()
        setSelectedId(id)
    }

    const onSave = (category) => {
        addCategory({
            id: randomUUID(),
            name: category.trim()
        })

        setCategory('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
        setMessage(t('message.categoryAdded'))
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <SmallInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    label={t('categories.add')}
                    disabled={!category.trim()}
                    onPress={() => onSave(category)}
                />
            </View>
            <CategoriesContainer
                onPress={onOpenDialog}
            />

            <UpdateCategory
                visible={visible}
                onDismiss={hideDialog}
                selectedId={selectedId}
                setIsUpdated={setIsUpdated}
            />
            <SnackBar
                message={message}
                setMessage={setMessage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 24
    },
    inputContainer: {
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        justifyContent: 'space-between'
    }
})
