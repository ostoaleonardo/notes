import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { randomUUID } from 'expo-crypto'
import { useTranslation } from 'react-i18next'
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import { ModalSheet } from '@/components'
import { MarkdownControls, TemplateCarousel } from '@/screens/notes'
import { AddPassword, Tags, ImageMarkdown, LinkMarkdown, TableMarkdown } from '@/screens/modals'
import { Header, NoteEditor } from '@/screens/editor'
import { useBottomSheet, useCloseTabOnRemove, useMarkdownAction, useNoteAutosave, useNotes, useRepositories, useTabBarActions, useTabs, useTemplates, useUtils } from '@/hooks'
import { getDate, getUniqueTitle } from '@/utils'

export default function Note() {
    const { t } = useTranslation()
    const { repositoryId: targetRepositoryId } = useLocalSearchParams()
    const navigation = useNavigation()
    const { notes, saveNote, updateNote, setParamId } = useNotes()
    const { addTemplate } = useTemplates()
    const { filter } = useUtils()
    const { activeRepository } = useRepositories()
    const { registerTab } = useTabs()

    const isSaved = useRef(false)
    const firstRender = useRef(true)
    const autoTitleRef = useRef('')
    const notesRef = useRef(notes)

    const [id, setId] = useState('')

    useCloseTabOnRemove(navigation, id)
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState(filter ? Array.from(filter) : [])
    const [repositoryId, setRepositoryId] = useState('')

    const [createdAt, setCreatedAt] = useState('')

    const [password, setPassword] = useState('')
    const [biometrics, setBiometrics] = useState(false)

    const [isEditing, setIsEditing] = useState(true)
    const [isFocused, setIsFocused] = useState(false)

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
    }, [
        onOpenLink,
        onOpenTable,
        onOpenImage
    ])

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

    useFocusEffect(
        useCallback(() => {
            const id = randomUUID()
            firstRender.current = false
            setParamId(id)
            setId(id)
            setRepositoryId(targetRepositoryId || activeRepository.id)
            registerTab(id)

            const autoTitle = getUniqueTitle(notesRef.current.map((n) => n.title), t('notes.untitled'))
            autoTitleRef.current = autoTitle
            setTitle(autoTitle)
        }, [])
    )

    useNoteAutosave({
        id, title, note, tags, password, biometrics, createdAt, repositoryId,
        skip: firstRender.current || (title === autoTitleRef.current && !note),
        onSave: (newData) => {
            if (!isSaved.current) {
                const createdAt = getDate()

                saveNote({
                    ...newData,
                    createdAt
                }, repositoryId)

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

    useTabBarActions({
        onOpenDrawer: () => navigation.dispatch({ type: 'OPEN_DRAWER' })
    }, [])

    return (
        <>
            <Header
                title={title}
                setTitle={setTitle}
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
                    onOpenPassword,
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
