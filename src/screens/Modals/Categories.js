import { forwardRef, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import * as Crypto from 'expo-crypto'
import { ModalSheet, Category, SmallInput, SquareButton, Typography, Separator } from '@/components'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export const Categories = forwardRef(({ selectedCategories, handleCategories, onClose }, ref) => {
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { categories, addCategory } = useCategories()
    const [category, setCategory] = useState('')

    const handleSaveCategory = () => {
        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })

        setCategory('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
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
            title={t('title.yourCategories')}
        >
            <View style={styles.inputContainer}>
                <SmallInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    disabled={!category.trim()}
                    label={t('categories.add')}
                    onPress={handleSaveCategory}
                />
            </View>

            <FlatList
                alignItems='center'
                data={categories.slice(1)}
                keyExtractor={({ id }) => id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={<Separator style={{ marginHorizontal: 24 }} />}
                renderItem={({ item }) => renderItems(item)}
                ListEmptyComponent={() => (
                    <View style={{ paddingTop: 64 }}>
                        <Typography
                            opacity={0.5}
                        >
                            {t('message.noCategories')}
                        </Typography>
                    </View>
                )}
            />
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    inputContainer: {
        gap: 16,
        padding: 24,
        paddingTop: 0,
        flexDirection: 'row'
    }
})
