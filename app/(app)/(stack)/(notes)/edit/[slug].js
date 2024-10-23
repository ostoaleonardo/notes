import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, Section, TextArea } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, List, DateNote, ImageCarousel, UpdatePassword } from '@/screens'
import { useBottomSheet, useNotes } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()

    const [firstRender, setFirstRender] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [list, setList] = useState({ type: '', items: [] })

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)
    const [biometrics, setBiometrics] = useState(false)

    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)

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

    useFocusEffect(
        useCallback(() => {
            setFirstRender(false)
        }, [])
    )

    useEffect(() => {
        if (firstRender) return

        const timer = setTimeout(() => {
            const newData = {
                id: slug,
                title: title.trim(),
                note: note.trim(),
                categories,
                images,
                list,
                password: newPassword || currentPassword,
                biometrics,
                createdAt
            }

            updateNote({
                ...newData,
                updatedAt: getDate()
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [
        title,
        note,
        categories,
        images,
        list,
        currentPassword,
        newPassword,
        biometrics
    ])

    const handleRemovePassword = () => {
        setHasPassword(false)
        setCurrentPassword('')
        onCloseUpdatePassword()
    }

    const onCategories = (id) => {
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

    const handleListType = (type) => {
        if (list && list.type === type) return

        if (list && list.items.length > 0) {
            setList((prev) => ({ ...prev, type }))
        } else {
            handleAddItem(type)
        }
    }

    const handleAddItem = (type) => {
        const item = {
            id: randomUUID(),
            value: '',
            status: 'unchecked'
        }

        setList((prev) => {
            const items = prev ? [...prev.items, item] : [item]
            return { items, type }
        })
    }

    return (
        <>
            <NestableScrollContainer
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <View style={styles.contentContainer}>
                    <View>
                        <Section
                            containerStyle={{ paddingHorizontal: 24 }}
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
                            title={t('title.categories')}
                            containerStyle={{ paddingVertical: 24 }}
                        >
                            <CategoryCarousel
                                selectedCategories={categories}
                                onCategories={onCategories}
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

                        {list && list.items.length > 0 && (
                            <Section
                                containerStyle={{ paddingVertical: 24 }}
                            >
                                <List
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
                onListType={handleListType}
                hasPassword={hasPassword}
                onOpenPassword={
                    hasPassword
                        ? onOpenUpdatePassword
                        : onOpenPassword
                }
            />

            <Categories
                ref={categoriesBottomRef}
                onClose={onCloseCategories}
                selectedCategories={categories}
                onCategories={onCategories}
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
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 16
    },
    contentContainer: {
        flex: 1,
        gap: 40,
        paddingBottom: 48,
        justifyContent: 'space-between'
    }
})
