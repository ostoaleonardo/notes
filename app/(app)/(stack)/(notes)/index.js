import { useCallback, useEffect, useRef, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect, useNavigation } from 'expo-router'
import { GalleryView } from '@/screens/gallery'
import { MarkdownControls } from '@/screens/notes'
import { AddPassword, Categories, ImageModal, LinkModal, TableModal } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useMarkdownAction, useNoteAutosave, useNotes, useUtils } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_NOTE_CATEGORIES } from '@/constants'
import { KeyboardStickyView } from 'react-native-keyboard-controller'

export default function Note() {
    const { saveNote, updateNote, setParamId } = useNotes()
    const { filter } = useUtils()
    const navigation = useNavigation()

    const isSaved = useRef(false)
    const firstRender = useRef(true)

    const [id, setId] = useState('')
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState(filter ? Array.from(filter) : DEFAULT_NOTE_CATEGORIES)
    const [images, setImages] = useState([])

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(true)
    const [galleryIndex, setGalleryIndex] = useState('')

    const onEditMarkdown = useCallback(() => setIsEditing(prev => !prev), [])

    const markdownAction = useMarkdownAction()

    const {
        ref: linkBottomRef,
        onOpen: onOpenLink,
        onClose: onCloseLink
    } = useBottomSheet()

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
        if (action === 'link') {
            onOpenLink()
            return
        }

        if (action === 'table') {
            onOpenTable()
            return
        }

        if (action === 'image') {
            onOpenImage()
            return
        }

        markdownAction.run(action)
    }, [onOpenLink, onOpenTable, onOpenImage])

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

    useEffect(() => {
        navigation.setOptions({
            hasPassword: password,
            onOpenPassword
        })
    }, [password])

    useFocusEffect(
        useCallback(() => {
            const id = randomUUID()
            firstRender.current = false
            setParamId(id)
            setId(id)
        }, [])
    )

    useNoteAutosave({
        id, title, note, categories, images, password, biometrics, createdAt,
        skip: firstRender.current || (!title && !note && !images.length),
        onSave: (newData) => {
            if (!isSaved.current) {
                const createdAt = getDate()

                saveNote({
                    ...newData,
                    createdAt
                })

                setCreatedAt(createdAt)
                isSaved.current = true
            } else {
                updateNote({
                    ...newData,
                    updatedAt: getDate()
                })
            }
        }
    })

    return (
        <>
            <Header
                title={title}
                setTitle={setTitle}
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

            <KeyboardStickyView style={{ position: 'absolute', bottom: 16 }}>
                <MarkdownControls
                    isEditing={isEditing}
                    onRunAction={onRunAction}
                    onEditMarkdown={onEditMarkdown}
                />
            </KeyboardStickyView>

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

            <LinkModal
                ref={linkBottomRef}
                onClose={onCloseLink}
                onInsert={(payload) => markdownAction.run('link', payload)}
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
