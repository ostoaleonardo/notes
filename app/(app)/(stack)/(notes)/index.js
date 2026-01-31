import { useCallback, useEffect, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect } from 'expo-router'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, MarkdownEditor, Section } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, ContainerFooter, ImageCarousel, List, MarkdownControls } from '@/screens'
import { useBottomSheet, useMarkdown, useNotes, useUtils } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST, DEFAULT_NOTE_CATEGORIES } from '@/constants'

export default function Note() {
    const { t } = useTranslation()
    const { saveNote, updateNote } = useNotes()
    const { markdown, hasMarkdown, setHasMarkdown } = useMarkdown()
    const { filter } = useUtils()

    const [isSaved, setIsSaved] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

    const [id, setId] = useState(randomUUID())
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(filter ? Array.from(filter) : DEFAULT_NOTE_CATEGORIES)
    const [images, setImages] = useState([])
    const [list, setList] = useState(DEFAULT_LIST)

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(true)
    const [markdownAction, setMarkdownAction] = useState('')

    const onEditMarkdown = () => setIsEditing(!isEditing)
    const onRunAction = (action) => setMarkdownAction(action)

    const hasImages = images && images.length > 0

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
        setHasMarkdown(markdown)
        if (firstRender) return

        const timer = setTimeout(() => {
            const newData = {
                id,
                title: title.trim(),
                note: note.trim(),
                categories,
                images,
                list,
                markdown: hasMarkdown,
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
        hasMarkdown,
        password,
        biometrics
    ])

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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior='height'
            >
                <NestableScrollContainer
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    <Section
                        containerStyle={{ paddingHorizontal: 16 }}
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
                        containerStyle={{ paddingVertical: 16 }}
                    >
                        <CategoryCarousel
                            selectedCategories={categories}
                            onCategories={onCategories}
                            onCategoriesModal={onOpenCategories}
                        />
                    </Section>

                    <Section
                        containerStyle={{ paddingHorizontal: 16 }}
                    >
                        <MarkdownEditor
                            value={note}
                            setValue={setNote}
                            onChangeText={setNote}
                            isEditing={isEditing}
                            isMarkdown={hasMarkdown}
                            action={markdownAction}
                            setAction={setMarkdownAction}
                        />
                    </Section>

                    {list.items.length > 0 && (
                        <Section
                            containerStyle={{ paddingVertical: 16 }}
                        >
                            <List
                                list={list}
                                setList={setList}
                                onAddItem={handleAddItem}
                            />
                        </Section>
                    )}
                </NestableScrollContainer>
            </KeyboardAvoidingView>

            <ContainerFooter
                footer={
                    <BottomOptionsBar
                        onAddImage={handleAddImage}
                        onListType={handleListType}
                        hasPassword={!!password}
                        onOpenPassword={onOpenPassword}
                        isEditing={isEditing}
                        onEditMarkdown={onEditMarkdown}
                    />
                }
            >
                {hasImages > 0 && (
                    <ImageCarousel
                        images={images}
                        setImages={setImages}
                    />
                )}
                {hasMarkdown && (
                    <MarkdownControls
                        isEditing={isEditing}
                        onRunAction={onRunAction}
                        onEditMarkdown={onEditMarkdown}
                    />
                )}
            </ContainerFooter>

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
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 16
    }
})
