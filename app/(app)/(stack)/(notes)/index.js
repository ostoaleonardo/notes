import { useCallback, useEffect, useState } from 'react'
import { randomUUID } from 'expo-crypto'
import { useFocusEffect } from 'expo-router'
import { Wrapper } from '@/components/layout'
import { GalleryView } from '@/screens/gallery'
import { MarkdownControls } from '@/screens/notes'
import { AddPassword, Categories } from '@/screens/modals'
import { BottomBar, Header, ListEditor, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useNotes, useUtils } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST, DEFAULT_NOTE_CATEGORIES } from '@/constants'

export default function Note() {
    const { saveNote, updateNote, setParamId } = useNotes()
    const { filter } = useUtils()

    const [isSaved, setIsSaved] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

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
    const [showEditor, setShowEditor] = useState(true)
    const [galleryIndex, setGalleryIndex] = useState('')

    const onEditMarkdown = () => setIsEditing(!isEditing)
    const onRunAction = (action) => setAction(action)

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
            const id = randomUUID()
            setFirstRender(false)
            setParamId(id)
            setId(id)
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

    return (
        <>
            <Wrapper keyboard={showEditor}>
                <Header
                    title={title}
                    setTitle={setTitle}
                    categories={categories}
                    setCategories={setCategories}
                    onOpenCategories={onOpenCategories}
                />

                {showEditor ? (
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
                ) : (
                    <ListEditor
                        list={list}
                        setList={setList}
                    />
                )}
            </Wrapper>

            {showEditor && (
                <MarkdownControls
                    isEditing={isEditing}
                    onRunAction={onRunAction}
                    onEditMarkdown={onEditMarkdown}
                />
            )}

            <BottomBar
                list={list}
                setList={setList}
                images={images}
                setImages={setImages}
                password={password}
                onOpenPassword={onOpenPassword}
                showEditor={showEditor}
                setShowEditor={setShowEditor}
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
            <GalleryView
                images={images}
                index={galleryIndex}
                visible={galleryIndex !== ''}
                onClose={() => setGalleryIndex('')}
            />
        </>
    )
}
