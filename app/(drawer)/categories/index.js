import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { CategoryCard, HomeMessage, SquareButton, TitleSection } from '../../../src/components'
import { useCategories } from '../../../src/hooks'
import { colors, fonts } from '../../../src/constants'

export default function Categories() {
    const { t } = useTranslation()
    const [newCategory, setNewCategory] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { categories, addCategory, removeCategory } = useCategories()

    const handleModal = (option) => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    value={newCategory}
                    style={styles.input}
                    placeholder={t('categories.newCategory')}
                    placeholderTextColor={colors.text50}
                    onChangeText={(text) => setNewCategory(text)}
                />
                <SquareButton
                    label={t('categories.add')}
                    onPress={() => addCategory(newCategory)}
                />
            </View>

            <View style={styles.sectionContainer}>
                <TitleSection title={t('categories.yourCategories')} />
            </View>

            <View style={styles.categoriesContainer}>
                {categories.length === 1 ? (
                    <HomeMessage label={t('messages.noCategories')} />
                ) : (
                    <ScrollView
                        overScrollMode='never'
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.categoryCardsContainer}>
                            {categories.slice(1).map((category, index) => (
                                <CategoryCard
                                    key={index}
                                    category={category}
                                    onDelete={() => removeCategory(category)}
                                />
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    sectionContainer: {
        padding: 24,
    },
    inputContainer: {
        gap: 16,
        paddingBottom: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        height: 72,
        padding: 16,
        fontSize: 16,
        borderRadius: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        backgroundColor: colors.foreground,
    },
    categoriesContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    categoryCardsContainer: {
        flex: 1,
        gap: 16,
        paddingBottom: 24,
    },
})
