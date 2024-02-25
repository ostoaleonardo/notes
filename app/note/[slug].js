import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button, CategoryModal, Chip, ChipContent, RemoveChipButton } from '../../src/components'
import { useNotes } from '../../src/hooks'
import { getDate } from '../../src/utils'
import { colors, fonts } from '../../src/constants'

export default function EditNote() {
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setCategories(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
    }, [slug])

    const handleSave = () => {
        updateNote({
            id: slug,
            title,
            note,
            categories,
            createdAt,
            updatedAt: getDate(),
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
                        <TextInput
                            multiline
                            value={title}
                            style={styles.title}
                            placeholder='Your title...'
                            onChangeText={(text) => setTitle(text)}
                            placeholderTextColor={`${colors.text}80`}
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {updatedAt ? `Updated: ${updatedAt}` : `Created: ${createdAt}`}
                        </Text>
                    </View>
                    <View style={styles.categoriesContainer}>
                        <Text style={styles.label}>
                            Categories:
                        </Text>
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
                                    endContent={
                                        <ChipContent />
                                    }
                                />
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>
                            Note:
                        </Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            multiline
                            value={note}
                            style={styles.input}
                            placeholder='Type your note here...'
                            onChangeText={(text) => setNote(text)}
                            placeholderTextColor={`${colors.text}80`}
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
        padding: 24,
        alignItems: 'flex-start',
    },
    titleContainer: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    dateContainer: {
        width: '100%',
        marginTop: 8,
        marginBottom: 24,
    },
    date: {
        fontSize: 12,
        opacity: 0.5,
        color: colors.text,
        fontFamily: fonts.mono,
        textTransform: 'uppercase',
    },
    categoriesContainer: {
        width: '100%',
        marginBottom: 16,
    },
    scrollCategories: {
        width: '100%',
        paddingVertical: 16,
    },
    chipsContainer: {
        gap: 8,
        flexDirection: 'row',
    },
    labelContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        opacity: 0.8,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    inputContainer: {
        width: '100%',
        minHeight: 200,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.foreground,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.mono,
    },
    buttonsContainer: {
        width: '100%',
        marginTop: 32,
        gap: 16,
    },
})
