import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, CategoryModal, Chip, ChipContent, ImagePreview, LargeInput, PickerImage, RemoveChipButton, TextArea, TitleSection } from '@/components'
import ImageView from 'react-native-image-viewing'
import { useCategories, useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { colors, fonts } from '@/constants'

export default function EditNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { categories } = useCategories()
    const { getNote, updateNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([])
    const [categoryIds, setCategoryIds] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)

    useHeaderTitle(t('headerTitle.editNote'))

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setImages(note.images)
        setCategoryIds(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
    }, [slug])

    const handleSave = () => {
        updateNote({
            id: slug,
            title,
            note,
            images,
            categories: categoryIds,
            createdAt,
            updatedAt: getDate(),
        })

        router.navigate('/(drawer)/(stack)/home')
    }

    const handleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handleAddCategory = (id) => {
        if (!categoryIds.includes(id)) {
            setCategoryIds([...categoryIds, id])
        } else {
            setCategoryIds(categoryIds.filter((categoryId) => categoryId !== id))
        }
    }

    const handleAddImage = (image) => {
        setImages([...images, image])
    }

    const handleRemoveImage = (image) => {
        setImages(images.filter((img) => img !== image))
    }

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
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
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>
                            {updatedAt
                                ? `${t('editNote.updated')} ${updatedAt}`
                                : `${t('editNote.created')} ${createdAt}`
                            }
                        </Text>
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
                                {categories.slice(1).map(({ id, name }) => categoryIds.includes(id) && (
                                    <Chip
                                        key={id}
                                        label={name}
                                        variant='solid'
                                        endContent={
                                            <RemoveChipButton
                                                onPress={() => handleAddCategory(id)}
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
                    <ScrollView
                        horizontal
                        overScrollMode='never'
                        showsHorizontalScrollIndicator={false}
                    >
                        <View style={styles.imagesContainer}>
                            {images.length > 0 &&
                                <View style={styles.previewsContainer}>
                                    {images.map((image, index) => (
                                        <ImagePreview
                                            key={index}
                                            image={image}
                                            openImage={() => handleOpenImage(index)}
                                            removeImage={() => handleRemoveImage(image)}
                                        />
                                    ))}
                                </View>
                            }
                            <View style={styles.pickerContainer}>
                                <PickerImage
                                    pickCamera
                                    setImage={handleAddImage}
                                />
                                <View style={styles.separator} />
                                <PickerImage setImage={handleAddImage} />
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.buttonsContainer}>
                        <Button
                            variant='primary'
                            label={t('buttons.save')}
                            onPress={handleSave}
                        />
                        <Button
                            variant='outline'
                            label={t('buttons.cancel')}
                            onPress={() => router.navigate('/(drawer)/(stack)/home')}
                        />
                    </View>
                </View>
            </ScrollView>

            <CategoryModal
                isVisible={isModalVisible}
                onClose={handleModal}
                noteCategories={categoryIds}
                handleAddCategory={handleAddCategory}
            />
            <ImageView
                imageIndex={galleryIndex}
                visible={isGalleryVisible}
                images={images.map((url) => ({ uri: url }))}
                onRequestClose={() => setIsGalleryVisible(false)}
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
    imagesContainer: {
        width: '100%',
        gap: 8,
        marginTop: 16,
        flexDirection: 'row',
        paddingHorizontal: 24,
    },
    pickerContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        position: 'absolute',
        width: '100%',
        height: 1,
        opacity: 0.5,
        backgroundColor: colors.foreground,
    },
    previewsContainer: {
        gap: 8,
        flexDirection: 'row',
    },
})
