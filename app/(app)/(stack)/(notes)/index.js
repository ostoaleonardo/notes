import { useCallback, useEffect, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, MarkdownEditor, Section } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, ImageCarousel, List, MarkdownControls } from '@/screens'
import { useBottomSheet, useMarkdown, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST, DEFAULT_NOTE_CATEGORIES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote, updateNote } = useNotes()
    const { markdown } = useMarkdown()
    const { md } = useLocalSearchParams()

    const [isSaved, setIsSaved] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

    const [id, setId] = useState(randomUUID())
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(DEFAULT_NOTE_CATEGORIES)
    const [images, setImages] = useState([])
    const [list, setList] = useState(DEFAULT_LIST)

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isMarkdown, setIsMarkdown] = useState(markdown)
    const [isEditing, setIsEditing] = useState(true)
    const onEditMarkdown = () => setIsEditing(!isEditing)

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

    useFocusEffect(
        useCallback(() => {
            setFirstRender(false)
        }, [])
    )

    useEffect(() => {
        if (firstRender) return

        const timer = setTimeout(() => {
            const newData = {
                id,
                title: title.trim(),
                note: note.trim(),
                categories,
                images,
                list,
                password,
                biometrics,
                createdAt
            }

            if (!isSaved) {
                const createdAt = getDate()

                saveNote({
                    ...newData,
                    createdAt
                })

                setCreatedAt(createdAt)
                setIsSaved(true)
            } else {
                updateNote({
                    ...newData,
                    updatedAt: getDate()
                })
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [
        title,
        note,
        categories,
        images,
        list,
        password,
        biometrics
    ])

    useEffect(() => {
        if (md !== undefined) {
            setIsMarkdown(md === 'true')
        }
    }, [md])

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
                            containerStyle={{ paddingHorizontal: 24 }}
                        >
                            <MarkdownEditor
                                value={note}
                                onChangeText={setNote}
                                isEditing={isEditing}
                                isMarkdown={isMarkdown}
                            />
                        </Section>

                        {list.items.length > 0 && (
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

                    {images.length > 0 && (
                        <ImageCarousel
                            images={images}
                            setImages={setImages}
                            onOpenImage={handleOpenImage}
                        />
                    )}
                </View>
            </NestableScrollContainer>

            {isMarkdown && (
                <MarkdownControls
                    isEditing={isEditing}
                    onToggle={onEditMarkdown}
                />
            )}
            <BottomOptionsBar
                onAddImage={handleAddImage}
                onListType={handleListType}
                hasPassword={!!password}
                onOpenPassword={onOpenPassword}
                isEditing={isEditing}
                onEditMarkdown={onEditMarkdown}
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
