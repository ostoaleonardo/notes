import { useState } from 'react'
import { router } from 'expo-router'
import * as Crypto from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { LargeInput, Scroll, Section, TextArea, Toast } from '@/components'
import { AddPassword, Categories, CategoryCarousel, ImageCarousel, NoteButtons } from '@/screens'
import { useBottomSheet, useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES, ROUTES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote } = useNotes()

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(({ id }) => id))
    const [images, setImages] = useState([])
    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('header.addNote'))

    const {
        ref: categoriesBottomRef,
        onOpen: onOpenCategories,
        onClose: onCloseCategories
    } = useBottomSheet()

    const {
        ref: passwordBottomRef,
        onOpen: onOpenPassword,
        onClose: onClosePassword
    } = useBottomSheet()

    const handleSave = () => {
        if (!title.trim()) {
            setMessage(t('message.emptyTitle'))
            return
        }

        if (!note.trim()) {
            setMessage(t('message.emptyNote'))
            return
        }

        saveNote({
            id: Crypto.randomUUID(),
            title: title.trim(),
            note: note.trim(),
            images,
            password,
            biometrics,
            categories,
            createdAt: getDate(),
        })

        router.navigate(ROUTES.HOME)
    }

    const handleCategories = (id) => {
        if (!categories.includes(id)) {
            setCategories([...categories, id])
        } else {
            setCategories(categories.filter((categoryId) => categoryId !== id))
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
        <View style={{ flex: 1 }}>
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
                            title={t('title.categories')}
                            paddingVertical={24}
                        >
                            <CategoryCarousel
                                selectedCategories={categories}
                                onCategories={handleCategories}
                                onCategoriesModal={onOpenCategories}
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
                    hasPassword={!!password}
                    onOpenModal={onOpenPassword}
                />
            </Scroll>

            <Categories
                ref={categoriesBottomRef}
                onClose={onCloseCategories}
                selectedCategories={categories}
                handleCategories={handleCategories}
            />
            <AddPassword
                ref={passwordBottomRef}
                onClose={onClosePassword}
                setPassword={setPassword}
                biometrics={biometrics}
                setBiometrics={setBiometrics}
            />
            <ImageView
                imageIndex={galleryIndex}
                visible={isGalleryVisible}
                images={images.map((url) => ({ uri: url }))}
                onRequestClose={() => setIsGalleryVisible(false)}
            />
            <Toast
                message={message}
                setMessage={setMessage}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 24
    },
    topContainer: {
        flex: 1,
        gap: 40,
        justifyContent: 'space-between'
    },
})
