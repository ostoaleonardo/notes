import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '@/components'
import { useNoteActionHeader } from '@/screens/app-bar-actions'
import { MarkdownControls, TemplateCarousel } from '@/screens/notes'
import { AddPassword, Tags, ImageMarkdown, TableMarkdown, UpdatePassword } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useMarkdownAction, useNoteAutosave, useNotes, useTemplates } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const { addTemplate } = useTemplates()

    const loading = useRef(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])
    const [images, setImages] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(false)

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
        ref: updatePasswordBottomRef,
        onOpen: onOpenUpdatePassword,
        onClose: onCloseUpdatePassword
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
        onOpenPassword: password ? onOpenUpdatePassword : onOpenPassword,
        onOpenTemplates,
        onSaveAsTemplate
    })

    useEffect(() => {
        const {
            title = '',
            note: content = '',
            tags = [],
            images = [],
            createdAt = Date.now(),
            updatedAt = '',
            biometrics = false,
            password = ''
        } = getNote(slug)

        setTitle(title || t('notes.untitled'))
        setNote(content)
        setTags(tags)
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
        id: slug, title, note, tags, images, password, biometrics, createdAt,
        skip: loading.current,
        onSave: (newData) => updateNote({
            ...newData,
            updatedAt: getDate()
        })
    })

    return (
        <>
            <Header
                title={title}
                setTitle={setTitle}
                createdAt={createdAt}
                updatedAt={updatedAt}
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
                ref={updatePasswordBottomRef}
                onClose={onCloseUpdatePassword}
                title={t('password.update')}
            >
                <UpdatePassword
                    onClose={onCloseUpdatePassword}
                    password={password}
                    setPassword={setPassword}
                    biometrics={biometrics}
                    setBiometrics={setBiometrics}
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
