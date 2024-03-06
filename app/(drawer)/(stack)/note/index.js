import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, CategoryModal, Chip, ChipContent, LargeInput, RemoveChipButton, TextArea, TitleSection } from '../../../../src/components'
import { useHeaderTitle, useNotes } from '../../../../src/hooks'
import { getDate } from '../../../../src/utils'
import { colors } from '../../../../src/constants'

export default function Note() {
    const { saveNote } = useNotes()
    const { t } = useTranslation()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(['All'])
    const [isModalVisible, setIsModalVisible] = useState(false)

    useHeaderTitle(t('headerTitle.addNote'))

    const handleSave = () => {
        saveNote({
            id: Crypto.randomUUID(),
            title,
            note,
            categories,
            createdAt: getDate(),
        })

        router.navigate('/(drawer)/(stack)/home')
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
                            placeholder={t('addNote.titlePlaceholder')}
                        />
                    </View>
                    <View style={styles.categoriesContainer}>
                        <View style={styles.titleContainer}>
                            <TitleSection title={t('title.categories')} />
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
                                    variant='bordered'
                                    onPress={handleModal}
                                    label={t('categories.add')}
                                    endContent={<ChipContent />}
                                />
                            </View>
                        </ScrollView>
                    </View>
                    <View style={styles.sectionContainer}>
                        <TitleSection title={t('title.note')} />
                        <TextArea
                            value={note}
                            onChangeText={setNote}
                            placeholder={t('addNote.notePlaceholder')}
                        />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button
                            variant='primary'
                            label={t('buttons.save')}
                            onPress={handleSave}
                        />
                        <Button
                            variant='secondary'
                            label={t('buttons.cancel')}
                            onPress={() => router.navigate('/(drawer)/(stack)/home')}
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
