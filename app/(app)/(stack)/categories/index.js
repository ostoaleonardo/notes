import { randomUUID } from 'expo-crypto'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SmallInput, SquareButton } from '@/components'
import { CategoriesContainer, UpdateCategory } from '@/screens'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export default function Categories() {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { addCategory } = useCategories()

    const [category, setCategory] = useState('')
    const [selectedId, setSelectedId] = useState('')

    const [isUpdated, setIsUpdated] = useState(false)

    const [visible, setVisible] = useState(false)

    const showDialog = () => setVisible(true)
    const hideDialog = () => setVisible(false)

    useEffect(() => {
        if (isUpdated) {
            setSelectedId('')
            setIsUpdated(false)
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
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.top}>
                <SmallInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    onPress={() => onSave(category)}
                    disabled={category.trim().length === 0}
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
        </View>
    )
}

const styles = StyleSheet.create({
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
