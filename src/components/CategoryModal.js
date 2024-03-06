import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Category } from './SwipeableCategory'
import { ModalSheet } from './Modal'
import { useCategories } from '../hooks'
import { colors, fonts } from '../constants'

export function CategoryModal({ isVisible, onClose, noteCategories, handleAddCategory }) {
    const { categories, addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')

    return (
        <ModalSheet
            isVisible={isVisible}
            onClose={onClose}
            title='Add Category or select one'
        >
            <View style={styles.inputContainer}>
                <TextInput
                    value={newCategory}
                    style={styles.input}
                    placeholder='Add category...'
                    placeholderTextColor={colors.text50}
                    onChangeText={(text) => setNewCategory(text)}
                />
                <Pressable
                    style={styles.addCategoryButton}
                    onPress={() => addCategory(newCategory)}
                >
                    <Text style={styles.addCategoryText}>
                        Add
                    </Text>
                </Pressable>
            </View>
            <View style={styles.categoriesContainer}>
                {categories.length === 1 ? (
                    <Text style={styles.label}>
                        You don't have any category yet
                    </Text>
                ) : (
                    <ScrollView
                        overScrollMode='never'
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {categories.slice(1).map((category, index) => (
                            <Category
                                key={index}
                                category={category}
                                onPress={() => handleAddCategory(category)}
                                isSelected={noteCategories.includes(category)}
                            />
                        ))}
                    </ScrollView>
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
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        borderRadius: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        backgroundColor: colors.text15,
    },
    addCategoryButton: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.primary,
    },
    addCategoryText: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
    categoriesContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        color: colors.text50,
        fontFamily: fonts.mono,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
})
