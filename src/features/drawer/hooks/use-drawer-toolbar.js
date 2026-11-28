import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useOpenDailyNote } from '@/shared/hooks/use-open-daily-note'
import { usePickMarkdownImport } from '@/features/drawer/hooks/use-pick-markdown-import'

import { CreateNewFolder } from '@/icons/create-new-folder'
import { FolderDelete } from '@/icons/folder-delete'
import { FolderManaged } from '@/icons/folder-managed'
import { Add } from '@/icons/add'
import { CalendarToday } from '@/icons/calendar-today'
import { UploadFile } from '@/icons/upload-file'

import { TEST_IDS } from '@/shared/constants/test-ids'
import { DRAWER_TOOLBAR_KEYS } from '@/shared/constants/drawer-views'

export const useDrawerToolbar = ({ folderId, isRoot, dialogs, onCreateNote, closeDrawer }) => {
    const { t } = useTranslation()
    const { currentId } = useCurrentNote()
    const [onOpenDailyNote] = useOpenDailyNote({ currentId, onOpened: closeDrawer })
    const [onImportNote] = usePickMarkdownImport(folderId)

    const { onAddSubfolder, onEdit, onDelete } = dialogs
    const onCreateFolderNote = useCallback(() => onCreateNote(folderId), [onCreateNote, folderId])
    const onAddFolderSubfolder = useCallback(() => onAddSubfolder(folderId), [onAddSubfolder, folderId])
    const onEditFolder = useCallback(() => onEdit(folderId), [onEdit, folderId])
    const onDeleteFolder = useCallback(() => onDelete(folderId), [onDelete, folderId])

    return useMemo(() => [
        {
            key: 'create-note',
            testID: TEST_IDS.DRAWER_CREATE_NOTE,
            icon: Add,
            onPress: onCreateFolderNote,
            accessibilityLabel: t('repositories.create_note')
        },
        {
            key: 'daily-note',
            testID: TEST_IDS.DRAWER_DAILY_NOTE,
            icon: CalendarToday,
            onPress: onOpenDailyNote,
            accessibilityLabel: t('drawer.daily_note')
        },
        {
            key: 'import-note',
            testID: TEST_IDS.DRAWER_IMPORT_NOTE,
            icon: UploadFile,
            onPress: onImportNote,
            accessibilityLabel: t('title.import')
        },
        {
            key: 'add-subfolder',
            testID: TEST_IDS.DRAWER_ADD_SUBFOLDER,
            icon: CreateNewFolder,
            onPress: onAddFolderSubfolder,
            accessibilityLabel: t('repositories.add_subfolder')
        },
        ...(isRoot ? [] : [
            {
                key: DRAWER_TOOLBAR_KEYS.EDIT_FOLDER,
                testID: TEST_IDS.DRAWER_EDIT_FOLDER,
                icon: FolderManaged,
                onPress: onEditFolder,
                accessibilityLabel: t('repositories.edit_folder')
            },
            {
                key: DRAWER_TOOLBAR_KEYS.DELETE_FOLDER,
                testID: TEST_IDS.DRAWER_DELETE_FOLDER,
                icon: FolderDelete,
                onPress: onDeleteFolder,
                accessibilityLabel: t('repositories.delete.folder_title')
            }
        ])
    ], [
        onCreateFolderNote,
        onOpenDailyNote,
        onImportNote,
        onAddFolderSubfolder,
        onEditFolder,
        onDeleteFolder,
        isRoot,
        t
    ])
}
