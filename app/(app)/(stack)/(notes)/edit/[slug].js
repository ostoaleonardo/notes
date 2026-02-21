import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Wrapper } from '@/components/layout/wrapper'
import { Header } from '@/components/editor/header'
import { NoteEditor } from '@/components/editor/note-editor'
import { ListEditor } from '@/components/editor/list-editor'
import { BottomBar } from '@/components/editor/bottom-bar'
import { AddPassword, Categories, UpdatePassword, MarkdownControls } from '@/screens'
import { useBottomSheet, useNotes } from '@/hooks'
import { getDate } from '@/utils'
import { DEFAULT_LIST } from '@/constants'

export default function EditNote() {
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()

    const [firstRender, setFirstRender] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [list, setList] = useState(DEFAULT_LIST)

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [action, setAction] = useState('')
    const [isEditing, setIsEditing] = useState(true)
    const [showEditor, setShowEditor] = useState(true)

    const onRunAction = (action) => setAction(action)
    const onEditMarkdown = () => setIsEditing(!isEditing)

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
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setBiometrics(biometrics)
        setPassword(password)
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
                password: password,
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
        password,
        biometrics
    ])

    return (
        <>
            <Wrapper keyboard={showEditor}>
                <Header
                    title={title}
                    setTitle={setTitle}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
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
                showEditor={showEditor}
                setShowEditor={setShowEditor}
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
        </>
    )
}
