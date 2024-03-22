import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CategoriesModal, CategoryCarousel, ImageCarousel, LargeInput, NoteButtons, PasswordModal, Scroll, Section, TextArea, Toast } from '@/components'
import ImageView from 'react-native-image-viewing'
import { useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES, colors } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categoryIds, setCategoryIds] = useState([DEFAULT_CATEGORIES[0].id])
    const [images, setImages] = useState([])
    const [password, setPassword] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
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
            password,
            categories: categoryIds,
            createdAt: getDate(),
        })

        router.navigate('/(drawer)/(stack)/home')
    }

    const handleCategoriesModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    const handlePasswordModal = () => {
        setIsPasswordModalVisible(!isPasswordModalVisible)
    }

    const handlePassword = (password) => {
        setPassword(password)
        setIsPasswordModalVisible(false)
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
            <Scroll
                contentStyle={styles.scrollContainer}
            >
                <Section
                    paddingHorizontal={24}
                >
                    <LargeInput
                        multiline
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('addNote.titlePlaceholder')}
                    />
                </Section>

                <Section
                    paddingVertical={24}
                    title={t('title.categories')}
                >
                    <CategoryCarousel
                        categoryIds={categoryIds}
                        onAddCategory={handleAddCategory}
                        onCategoriesModal={handleCategoriesModal}
                    />
                </Section>

                <Section
                    title={t('title.note')}
                    contentStyle={{ paddingHorizontal: 24 }}
                >
                    <TextArea
                        value={note}
                        onChangeText={setNote}
                        placeholder={t('addNote.notePlaceholder')}
                    />
                </Section>

                <ImageCarousel
                    images={images}
                    onAddImage={handleAddImage}
                    onOpenImage={handleOpenImage}
                    onRemoveImage={handleRemoveImage}
                />

                <NoteButtons
                    onSave={handleSave}
                    onOpenModal={handlePasswordModal}
                    hasPassword={!!password}
                />
            </Scroll>

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
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        width: '100%',
        paddingVertical: 24,
    },
})
