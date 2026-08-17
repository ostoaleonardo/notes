import { useCallback, useEffect, useRef, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect, useNavigation } from 'expo-router'
import { GalleryView } from '@/screens/gallery'
import { MarkdownControls } from '@/screens/notes'
import { AddPassword, Categories } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useNotes, useUtils } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST, DEFAULT_NOTE_CATEGORIES } from '@/constants'
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
    const [list, setList] = useState(DEFAULT_LIST)

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [action, setAction] = useState('')
    const [isEditing, setIsEditing] = useState(true)
    const [galleryIndex, setGalleryIndex] = useState('')

    const onEditMarkdown = useCallback(() => setIsEditing(prev => !prev), [])
    const onRunAction = useCallback((action) => setAction(action), [])

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

    useEffect(() => {
        if (firstRender.current) return
        if (!title && !note && !images.length) return

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
        }, 500)

        return () => clearTimeout(timer)
    }, [
        id,
        title,
        note,
        categories,
        images,
        list,
        password,
        biometrics
    ])

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
                action={action}
                setAction={setAction}
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
            <GalleryView
                images={images}
                index={galleryIndex}
                visible={galleryIndex !== ''}
                onClose={() => setGalleryIndex('')}
            />
        </>
    )
}
