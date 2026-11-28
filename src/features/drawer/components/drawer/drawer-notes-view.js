import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { SlideInLeft, SlideInRight } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { RenameFolderDialog } from '@/shared/components/rename-folder-dialog'
import { AddSubfolder } from '@/features/drawer/screens/dialogs/add-subfolder'
import { DeleteFolderDialog } from '@/shared/components/delete-folder-dialog'
import { DrawerView } from './drawer-view'
import { DrawerNotesEmpty } from './drawer-empty'
import { DrawerSortMenu } from './drawer-sort-menu'
import { DrawerCurrentAwareNote } from './drawer-level-note'
import { DrawerLevelFolder } from './drawer-level-folder'
import { DrawerLevelHeader } from './drawer-level-header'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useOpenDailyNote } from '@/shared/hooks/use-open-daily-note'
import { usePickMarkdownImport } from '@/features/drawer/hooks/use-pick-markdown-import'
import { useNoteSort } from '@/features/drawer/hooks/use-note-sort'
import { useNotes } from '@/shared/hooks/use-notes'
import { useFolders } from '@/shared/hooks/use-folders'
import { useUtils } from '@/shared/hooks/use-utils'
import { buildLevelRows, buildFolderTree, resolveLevel } from '@/features/drawer/utils/drawer-tree'
import { openEditor } from '@/shared/utils/open-editor'
import { pushOnce } from '@/shared/utils/navigation'

import { CreateNewFolder } from '@/icons/create-new-folder'
import { FolderDelete } from '@/icons/folder-delete'
import { FolderManaged } from '@/icons/folder-managed'
import { Add } from '@/icons/add'
import { CalendarToday } from '@/icons/calendar-today'
import { UploadFile } from '@/icons/upload-file'

import { REPOSITORY_ACTIONS } from '@/features/drawer/constants/repository-actions'
import { ROUTES } from '@/shared/constants/routes'
import { TEST_IDS } from '@/shared/constants/test-ids'
import {
    DRAWER_ITEM_TYPES,
    DRAWER_TOOLBAR_KEYS,
    LEVEL_DIRECTIONS
} from '@/shared/constants/drawer-views'
import { ANIMATION_DURATION } from '@/shared/constants/theme'

const ENTERINGS = {
    [LEVEL_DIRECTIONS.FORWARD]: SlideInRight.duration(ANIMATION_DURATION),
    [LEVEL_DIRECTIONS.BACK]: SlideInLeft.duration(ANIMATION_DURATION)
}

