import { useEffect, useState } from 'react'
import * as Crypto from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SwipeableCategory, SmallInput, SquareButton, UpdateCategoryModal, Toast, Typography, Section } from '@/components'
import { useCategories } from '@/hooks'
import { colors } from '@/constants'

export default function Categories() {
    const { t } = useTranslation()
    const { categories, addCategory, removeCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')
    const [categorySelected, setCategorySelected] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [message, setMessage] = useState('')
    const [isCategoryUpdated, setIsCategoryUpdated] = useState(false)

    useEffect(() => {
        if (isCategoryUpdated) {
            setIsCategoryUpdated(false)
            handleToast(t('message.categoryUpdated'))
        }
    }, [isCategoryUpdated])

    const handleModal = (id) => {
        setIsModalVisible(!isModalVisible)
        setCategorySelected(id)
    }

    const handleAddCategory = (category) => {
        if (!category.trim()) {
            handleToast(t('message.emptyCategory'))
            return
        }

        addCategory({
            id: Crypto.randomUUID(),
            name: category.trim()
        })

        setNewCategory('')
        handleToast(t('message.categoryAdded'))
    }

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <SmallInput
                    variant='solid'
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder={t('placeholder.category')}
                />
                <SquareButton
                    label={t('categories.add')}
                    onPress={() => handleAddCategory(newCategory)}
                />
            </View>
            <Section
                title={t('title.yourCategories')}
                containerStyle={styles.sectionContainer}
                contentStyle={styles.sectionContainer}
            >
                {categories.length === 1 ? (
                    <Typography
                        opacity={0.5}
                    >
                        {t('message.noCategories')}
                    </Typography>
                ) : (
                    <ScrollView
                        overScrollMode='never'
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.categoryCardsContainer}>
                            {categories.slice(1).map(({ id, name }) => (
                                <SwipeableCategory
                                    key={id}
                                    category={name}
                                    onPress={() => handleModal(id)}
                                    onDelete={() => removeCategory(id)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </Section>

            <UpdateCategoryModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(!isModalVisible)}
                categorySelected={categorySelected}
                setIsCategoryUpdated={setIsCategoryUpdated}
            />
            <Toast message={message} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    inputContainer: {
        gap: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    categoryCardsContainer: {
        width: '100%',
        gap: 16,
        paddingBottom: 24,
    },
})
