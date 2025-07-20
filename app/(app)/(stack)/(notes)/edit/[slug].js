import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { randomUUID } from 'expo-crypto'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import ImageView from 'react-native-image-viewing'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { LargeInput, MarkdownEditor, Section } from '@/components'
import { AddPassword, BottomOptionsBar, Categories, CategoryCarousel, List, DateNote, ImageCarousel, UpdatePassword, MarkdownControls, ContainerFooter } from '@/screens'
import { useBottomSheet, useMarkdown, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST } from '@/constants'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const { hasMarkdown, setHasMarkdown } = useMarkdown()

    const [firstRender, setFirstRender] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [list, setList] = useState(DEFAULT_LIST)

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [hasPassword, setHasPassword] = useState(false)
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(false)
    const [markdownAction, setMarkdownAction] = useState('')

    const onEditMarkdown = () => setIsEditing(!isEditing)
    const onRunAction = (action) => setMarkdownAction(action)

    const [galleryIndex, setGalleryIndex] = useState(0)
    const [isGalleryVisible, setIsGalleryVisible] = useState(false)
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

    const {
        ref: updatePasswordBottomRef,
        onOpen: onOpenUpdatePassword,
        onClose: onCloseUpdatePassword
    } = useBottomSheet()

    useEffect(() => {
        const {
            title = '',
            note: content = '',
            categories = ['all'],
            images = [],
            list = DEFAULT_LIST,
            markdown = false,
            createdAt = Date.now(),
            updatedAt = '',
            biometrics = false,
            password = ''
        } = getNote(slug)

        setTitle(title)
        setNote(content)
        setCategories(categories)
        setImages(images)
        setList(list)
        setHasMarkdown(markdown)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setBiometrics(biometrics)

        if (password) {
            setHasPassword(true)
            setCurrentPassword(password)
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
                markdown: hasMarkdown,
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
        hasMarkdown,
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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior='height'
            >
                <NestableScrollContainer
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
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
                        <MarkdownEditor
                            value={note}
                            setValue={setNote}
                            isEditing={isEditing}
                            isMarkdown={hasMarkdown}
                            action={markdownAction}
                            setAction={setMarkdownAction}
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
                </NestableScrollContainer>
            </KeyboardAvoidingView>

            <ContainerFooter
                footer={
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
                }
            >
                {hasImages && (
                    <ImageCarousel
                        images={images}
                        setImages={setImages}
                        onOpenImage={handleOpenImage}
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

            {hasImages && (
                <ImageView
                    imageIndex={galleryIndex}
                    visible={isGalleryVisible}
                    images={images.map((url) => ({ uri: url }))}
                    onRequestClose={() => setIsGalleryVisible(false)}
                />
            )}
        </>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 64,
        paddingVertical: 16
    }
})
