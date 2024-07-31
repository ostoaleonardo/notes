import { useState } from 'react'
import { router } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, Section, TextArea, Toast } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, ImageCarousel, List } from '@/screens'
import { useBottomSheet, useHaptics, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_CATEGORIES, FEEDBACK_TYPES, ROUTES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote } = useNotes()
    const { vibrate } = useHaptics()

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(({ id }) => id))
    const [images, setImages] = useState([])
    const [list, setList] = useState({ type: '', items: [] })

    const [password, setPassword] = useState('')
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

        saveNote({
            id: randomUUID(),
            title: title.trim(),
            note: note.trim(),
            categories,
            images,
            list,
            password,
            biometrics,
            createdAt: getDate()
        })

        vibrate(FEEDBACK_TYPES.SUCCESS)
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

    const handleOpenImage = (index) => {
        setIsGalleryVisible(true)
        setGalleryIndex(index)
    }

    const handleListType = (type) => {
        if (list.items.length > 0) {
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
            const items = [...prev.items, item]
            return { items, type }
        })
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
                            paddingHorizontal={24}
                        >
                            <TextArea
                                value={note}
                                onChangeText={setNote}
                                placeholder={t('placeholder.note')}
                            />
                        </Section>

                        {list.items.length > 0 && (
                            <Section
                                paddingVertical={24}
                            >
                                <List
                                    list={list}
                                    setList={setList}
                                    onAddItem={handleAddItem}
                                />
                            </Section>
                        )}
                    </View>

                    {images.length > 0 && (
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
                hasPassword={!!password}
                onOpenPassword={onOpenPassword}
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
