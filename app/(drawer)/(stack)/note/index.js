import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, CategoriesModal, Chip, ChipContent, ImagePreview, LargeInput, PickerImage, RemoveChipButton, TextArea, Toast, Typography } from '@/components'
import ImageView from 'react-native-image-viewing'
import { useCategories, useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES, colors } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote } = useNotes()
    const { categories } = useCategories()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categoryIds, setCategoryIds] = useState([DEFAULT_CATEGORIES[0].id])
    const [images, setImages] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('headerTitle.addNote'))

    const handleSave = () => {
        if (!title.trim()) {
            handleToast(t('messages.emptyTitle'))
            return
        }

        if (!note.trim()) {
            handleToast(t('messages.emptyNote'))
            return
        }

        saveNote({
            id: Crypto.randomUUID(),
            title: title.trim(),
            note: note.trim(),
            images,
            categories: categoryIds,
            createdAt: getDate(),
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

    const handleToast = (message) => {
        setMessage(message)
        setTimeout(() => setMessage(''), 3000)
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
                            <Typography
                                opacity={0.5}
                                variant='subtitle'
                            >
                                {t('title.categories')}
                            </Typography>
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
                        <Typography
                            opacity={0.5}
                            variant='subtitle'
                        >
                            {t('title.note')}
                        </Typography>
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

            <CategoriesModal
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
            <Toast message={message} />
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
