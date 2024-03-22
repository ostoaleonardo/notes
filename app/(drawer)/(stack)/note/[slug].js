import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CategoriesModal, CategoryCarousel, DateNote, ImageCarousel, LargeInput, NoteButtons, PasswordModal, Scroll, Section, TextArea, Toast, UpdatePasswordModal } from '@/components'
import ImageView from 'react-native-image-viewing'
import { useHeaderTitle, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { colors } from '@/constants'

export default function EditNote() {
    const router = useRouter()
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([])
    const [hasPassword, setHasPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [categoryIds, setCategoryIds] = useState([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [isUpdatePasswordModalVisible, setIsUpdatePasswordModalVisible] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
    const [message, setMessage] = useState('')

    useHeaderTitle(t('header.editNote'))

    useEffect(() => {
        const note = getNote(slug)
        setTitle(note.title)
        setNote(note.note)
        setImages(note.images)
        setCategoryIds(note.categories)
        setCreatedAt(note.createdAt)
        setUpdatedAt(note.updatedAt)

        if (note.password) {
            setHasPassword(true)
            setCurrentPassword(note.password)
        }
    }, [slug])

    const handleSave = () => {
        if (!title.trim()) {
            handleToast(t('message.emptyTitle'))
            return
        }

        if (!note.trim()) {
            handleToast(t('message.emptyNote'))
            return
        }

        updateNote({
            id: slug,
            title: title.trim(),
            note: note.trim(),
            images,
            password: newPassword || currentPassword,
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
        if (hasPassword) {
            setIsUpdatePasswordModalVisible(!isUpdatePasswordModalVisible)
        } else {
            setIsPasswordModalVisible(!isPasswordModalVisible)
        }
    }

    const handlePassword = (password) => {
        setNewPassword(password)
        setIsPasswordModalVisible(false)
        setIsUpdatePasswordModalVisible(false)
    }

    const handleRemovePassword = () => {
        setHasPassword(false)
        setCurrentPassword('')
        setIsUpdatePasswordModalVisible(false)
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
            <Scroll contentStyle={styles.scrollContainer}>
                <Section
                    paddingHorizontal={24}
                >
                    <LargeInput
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

                <ImageCarousel
                    images={images}
                    onAddImage={handleAddImage}
                    onOpenImage={handleOpenImage}
                    onRemoveImage={handleRemoveImage}
                />

                <NoteButtons
                    onSave={handleSave}
                    onOpenModal={handlePasswordModal}
                    hasPassword={hasPassword}
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
            <UpdatePasswordModal
                isVisible={isUpdatePasswordModalVisible}
                onClose={handlePasswordModal}
                currentPassword={currentPassword}
                handlePassword={handlePassword}
                onDelete={handleRemovePassword}
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
        paddingVertical: 24,
    },
})
