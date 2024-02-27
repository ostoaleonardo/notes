import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, fonts } from '../constants'
import { Check } from './Check'
import { useCategories } from '../hooks'
import { Category } from './SwipeableCategory'

export function CategoryModal({ isVisible, onClose, noteCategories, handleAddCategory }) {
    const { categories, addCategory } = useCategories()
    const [newCategory, setNewCategory] = useState('')

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType='slide'
        >
            <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        Add Category or select one
                    </Text>
                    <Pressable onPress={onClose}>
                        <Text style={styles.closeText}>✕</Text>
                    </Pressable>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={newCategory}
                        style={styles.input}
                        placeholder='Add category...'
                        placeholderTextColor={`${colors.text}80`}
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
            </View>
        </Modal >
    )
}

const styles = StyleSheet.create({
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: colors.background,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    closeText: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    inputContainer: {
        gap: 16,
        paddingVertical: 24,
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
        backgroundColor: `${colors.text}26`,
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
        fontFamily: fonts.mono,
        color: `${colors.text}80`,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
})
