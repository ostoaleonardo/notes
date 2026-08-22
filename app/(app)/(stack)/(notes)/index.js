import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from 'expo-router'
import { ModalSheet } from '@/components'
import { useNoteActionHeader } from '@/screens/app-bar-actions'
import { MarkdownControls, TemplateCarousel } from '@/screens/notes'
import { AddPassword, Tags, ImageMarkdown, LinkMarkdown, TableMarkdown } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useMarkdownAction, useNoteAutosave, useNotes, useTemplates, useUtils } from '@/hooks'
import { getDate, getUniqueTitle } from '@/utils'

export default function Note() {
    const { t } = useTranslation()
    const { notes, saveNote, updateNote, setParamId } = useNotes()
    const { addTemplate } = useTemplates()
    const { filter } = useUtils()

    const isSaved = useRef(false)
    const firstRender = useRef(true)
    const autoTitleRef = useRef('')
    const notesRef = useRef(notes)

    const [id, setId] = useState('')
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState(filter ? Array.from(filter) : [])

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(true)

    useEffect(() => {
        notesRef.current = notes
    }, [notes])

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
        ref: tagsBottomRef,
        onOpen: onOpenTags,
        onClose: onCloseTags
    } = useBottomSheet()

    const {
        ref: passwordBottomRef,
        onOpen: onOpenPassword,
        onClose: onClosePassword
    } = useBottomSheet()

    const {
        ref: templatesBottomRef,
        onOpen: onOpenTemplates,
        onClose: onCloseTemplates
    } = useBottomSheet()

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        onCloseTemplates()
    }, [])

    const onSaveAsTemplate = useCallback(async () => {
        await addTemplate(title.trim() || t('placeholder.title'), note)
        ToastAndroid.show(t('templates.saved'), ToastAndroid.SHORT)
    }, [title, note])

    useNoteActionHeader({
        password,
        onOpenPassword,
        onOpenTemplates,
        onSaveAsTemplate
    })

    useFocusEffect(
        useCallback(() => {
            const id = randomUUID()
            firstRender.current = false
            setParamId(id)
            setId(id)

            const autoTitle = getUniqueTitle(notesRef.current.map((n) => n.title), t('notes.untitled'))
            autoTitleRef.current = autoTitle
            setTitle(autoTitle)
        }, [])
    )

    useNoteAutosave({
        id, title, note, tags, password, biometrics, createdAt,
        skip: firstRender.current || (title === autoTitleRef.current && !note),
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
                tags={tags}
                setTags={setTags}
                onOpenTags={onOpenTags}
            />

            <NoteEditor
                value={note}
                setValue={setNote}
                markdownAction={markdownAction}
                isEditing={isEditing}
            />

            <MarkdownControls
                isEditing={isEditing}
                onRunAction={onRunAction}
                onEditMarkdown={onEditMarkdown}
            />

            <ModalSheet
                ref={tagsBottomRef}
                onClose={onCloseTags}
                snapPoints={['50%', '95%']}
            >
                <Tags
                    tags={tags}
                    setTags={setTags}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={passwordBottomRef}
                onClose={onClosePassword}
                title={t('password.add')}
            >
                <AddPassword
                    onClose={onClosePassword}
                    password={password}
                    setPassword={setPassword}
                    biometrics={biometrics}
                    setBiometrics={setBiometrics}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={linkBottomRef}
                onClose={onCloseLink}
            >
                <LinkMarkdown
                    onClose={onCloseLink}
                    onInsert={(payload) => markdownAction.run('link', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={tableBottomRef}
                onClose={onCloseTable}
                enablePanDownToClose={false}
            >
                <TableMarkdown
                    onClose={onCloseTable}
                    onInsert={(payload) => markdownAction.run('table', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={imageBottomRef}
                onClose={onCloseImage}
            >
                <ImageMarkdown
                    onClose={onCloseImage}
                    onInsert={(payload) => markdownAction.run('image', payload)}
                />
            </ModalSheet>

            <ModalSheet
                ref={templatesBottomRef}
                onClose={onCloseTemplates}
                contentContainerStyle={{ paddingVertical: 16 }}
            >
                <TemplateCarousel
                    title={title}
                    onSelect={onSelectTemplate}
                />
            </ModalSheet>
        </>
    )
}
