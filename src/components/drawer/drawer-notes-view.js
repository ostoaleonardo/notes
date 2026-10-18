import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { SlideInLeft, SlideInRight } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import { RenameRepository } from '@/screens/dialogs/rename-repository'
import { AddSubfolder } from '@/screens/dialogs/add-subfolder'
import { DeleteRepository } from '@/screens/dialogs/delete-repository'
import { DrawerView } from './drawer-view'
import { DrawerSortMenu } from './drawer-sort-menu'
import { DrawerLevelNote } from './drawer-level-note'
import { DrawerLevelFolder } from './drawer-level-folder'
import { DrawerLevelHeader } from './drawer-level-header'
import { openEditor } from './drawer-open-editor'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useDailyNote } from '@/hooks/use-daily-note'
import { useNoteSort } from '@/hooks/use-note-sort'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useUtils } from '@/hooks/use-utils'
import { buildLevelRows, buildRepositoryTree, resolveLevel } from '@/utils/drawer-tree'

import { CreateNewFolder } from '@/icons/create-new-folder'
import { FolderDelete } from '@/icons/folder-delete'
import { FolderManaged } from '@/icons/folder-managed'
import { Plus } from '@/icons/plus'
import { CalendarToday } from '@/icons/calendar-today'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'
import { ROUTES } from '@/constants/routes'
import { TEST_IDS } from '@/constants/test-ids'
import {
    DRAWER_ITEM_TYPES,
    DRAWER_TOOLBAR_KEYS,
    LEVEL_DIRECTIONS
} from '@/constants/drawer-views'
import { ANIMATION_DURATION } from '@/constants/theme'

export function DrawerNotesView({ closeDrawer, drawerOpen }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { drawerFolderId, setDrawerFolderId } = useUtils()
    const openDailyNote = useDailyNote()
    const { sort, onChangeSort } = useNoteSort()
    const { activeRepositoryTree } = useRepositories()

    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const direction = useRef(LEVEL_DIRECTIONS.FORWARD)
    const listRef = useRef(null)

    const notesByRepository = useMemo(() => {
        const map = new Map()
        notes.forEach((note) => {
            if (!map.has(note.repositoryId)) map.set(note.repositoryId, [])
            map.get(note.repositoryId).push(note)
        })
        return map
    }, [notes])

    const tree = useMemo(
        () => buildRepositoryTree(activeRepositoryTree, notesByRepository, sort),
        [activeRepositoryTree, notesByRepository, sort]
    )

    const level = useMemo(() => resolveLevel(tree, drawerFolderId), [tree, drawerFolderId])
    const rows = useMemo(() => (level ? buildLevelRows(level) : []), [level])

    const folderId = level?.repository.id
    const parentId = level?.repository.parentId || null
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

    useEffect(() => {
        const note = notes.find((item) => item.path === currentId)
        if (note) goToFolder(note.repositoryId, LEVEL_DIRECTIONS.FORWARD)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const onCreateNote = useCallback((repositoryId) => {
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId }
        })
        closeDrawer()
    }, [closeDrawer])

    const onRepositoryAction = useCallback((action, repositoryId) => {
        if (action === REPOSITORY_ACTIONS.CREATE_NOTE) return onCreateNote(repositoryId)
        if (action === REPOSITORY_ACTIONS.ADD_SUBFOLDER) return setSubfolderParentId(repositoryId)
        if (action === REPOSITORY_ACTIONS.EDIT_FOLDER) return setEditFolderId(repositoryId)
        if (action === REPOSITORY_ACTIONS.DELETE) return setDeleteId(repositoryId)
    }, [onCreateNote])

    const onOpenDailyNote = useCallback(async () => {
        const path = await openDailyNote()
        if (!path) return

        closeDrawer()
        if (path !== currentId) openEditor(path, currentId)
    }, [openDailyNote, closeDrawer, currentId])

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
            icon: Plus,
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
                <DrawerLevelNote
                    note={item.note}
                    active={item.note.path === currentId}
                    onOpenNote={onOpenNote}
                />
            )
        }

        if (item.type === DRAWER_ITEM_TYPES.LEVEL) {
            return (
                <DrawerLevelHeader
                    repository={item.repository}
                    onBack={onUpLevel}
                />
            )
        }

        return (
            <DrawerLevelFolder
                repository={item.repository}
                onEnter={onEnterFolder}
                onAction={onRepositoryAction}
            />
        )
    }, [currentId, onOpenNote, onUpLevel, onEnterFolder, onRepositoryAction])

    const Entering = direction.current === LEVEL_DIRECTIONS.FORWARD ? SlideInRight : SlideInLeft

    return (
        <DrawerView
            data={rows}
            renderItem={renderItem}
            toolbarItems={toolbarItems}
            toolbarExtra={toolbarExtra}
            listKey={folderId}
            listRef={listRef}
            listEntering={Entering.duration(ANIMATION_DURATION)}
        >
            <RenameRepository
                visible={!!editFolderId}
                repositoryId={editFolderId}
                onDismiss={onDismissEdit}
            />
            <AddSubfolder
                visible={!!subfolderParentId}
                parentId={subfolderParentId}
                onDismiss={onDismissSubfolder}
            />
            <DeleteRepository
                visible={!!deleteId}
                repositoryId={deleteId}
                onDismiss={onDismissDelete}
            />
        </DrawerView>
    )
}