export const DrawerNotesView = ({ closeDrawer, drawerOpen }) => {
    const { t } = useTranslation()
    const { notes, loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { drawerFolderId, setDrawerFolderId } = useUtils()
    const { sort, onChangeSort } = useNoteSort()
    const { activeFolderTree } = useFolders()

    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const direction = useRef(null)
    const listRef = useRef(null)

    const notesByFolder = useMemo(() => {
        const map = new Map()
        notes.forEach((note) => {
            if (!map.has(note.folderId)) map.set(note.folderId, [])
            map.get(note.folderId).push(note)
        })
        return map
    }, [notes])

    const tree = useMemo(
        () => buildFolderTree(activeFolderTree, notesByFolder, sort),
        [activeFolderTree, notesByFolder, sort]
    )

    const level = useMemo(() => resolveLevel(tree, drawerFolderId), [tree, drawerFolderId])
    const rows = useMemo(() => (level ? buildLevelRows(level) : []), [level])
    const hasFolders = useMemo(() => rows.some((row) => row.type === DRAWER_ITEM_TYPES.REPOSITORY), [rows])

    const folderId = level?.folder.id
    const parentId = level?.folder.parentId || null
    const isRoot = !parentId

    const goToFolder = useCallback((id, next) => {
        direction.current = next
        setDrawerFolderId(id)
    }, [setDrawerFolderId])

    useEffect(() => {
        if (drawerOpen) listRef.current?.scrollToOffset({ offset: 0, animated: false })
    }, [drawerOpen])

    const onEnterFolder = useCallback((id) => {
        goToFolder(id, LEVEL_DIRECTIONS.FORWARD)
    }, [goToFolder])

    const onUpLevel = useCallback(() => {
        goToFolder(parentId, LEVEL_DIRECTIONS.BACK)
    }, [goToFolder, parentId])

    const revealCurrentNote = useEffectEvent(() => {
        const note = notes.find((item) => item.path === currentId)
        if (note) goToFolder(note.folderId, LEVEL_DIRECTIONS.FORWARD)
    })

    useEffect(() => {
        revealCurrentNote()
    }, [currentId])

    useEffect(() => {
        if (!drawerOpen || isRoot) return undefined

        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            onUpLevel()
            return true
        })

        return () => subscription.remove()
    }, [drawerOpen, isRoot, onUpLevel])

    const onOpenNote = useCallback((id) => {
        closeDrawer()
        if (id === currentId) return

        openEditor(id, currentId)
    }, [closeDrawer, currentId])

    const onCreateNote = useCallback((folderId) => {
        pushOnce({
            pathname: ROUTES.ADD_NOTE,
            params: { folderId }
        })
        closeDrawer()
    }, [closeDrawer])

    const onRepositoryAction = useCallback((action, folderId) => {
        if (action === REPOSITORY_ACTIONS.CREATE_NOTE) return onCreateNote(folderId)
        if (action === REPOSITORY_ACTIONS.ADD_SUBFOLDER) return setSubfolderParentId(folderId)
        if (action === REPOSITORY_ACTIONS.EDIT_FOLDER) return setEditFolderId(folderId)
        if (action === REPOSITORY_ACTIONS.DELETE) return setDeleteId(folderId)
    }, [onCreateNote])

    const [onOpenDailyNote] = useOpenDailyNote({ currentId, onOpened: closeDrawer })
    const [onImportNote] = usePickMarkdownImport(folderId)

    const onDismissEdit = useCallback(() => setEditFolderId(''), [])
    const onDismissSubfolder = useCallback(() => setSubfolderParentId(''), [])
    const onDismissDelete = useCallback(() => setDeleteId(''), [])

    const onCreateFolderNote = useCallback(() => onCreateNote(folderId), [onCreateNote, folderId])
    const onAddFolderSubfolder = useCallback(() => setSubfolderParentId(folderId), [folderId])
    const onEditFolder = useCallback(() => setEditFolderId(folderId), [folderId])
    const onDeleteFolder = useCallback(() => setDeleteId(folderId), [folderId])

    const toolbarItems = useMemo(() => [
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

    const toolbarExtra = useMemo(() => (
        <DrawerSortMenu
            sort={sort}
            onChange={onChangeSort}
        />
    ), [sort, onChangeSort])

    const renderItem = useCallback(({ item }) => {
        if (item.type === DRAWER_ITEM_TYPES.NOTE) {
            return (
                <DrawerCurrentAwareNote
                    note={item.note}
                    showSlot={hasFolders}
                    onOpenNote={onOpenNote}
                />
            )
        }

        if (item.type === DRAWER_ITEM_TYPES.LEVEL) {
            return (
                <DrawerLevelHeader
                    folder={item.folder}
                    onBack={onUpLevel}
                />
            )
        }

        return (
            <DrawerLevelFolder
                folder={item.folder}
                onEnter={onEnterFolder}
                onAction={onRepositoryAction}
            />
        )
    }, [hasFolders, onOpenNote, onUpLevel, onEnterFolder, onRepositoryAction])

    return (
        <>
            <DrawerView
                data={rows}
                ListEmptyComponent={DrawerNotesEmpty}
                loading={loading}
                renderItem={renderItem}
                toolbarItems={toolbarItems}
                toolbarExtra={toolbarExtra}
                listKey={folderId}
                listRef={listRef}
                listEntering={ENTERINGS[direction.current]}
            />

            <RenameFolderDialog
                visible={!!editFolderId}
                folderId={editFolderId}
                onDismiss={onDismissEdit}
            />
            <AddSubfolder
                visible={!!subfolderParentId}
                parentId={subfolderParentId}
                onDismiss={onDismissSubfolder}
            />
            <DeleteFolderDialog
                visible={!!deleteId}
                folderId={deleteId}
                onDismiss={onDismissDelete}
            />
        </>
    )
}
