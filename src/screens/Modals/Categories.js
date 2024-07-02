import { forwardRef, useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import { ModalSheet, Category, SmallInput, SquareButton, Typography, Separator } from '@/components'
import { useCategories } from '@/hooks'
import * as Crypto from 'expo-crypto'

export const Categories = forwardRef(({ selectedCategories, handleCategories, onClose }, ref) => {
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

    const renderItems = useCallback(({ id, name }) => (
        <Category
            key={id}
            category={name}
            onPress={() => handleCategories(id)}
            isSelected={selectedCategories.includes(id)}
        />
    ), [selectedCategories])

    return (
        <ModalSheet
            ref={ref}
            onClose={onClose}
            snapPoints={['50%', '95%']}
            title={t('categories.update')}
            contentContainerStyle={{
                flex: 1,
                paddingBottom: 24,
                paddingHorizontal: 24
            }}
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

            <FlatList
                horizontal={false}
                data={categories.slice(1)}
                keyExtractor={({ id }) => id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={<Separator />}
                renderItem={({ item }) => renderItems(item)}
                ListEmptyComponent={() => (
                    <Typography
                        opacity={0.5}
                    >
                        {t('message.noCategories')}
                    </Typography>
                )}
            // contentContainerStyle={{
            //     paddingBottom: 24,
            //     paddingHorizontal: 24
            // }}
            />
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    inputContainer: {
        gap: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoriesContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 24,
        alignItems: 'center',
    },
})
