import { useCallback, useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ModalSheet } from '@/components'
import { LoadingOverlay } from '@/components/layout'
import { MarkdownControls, TemplateCarousel } from '@/screens/notes'
import { AddPassword, Tags, ImageMarkdown, TableMarkdown, UpdatePassword } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useCloseTabOnRemove, useMarkdownAction, useNoteAutosave, useNotes, useTabBarActions, useTabs, useTemplates } from '@/hooks'
import { getDate } from '@/utils'

export default function EditNote() {
    const { t } = useTranslation()
    const { slug } = useLocalSearchParams()
    const { getNote, updateNote } = useNotes()
    const { addTemplate } = useTemplates()
    const { registerTab } = useTabs()

    const navigation = useNavigation()
    useCloseTabOnRemove(navigation, slug)

    const [loading, setLoading] = useState(true)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])
    const [images, setImages] = useState([])

    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

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

    useEffect(() => {
        const {
            title = '',
            note: content = '',
            tags = [],
            images = [],
            createdAt = Date.now(),
            updatedAt = '',
            biometrics = false,
            password = '',
            repositoryId = ''
        } = getNote(slug)

        setTitle(title || t('notes.untitled'))
        setNote(content)
        setTags(tags)
        setImages(images)
        setCreatedAt(createdAt)
        setUpdatedAt(updatedAt)
        setBiometrics(biometrics)
        setPassword(password)
        setRepositoryId(repositoryId)

        setTimeout(() => {
            setLoading(false)
        }, 0)

        registerTab(slug)
    }, [slug])

    useNoteAutosave({
        id: slug, title, note, tags, images, password, biometrics, createdAt, repositoryId,
        skip: loading,
        onSave: (newData) => updateNote({
            ...newData,
            updatedAt: getDate()
        })
    })

    useTabBarActions({
        onOpenDrawer: () => navigation.dispatch({ type: 'OPEN_DRAWER' })
    }, [])

    if (loading) return <LoadingOverlay />

    return (
        <>
            <Header
                title={title}
                setTitle={setTitle}
                createdAt={createdAt}
                updatedAt={updatedAt}
            />

            <NoteEditor
                value={note}
                setValue={setNote}
                markdownAction={markdownAction}
                isEditing={isEditing}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            <MarkdownControls
                isEditing={isEditing}
                isFocused={isFocused}
                onRunAction={onRunAction}
                onEditMarkdown={onEditMarkdown}
                actions={{
                    hasPassword: !!password,
                    onOpenPassword: password ? onOpenUpdatePassword : onOpenPassword,
                    onOpenTags,
                    onOpenTemplates,
                    onSaveAsTemplate
                }}
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
