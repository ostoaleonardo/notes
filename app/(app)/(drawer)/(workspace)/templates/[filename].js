import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

import { EditorShell } from '@/features/editor/native/screens/notes/editor-shell'
import { TemplateEditorForm } from '@/features/templates/screens/templates/template-editor-form'
import { TemplatePlaceholdersDialog } from '@/features/templates/screens/templates/template-placeholders-dialog'
import { LoadingOverlay } from '@/ui/layout'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { showSnackbar } from '@/ui/snackbar/snackbar-host'

import { useAutosave } from '@/shared/hooks/use-autosave'
import { useEditorChrome } from '@/shared/hooks/use-editor-chrome'
import { useRegisterCurrent } from '@/shared/hooks/use-current-note'
import { useRecentNotes } from '@/shared/hooks/use-recent-notes'
import { useFolders } from '@/shared/hooks/use-folders'
import { useTemplates } from '@/shared/hooks/use-templates'
import { useUtils } from '@/shared/hooks/use-utils'
import { splitTemplatePath, joinTemplatePath } from '@/shared/utils/template-path'
import { toggleInSet } from '@/shared/utils/toggle-in-set'
import { stripNoteExtension } from '@/shared/utils/note-filename'
import { useVersionHistory } from '@/shared/hooks/use-version-history'

import { EDITOR_MODES } from '@/shared/constants/editor-modes'
import { TEMPLATES_FOLDER_NAME } from '@/shared/constants/file-storage'
import { ROUTES } from '@/shared/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/shared/constants/tabs'
import { TEMPLATE_SCOPE } from '@/shared/constants/toolbar'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'

export default function EditTemplate() {
    const { t } = useTranslation()
    const { filename } = useLocalSearchParams()
    const { getTemplate, getFolderUri, updateTemplate, deleteTemplate } = useTemplates()
    const { pinned, updatePinned } = useUtils()
    const { removeRecent } = useRecentNotes()
    const { activeFolder, getRootRepository } = useFolders()

    const tabId = TEMPLATE_TAB_PREFIX + filename
    useRegisterCurrent(tabId)

    const [loading, setLoading] = useState(true)
    const currentFilename = useRef(filename)
    const originalName = useRef('')
    const originalContent = useRef('')

    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [mode, setMode] = useState(EDITOR_MODES.LIVE)
    const [placeholdersVisible, setPlaceholdersVisible] = useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [folderUri, setFolderUri] = useState('')

    const chrome = useEditorChrome()
    const { recentsSheet, searchSheet } = chrome

    const location = useMemo(() => (
        folderUri && activeFolder
            ? {
                rootUri: getRootRepository(activeFolder).uri,
                folderUri,
                folderPath: joinTemplatePath(
                    TEMPLATES_FOLDER_NAME,
                    splitTemplatePath(filename).dir
                )
            }
            : null
    ), [folderUri, activeFolder, getRootRepository, filename])

    const versionNoteId = splitTemplatePath(currentFilename.current).base

    const latestContent = useRef({ noteId: versionNoteId, title: name, content })
    latestContent.current = { noteId: versionNoteId, title: name, content }

    const onRestoreVersion = useCallback((version) => {
        setName(version.title)
        setContent(version.content)
    }, [])

    const versionHistory = useVersionHistory({ location, latestContent, onRestore: onRestoreVersion })

    const editorActions = useMemo(() => ({
        onOpenRecents: recentsSheet.onOpen,
        onOpenSearch: searchSheet.onOpen
    }), [recentsSheet.onOpen, searchSheet.onOpen])

    const onConfirmDelete = async () => {
        try {
            await deleteTemplate(currentFilename.current)

            const deletedId = TEMPLATE_TAB_PREFIX + currentFilename.current
            removeRecent(deletedId)

            if (pinned.has(deletedId)) updatePinned(toggleInSet(pinned, deletedId))

            router.back()
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_DELETING_TEMPLATE, error)
            showSnackbar(t('templates.delete.failed'))
        }
    }

    const onOpenDeleteDialog = useCallback(() => setDeleteDialogVisible(true), [])
    const onCloseDeleteDialog = useCallback(() => setDeleteDialogVisible(false), [])

    const onOpenPlaceholders = useCallback(() => setPlaceholdersVisible(true), [])
    const onClosePlaceholders = useCallback(() => setPlaceholdersVisible(false), [])

    const toggleProps = useMemo(() => ({
        onOpenPlaceholders,
        onOpenDeleteDialog
    }), [onOpenPlaceholders, onOpenDeleteDialog])

    const loadTemplate = useEffectEvent((isCancelled) => {
        getTemplate(filename).then((template) => {
            if (isCancelled()) return

            if (!template) {
                router.replace(ROUTES.HOME)
                return
            }

            const displayName = t(`templates.names.${template.name}`, template.name)

            setName(displayName)
            setContent(template.content)
            originalName.current = displayName
            originalContent.current = template.content

            setLoading(false)
        })
    })

    useEffect(() => {
        let cancelled = false
        loadTemplate(() => cancelled)
        return () => { cancelled = true }
    }, [filename])

    useAutosave(async () => {
        const trimmedName = name.trim()
        if (trimmedName === originalName.current && content === originalContent.current) return

        const nextName = trimmedName === originalName.current
            ? stripNoteExtension(splitTemplatePath(currentFilename.current).base)
            : trimmedName

        currentFilename.current = await updateTemplate(currentFilename.current, nextName, content)
        originalName.current = trimmedName
        originalContent.current = content
    }, [name, content], { skip: loading || !name.trim() })

    useEffect(() => {
        if (!activeFolder) return

        getFolderUri(splitTemplatePath(filename).dir).then((uri) => setFolderUri(uri || ''))
    }, [activeFolder, filename, getFolderUri])

    if (loading) return <LoadingOverlay />

    return (
        <EditorShell
            mode={mode}
            scope={TEMPLATE_SCOPE}
            chrome={chrome}
            onSetMode={setMode}
            actions={editorActions}
            toggleProps={toggleProps}
            versionHistory={versionHistory}
            sheets={(
                <>
                    <TemplatePlaceholdersDialog
                        visible={placeholdersVisible}
                        onDismiss={onClosePlaceholders}
                    />

                    <ConfirmDialog
                        visible={deleteDialogVisible}
                        title={t('templates.delete.title')}
                        message={t('templates.delete.message')}
                        confirmLabel={t('button.delete')}
                        onDismiss={onCloseDeleteDialog}
                        onConfirm={onConfirmDelete}
                    />
                </>
            )}
        >
            <TemplateEditorForm
                name={name}
                setName={setName}
                content={content}
                setContent={setContent}
                action={chrome.action}
                mode={mode}
                onFocus={chrome.onFocus}
                onBlur={chrome.onBlur}
                onHistoryChange={chrome.onHistoryChange}
                searchQuery={chrome.search.searchQuery}
                replaceText={chrome.search.replaceText}
            />
        </EditorShell>
    )
}
