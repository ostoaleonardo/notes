import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { LargeInput, Scroll, Section, TextArea, Toast } from '@/components'
import { CategoriesModal, CategoryCarousel, ImageCarousel, NoteButtons, PasswordModal } from '@/screens'
import { useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categoryIds, setCategoryIds] = useState([DEFAULT_CATEGORIES[0].id])
    const [images, setImages] = useState([])
    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('header.addNote'))

    const handleSave = () => {
        if (!title.trim()) {
            handleToast(t('message.emptyTitle'))
            return
        }

        if (!note.trim()) {
            handleToast(t('message.emptyNote'))
            return
        }

        saveNote({
            id: Crypto.randomUUID(),
            title: title.trim(),
            note: note.trim(),
            images,
            password,
            biometrics,
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
            <Scroll contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topContainer}>
                    <View>
                        <Section
                            paddingHorizontal={24}
                        >
                            <LargeInput
                                bold
                                multiline
                                value={title}
                                onChangeText={setTitle}
                                placeholder={t('placeholder.title')}
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
                                placeholder={t('placeholder.note')}
                            />
                        </Section>
                    </View>

                    <ImageCarousel
                        images={images}
                        onAddImage={handleAddImage}
                        onOpenImage={handleOpenImage}
                        onRemoveImage={handleRemoveImage}
                    />
                </View>

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
                biometrics={biometrics}
                setBiometrics={setBiometrics}
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
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 24,
    },
    topContainer: {
        flex: 1,
        gap: 40,
        justifyContent: 'space-between',
    },
})
