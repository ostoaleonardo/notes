import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { LargeInput, Scroll, Section, TextArea, Toast } from '@/components'
import { AddPassword, Categories, CategoryCarousel, DateNote, ImageCarousel, NoteButtons, UpdatePassword } from '@/screens'
import { useBottomSheet, useHaptics, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { FEEDBACK_TYPES, ROUTES } from '@/constants'

export default function EditNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { vibrate } = useHaptics()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)
    const [biometrics, setBiometrics] = useState(false)

    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

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

    const {
        ref: updatePasswordBottomRef,
        onOpen: onOpenUpdatePassword,
        onClose: onCloseUpdatePassword
    } = useBottomSheet()

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setImages(note.images)
        setCategories(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)
        setBiometrics(note.biometrics)

        if (note.password) {
            setHasPassword(true)
            setCurrentPassword(note.password)
        }
    }, [slug])

    const handleSave = () => {
        if (!title.trim()) {
            setMessage(t('message.emptyTitle'))
            vibrate(FEEDBACK_TYPES.ERROR)
            return
        }

        if (!note.trim()) {
            setMessage(t('message.emptyNote'))
            vibrate(FEEDBACK_TYPES.ERROR)
            return
        }

        updateNote({
            id: slug,
            title: title.trim(),
            note: note.trim(),
            images,
            password: newPassword || currentPassword,
            biometrics,
            categories: categories,
            createdAt,
            updatedAt: getDate(),
        })

        vibrate(FEEDBACK_TYPES.SUCCESS)
        router.navigate(ROUTES.HOME)
    }

    const handleRemovePassword = () => {
        setHasPassword(false)
        setCurrentPassword('')
        onCloseUpdatePassword()
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

                        <DateNote
                            createdAt={createdAt}
                            updatedAt={updatedAt}
                        />

                        <Section
                            paddingVertical={24}
                            title={t('title.categories')}
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
                    hasPassword={!!currentPassword}
                    onOpenModal={hasPassword ? onOpenUpdatePassword : onOpenPassword}
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
                setPassword={setCurrentPassword}
                biometrics={biometrics}
                setBiometrics={setBiometrics}
            />
            <UpdatePassword
                ref={updatePasswordBottomRef}
                onClose={onCloseUpdatePassword}
                currentPassword={currentPassword}
                tooglePassword={setNewPassword}
                onDelete={handleRemovePassword}
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
    }
})
