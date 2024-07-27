import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, Section, TextArea, Toast } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, CheckBoxList, DateNote, ImageCarousel, UpdatePassword } from '@/screens'
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
    const [list, setList] = useState([])
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
        setCategories(note.categories)
        setImages(note.images)
        setList(note.list)
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
            categories,
            images,
            list,
            password: newPassword || currentPassword,
            biometrics,
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

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
    }

    const handleAddItem = () => {
        setList([
            ...list, {
                id: randomUUID(),
                value: '',
                checked: false
            }
        ])
    }

    return (
        <>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
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
                            contentStyle={{ paddingHorizontal: 24 }}
                        >
                            <TextArea
                                value={note}
                                onChangeText={setNote}
                                placeholder={t('placeholder.note')}
                            />
                        </Section>

                        {list && list.length > 0 && (
                            <Section
                                paddingVertical={24}
                            >
                                <CheckBoxList
                                    list={list}
                                    setList={setList}
                                    onAddItem={handleAddItem}
                                />
                            </Section>
                        )}
                    </View>

                    {images && images.length > 0 && (
                        <ImageCarousel
                            images={images}
                            setImages={setImages}
                            onOpenImage={handleOpenImage}
                        />
                    )}
                </View>
            </NestableScrollContainer>

            <BottomOptionsBar
                onAddImage={handleAddImage}
                onAddItemList={handleAddItem}
                hasPassword={hasPassword}
                onOpenPassword={
                    hasPassword
                        ? onOpenUpdatePassword
                        : onOpenPassword
                }
                onSave={handleSave}
            />

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
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 16
    },
    topContainer: {
        flex: 1,
        gap: 40,
        paddingBottom: 48,
        justifyContent: 'space-between'
    }
})
