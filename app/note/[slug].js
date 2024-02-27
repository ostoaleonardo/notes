import { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button, CategoryModal, Chip, ChipContent, LargeInput, RemoveChipButton, TextArea, TitleSection } from '../../src/components'
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
                        <LargeInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder='Your title...'
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {updatedAt ? `Updated: ${updatedAt}` : `Created: ${createdAt}`}
                        </Text>
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
    dateContainer: {
        width: '100%',
        marginTop: 8,
        paddingHorizontal: 24,
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
