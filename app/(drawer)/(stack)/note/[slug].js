import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, CategoriesModal, Chip, ChipContent, IconButton, ImagePreview, LargeInput, PasswordModal, PickerImage, RemoveChipButton, TextArea, Toast, Typography } from '@/components'
import ImageView from 'react-native-image-viewing'
import { useCategories, useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { Lock, Unlock } from '@/icons'
import { colors } from '@/constants'

export default function EditNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { categories } = useCategories()
    const { getNote, updateNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([])
    const [password, setPassword] = useState('')
    const [categoryIds, setCategoryIds] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('headerTitle.editNote'))

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setImages(note.images)
        setPassword(note.password)
        setCategoryIds(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
    }, [slug])

    const handleSave = () => {
        if (!title.trim()) {
            handleToast(t('messages.emptyTitle'))
            return
        }

        if (!note.trim()) {
            handleToast(t('messages.emptyNote'))
            return
        }

        updateNote({
            id: slug,
            title: title.trim(),
            note: note.trim(),
            images,
            password,
            categories: categoryIds,
            createdAt,
            updatedAt: getDate(),
        })

        router.navigate('/(drawer)/(stack)/home')
    }

    const handleCategoriesModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handlePasswordModal = () => {
        setIsPasswordModalVisible(!isPasswordModalVisible)
    }

    const handleAddCategory = (id) => {
        if (!categoryIds.includes(id)) {
            setCategoryIds([...categoryIds, id])
        } else {
            setCategoryIds(categoryIds.filter((categoryId) => categoryId !== id))
        }
    }

    const handlePassword = (password) => {
        setPassword(password)
        setIsPasswordModalVisible(false)
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
                            multiline
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t('addNote.titlePlaceholder')}
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <Typography
                            uppercase
                            opacity={0.5}
                            variant='caption'
                        >
                            {updatedAt
                                ? `${t('editNote.updated')} ${updatedAt}`
                                : `${t('editNote.created')} ${createdAt}`
                            }
                        </Typography>
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
                                    label={t('categories.add')}
                                    endContent={<ChipContent />}
                                    onPress={handleCategoriesModal}
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
                        <View style={styles.rowContainer}>
                            <Button
                                flex={1}
                                variant='primary'
                                label={t('buttons.save')}
                                onPress={handleSave}
                            />
                            <IconButton
                                size='md'
                                variant='secondary'
                                onPress={() => setIsPasswordModalVisible(true)}
                                icon={
                                    password
                                        ? <Lock
                                            width={20}
                                            height={20}
                                            color={colors.background}
                                        />
                                        : <Unlock
                                            width={20}
                                            height={20}
                                            color={colors.background}
                                        />
                                }
                            />
                        </View>
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
                onClose={handleCategoriesModal}
                noteCategories={categoryIds}
                handleAddCategory={handleAddCategory}
            />
            <PasswordModal
                isVisible={isPasswordModalVisible}
                onClose={handlePasswordModal}
                handlePassword={handlePassword}
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
    dateContainer: {
        width: '100%',
        marginTop: 8,
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
    rowContainer: {
        width: '100%',
        gap: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
