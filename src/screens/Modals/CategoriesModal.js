import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Category, ModalSheet, Scroll, SmallInput, SquareButton, Typography } from '@/components'
import { useCategories } from '@/hooks'
import * as Crypto from 'expo-crypto'

export function CategoriesModal({ isVisible, onClose, noteCategories, handleAddCategory }) {
    const { t } = useTranslation()
    const { categories, addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)

    useEffect(() => {
        setIsButtonDisabled(!newCategory.trim())
    }, [newCategory])

    const handleSaveCategory = (category) => {
        if (!category.trim()) return

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })
        setNewCategory('')
    }

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title={t('title.yourCategories')}
        >
            <View style={styles.inputContainer}>
                <SmallInput
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    disabled={isButtonDisabled}
                    label={t('categories.add')}
                    onPress={() => handleSaveCategory(newCategory)}
                />
            </View>
            <View style={styles.categoriesContainer}>
                {categories.length === 1 ? (
                    <Typography
                        opacity={0.5}
                    >
                        {t('message.noCategories')}
                    </Typography>
                ) : (
                    <Scroll contentStyle={styles.contentContainer}>
                        {categories.slice(1).map(({ id, name }) => (
                            <Category
                                key={id}
                                category={name}
                                onPress={() => handleAddCategory(id)}
                                isSelected={noteCategories.includes(id)}
                            />
                        ))}
                    </Scroll>
                )}
            </View>
        </ModalSheet>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        gap: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoriesContainer: {
        minHeight: 200,
        maxHeight: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        paddingBottom: 24,
        alignItems: 'center',
    },
})
