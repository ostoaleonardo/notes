import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { Wrapper } from '@/components/layout'
import { GalleryView } from '@/screens/gallery'
import { MarkdownControls } from '@/screens/notes'
import { AddPassword, Categories, ImageModal, TableModal, UpdatePassword } from '@/screens/modals'
import { BottomBar, Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useMarkdownAction, useNoteAutosave, useNotes } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const navigation = useNavigation()

    const loading = useRef(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(false)
    const [galleryIndex, setGalleryIndex] = useState('')

    const onEditMarkdown = useCallback(() => setIsEditing(prev => !prev), [])

    const markdownAction = useMarkdownAction()

    const {
        ref: tableBottomRef,
        onOpen: onOpenTable,
        onClose: onCloseTable
    } = useBottomSheet()

    const {
        ref: imageBottomRef,
        onOpen: onOpenImage,
        onClose: onCloseImage
    } = useBottomSheet()

    const onRunAction = useCallback((action) => {
        if (action === 'table') {
            onOpenTable()
            return
        }

        if (action === 'image') {
            onOpenImage()
            return
        }

        markdownAction.run(action)
    }, [onOpenTable, onOpenImage])

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
        navigation.setOptions({
            hasPassword: password,
            onOpenPassword: password
                ? onOpenUpdatePassword
                : onOpenPassword
        })
    }, [password])

    useEffect(() => {
        const {
            title = '',
            note: content = '',
            categories = ['all'],
            images = [],
            createdAt = Date.now(),
            updatedAt = '',
            biometrics = false,
            password = ''
        } = getNote(slug)

        setTitle(title)
        setNote(content)
        setCategories(categories)
        setImages(images)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setBiometrics(biometrics)
        setPassword(password)

        setTimeout(() => {
            loading.current = false
        }, 0)
    }, [slug])

    useNoteAutosave({
        id: slug, title, note, categories, images, password, biometrics, createdAt,
        skip: loading.current,
        onSave: (newData) => updateNote({
            ...newData,
            updatedAt: getDate()
        })
    })

    return (
        <>
            <Wrapper>
                <Header
                    title={title}
                    setTitle={setTitle}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    categories={categories}
                    setCategories={setCategories}
                    onOpenCategories={onOpenCategories}
                />

                <NoteEditor
                    value={note}
                    setValue={setNote}
                    markdownAction={markdownAction}
                    images={images}
                    setImages={setImages}
                    onGallery={setGalleryIndex}
                    isEditing={isEditing}
                />
            </Wrapper>

            <MarkdownControls
                isEditing={isEditing}
                onRunAction={onRunAction}
                onEditMarkdown={onEditMarkdown}
            />

            <BottomBar
                images={images}
                setImages={setImages}
                hasPassword={password}
                onOpenPassword={password
                    ? onOpenUpdatePassword
                    : onOpenPassword}
            />

            <Categories
                ref={categoriesBottomRef}
                categories={categories}
                setCategories={setCategories}
                onClose={onCloseCategories}
            />
            <AddPassword
                ref={passwordBottomRef}
                onClose={onClosePassword}
                password={password}
                setPassword={setPassword}
                biometrics={biometrics}
                setBiometrics={setBiometrics}
            />
            <UpdatePassword
                ref={updatePasswordBottomRef}
                onClose={onCloseUpdatePassword}
                password={password}
                setPassword={setPassword}
                biometrics={biometrics}
                setBiometrics={setBiometrics}
            />
            <TableModal
                ref={tableBottomRef}
                onClose={onCloseTable}
                onInsert={(payload) => markdownAction.run('table', payload)}
            />
            <ImageModal
                ref={imageBottomRef}
                onClose={onCloseImage}
                onInsert={(payload) => markdownAction.run('image', payload)}
            />
            <GalleryView
                images={images}
                index={galleryIndex}
                visible={galleryIndex !== ''}
                onClose={() => setGalleryIndex('')}
            />
        </>
    )
}
