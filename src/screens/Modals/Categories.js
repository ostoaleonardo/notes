import { forwardRef, useCallback, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { FlatList } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import { ModalSheet, SmallInput, SquareButton, Typography, Separator } from '@/components'
import { CategoryOption } from '../notes'
import { useCategories, useHaptics } from '@/hooks'
import { FEEDBACK_TYPES } from '@/constants'

export const Categories = forwardRef(({ categories, setCategories, onClose }, ref) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { vibrate } = useHaptics()
    const { categories: allCategories, addCategory } = useCategories()

    const [category, setCategory] = useState('')

    const onSaveCategory = () => {
        addCategory({
            id: randomUUID(),
            name: category.trim()
        })

        setCategory('')
        vibrate(FEEDBACK_TYPES.SUCCESS)
    }

    const onCategories = (id) => {
        if (!categories.includes(id)) {
            setCategories([...categories, id])
        } else {
            setCategories(categories.filter((categoryId) => categoryId !== id))
        }
    }

    const renderItems = useCallback(({ id, name }) => (
        <CategoryOption
            key={id}
            category={name}
            onPress={() => onCategories(id)}
            isSelected={categories.includes(id)}
        />
    ), [categories])

    return (
        <ModalSheet
            ref={ref}
            scrollable
            onClose={onClose}
            snapPoints={['50%', '95%']}
            title={t('title.categories')}
        >
            <View style={styles.container}>
                <SmallInput
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('placeholder.category')}
                    background={colors.surfaceVariant}
                />
                <SquareButton
                    disabled={!category.trim()}
                    onPress={onSaveCategory}
                />
            </View>

            <FlatList
                alignItems='center'
                data={allCategories.slice(1)}
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
                            {t('message.categories.empty')}
                        </Typography>
                    </View>
                )}
            />
        </ModalSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        gap: 16,
        padding: 16,
        paddingTop: 0,
        flexDirection: 'row'
    }
})
