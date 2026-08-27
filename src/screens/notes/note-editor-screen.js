import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastAndroid } from 'react-native'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { ModalSheet } from '@/components'
import { MarkdownControls } from './markdown-controls'
import { TemplateCarousel } from './template-carousel'
import { Tags } from '@/screens/modals/tags'
import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import { AddPassword } from '@/screens/modals/add-password'
import { UpdatePassword } from '@/screens/modals/update-password'
import { NoteEditor } from '@/screens/editor'
import { useAllowLandscape, useBottomSheet, useLanguage, useMarkdownAction, useTabBarActions, useTemplates } from '@/hooks'
import { getFormattedDate } from '@/utils'

export function NoteEditorScreen({
    navigation,
    title, setTitle,
    note, setNote,
    tags, setTags,
    password, setPassword,
    biometrics, setBiometrics,
    createdAt, updatedAt,
    initialEditing = false
}) {
    const { t } = useTranslation()
    const { addTemplate } = useTemplates()
    const { currentLanguage } = useLanguage()

    useAllowLandscape()

    const dateLabel = (createdAt || updatedAt)
        ? `${updatedAt ? t('date.updated') : t('date.created')} ${getFormattedDate(updatedAt || createdAt, currentLanguage)}`
        : ''

    const [isEditing, setIsEditing] = useState(initialEditing)
    const [isFocused, setIsFocused] = useState(false)

    const onEditMarkdown = useCallback(() => setIsEditing((prev) => !prev), [])
    const markdownAction = useMarkdownAction()

    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()
    const tagsSheet = useBottomSheet()
    const passwordSheet = useBottomSheet()
    const templatesSheet = useBottomSheet()

    const onRunAction = useCallback((action) => {
        if (action === 'link') {
            linkSheet.onOpen()
            return
        }

        if (action === 'table') {
            tableSheet.onOpen()
            return
        }

        if (action === 'image') {
            imageSheet.onOpen()
            return
        }

        markdownAction.run(action)
    }, [
        linkSheet.onOpen,
        tableSheet.onOpen,
        imageSheet.onOpen
    ])

    const onSelectTemplate = useCallback((content) => {
        setNote((prev) => (prev ? prev + '\n\n' + content : content))
        templatesSheet.onClose()
    }, [])

    const latestContent = useRef({ title, note })
    latestContent.current = { title, note }

    const onSaveAsTemplate = useCallback(async () => {
        const { title, note } = latestContent.current
        await addTemplate(title.trim() || t('placeholder.title'), note)
        ToastAndroid.show(t('templates.saved'), ToastAndroid.SHORT)
    }, [])

    const actions = useMemo(() => ({
        hasPassword: !!password,
        onOpenPassword: passwordSheet.onOpen,
        onOpenTags: tagsSheet.onOpen,
        onOpenTemplates: templatesSheet.onOpen,
        onSaveAsTemplate
    }), [
        password,
        passwordSheet.onOpen,
        tagsSheet.onOpen,
        templatesSheet.onOpen,
        onSaveAsTemplate
    ])

    useTabBarActions({
        onOpenDrawer: () => navigation.dispatch({ type: 'OPEN_DRAWER' })
    }, [])

    return (
        <>
            <KeyboardAvoidingView
                behavior='padding'
                style={{ flex: 1 }}
            >
                <NoteEditor
                    value={note}
                    setValue={setNote}
                    markdownAction={markdownAction}
                    isEditing={isEditing}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    title={title}
                    setTitle={setTitle}
                    titlePlaceholder={t('placeholder.title')}
                    dateLabel={dateLabel}
                />

                <MarkdownControls
                    isEditing={isEditing}
                    isFocused={isFocused}
                    onRunAction={onRunAction}
                    onEditMarkdown={onEditMarkdown}
                    actions={actions}
                />
            </KeyboardAvoidingView>

            <ModalSheet
                ref={tagsSheet.ref}
                onClose={tagsSheet.onClose}
                snapPoints={['50%', '95%']}
            >
                <Tags
                    tags={tags}
                    setTags={setTags}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={linkSheet.ref}
                onClose={linkSheet.onClose}
            >
                <LinkMarkdown
                    onClose={linkSheet.onClose}
                    onInsert={(payload) => markdownAction.run('link', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={tableSheet.ref}
                onClose={tableSheet.onClose}
                enablePanDownToClose={false}
            >
                <TableMarkdown
                    onClose={tableSheet.onClose}
                    onInsert={(payload) => markdownAction.run('table', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={imageSheet.ref}
                onClose={imageSheet.onClose}
            >
                <ImageMarkdown
                    onClose={imageSheet.onClose}
                    onInsert={(payload) => markdownAction.run('image', payload)}
                />
            </ModalSheet>

            <ModalSheet
                ref={templatesSheet.ref}
                onClose={templatesSheet.onClose}
                contentContainerStyle={{ paddingVertical: 16 }}
            >
                <TemplateCarousel
                    title={title}
                    onSelect={onSelectTemplate}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={passwordSheet.ref}
                onClose={passwordSheet.onClose}
                title={t(password ? 'password.update' : 'password.add')}
            >
                {password
                    ? (
                        <UpdatePassword
                            onClose={passwordSheet.onClose}
                            password={password}
                            setPassword={setPassword}
                            biometrics={biometrics}
                            setBiometrics={setBiometrics}
                        />
                    )
                    : (
                        <AddPassword
                            onClose={passwordSheet.onClose}
                            password={password}
                            setPassword={setPassword}
                            biometrics={biometrics}
                            setBiometrics={setBiometrics}
                        />
                    )}
            </ModalSheet>
        </>
    )
}
