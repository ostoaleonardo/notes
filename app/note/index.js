import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, CategoryModal, Chip, ChipContent, LargeInput, RemoveChipButton, TextArea, TitleSection } from '../../src/components'
import { useNotes } from '../../src/hooks'
import { getDate } from '../../src/utils'
import { colors } from '../../src/constants'

export default function Note() {
    const { saveNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(['All'])
    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleSave = () => {
        saveNote({
            id: Crypto.randomUUID(),
            title,
            note,
            categories,
            createdAt: getDate(),
        })

        router.navigate('/')
    }

    const handleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handleAddCategory = (category) => {
        if (category && !categories.includes(category)) {
            setCategories([...categories, category])
        } else {
            setCategories(categories.filter((c) => c !== category))
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView
                overScrollMode='never'
                style={styles.scrollContainer}
            >
                <View style={styles.noteContainer}>
                    <View style={styles.titleContainer}>
                        <LargeInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder='Your title...'
                        />
                    </View>
                    <View style={styles.categoriesContainer}>
                        <View style={styles.titleContainer}>
                            <TitleSection title='Categories' />
                        </View>
                        <ScrollView
                            horizontal
                            overScrollMode='never'
                            style={styles.scrollCategories}
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={styles.chipsContainer}>
                                {categories.slice(1).map((category) => (
                                    <Chip
                                        key={category}
                                        label={category}
                                        variant='solid'
                                        endContent={
                                            <RemoveChipButton
                                                onPress={() => handleAddCategory(category)}
                                            />
                                        }
                                    />
                                ))}
                                <Chip
                                    label='Add'
                                    variant='bordered'
                                    onPress={handleModal}
                                    endContent={<ChipContent />}
                                />
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.sectionContainer}>
                        <TitleSection title='Note' />
                        <TextArea
                            value={note}
                            onChangeText={setNote}
                            placeholder='Type your note here...'
                        />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button
                            label='Save'
                            variant='primary'
                            onPress={handleSave}
                        />
                        <Button
                            label='Cancel'
                            variant='secondary'
                            onPress={() => router.navigate('/')}
                        />
                    </View>
                </View>
            </ScrollView>
            <CategoryModal
                isVisible={isModalVisible}
                onClose={handleModal}
                noteCategories={categories}
                handleAddCategory={handleAddCategory}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    noteContainer: {
        width: '100%',
        paddingVertical: 24,
    },
    titleContainer: {
        width: '100%',
        paddingHorizontal: 24,
    },
    categoriesContainer: {
        width: '100%',
        marginTop: 24,
        marginBottom: 16,
    },
    scrollCategories: {
        width: '100%',
        paddingVertical: 16,
    },
    chipsContainer: {
        gap: 8,
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
    sectionContainer: {
        width: '100%',
        gap: 16,
        paddingHorizontal: 24,
    },
    buttonsContainer: {
        width: '100%',
        gap: 16,
        marginTop: 32,
        paddingHorizontal: 24,
    },
})
