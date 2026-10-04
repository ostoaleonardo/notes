import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RenameRepository } from '@/screens/dialogs/rename-repository'
import { AddSubfolder } from '@/screens/dialogs/add-subfolder'
import { DeleteRepository } from '@/screens/dialogs/delete-repository'
import { DrawerToolbar, DrawerToolbarButton } from './drawer-toolbar'
import { DrawerList } from './drawer-list'
import { DrawerSortMenu } from './drawer-sort-menu'
import { DrawerNoteItem } from './drawer-note-item'
import { DrawerRepositoryItem } from './drawer-repository-item'
import { openEditor } from './drawer-open-editor'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useDailyNote } from '@/hooks/use-daily-note'
import { useNoteSort } from '@/hooks/use-note-sort'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useUtils } from '@/hooks/use-utils'
import { buildRepositoryTree, flattenDrawerTree } from '@/utils/drawer-tree'

import { CreateNewFolder } from '@/icons/create-new-folder'
import { Plus } from '@/icons/plus'
import { CalendarToday } from '@/icons/calendar-today'
import { CollapseAll } from '@/icons/collapse-all'
import { ExpandAll } from '@/icons/expand-all'

import { REPOSITORY_ACTIONS } from '@/constants/repository-actions'
import { ROUTES } from '@/constants/routes'

export function DrawerNotesView({ closeDrawer }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { collapsedFolders, collapseAll, expandAll } = useUtils()
    const openDailyNote = useDailyNote()
    const { sort, onChangeSort } = useNoteSort()

    const {
        activeRepositoryTree,
        activeRepositoryId,
        setActiveRepository
    } = useRepositories()

    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

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

    const rows = useMemo(
        () => flattenDrawerTree(tree, collapsedFolders),
        [tree, collapsedFolders]
    )

    const onOpenRoot = useCallback((id) => {
        if (id !== activeRepositoryId) setActiveRepository(id)
    }, [activeRepositoryId, setActiveRepository])

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

    const rootId = activeRepositoryTree[0]?.id

    const onCreateRootNote = useCallback(() => onCreateNote(rootId), [onCreateNote, rootId])
    const onAddRootSubfolder = useCallback(() => setSubfolderParentId(rootId), [rootId])

    const onToggleCollapseAll = useCallback(() => {
        if (collapsedFolders.size > 0) {
            expandAll()
        } else {
            collapseAll(activeRepositoryTree.map((repository) => repository.id))
        }
    }, [
        collapsedFolders,
        expandAll,
        collapseAll,
        activeRepositoryTree
    ])

    const allCollapsed = collapsedFolders.size > 0

    const toolbarItems = useMemo(() => [
        {
            key: 'create-note',
            icon: Plus,
            onPress: onCreateRootNote,
            accessibilityLabel: t('repositories.create_note')
        },
        {
            key: 'daily-note',
            icon: CalendarToday,
            onPress: onOpenDailyNote,
            accessibilityLabel: t('drawer.daily_note')
        },
        {
            key: 'add-subfolder',
            icon: CreateNewFolder,
            onPress: onAddRootSubfolder,
            accessibilityLabel: t('repositories.add_subfolder')
        },
        {
            key: 'toggle-all',
            icon: allCollapsed ? ExpandAll : CollapseAll,
            onPress: onToggleCollapseAll,
            accessibilityLabel: t(allCollapsed ? 'drawer.expand_all' : 'drawer.collapse_all')
        }
    ], [
        onCreateRootNote,
        onOpenDailyNote,
        onAddRootSubfolder,
        onToggleCollapseAll,
        allCollapsed,
        t
    ])

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'note') {
            return (
                <DrawerNoteItem
                    note={item.note}
                    depth={item.depth}
                    active={item.note.path === currentId}
                    onOpenNote={onOpenNote}
                />
            )
        }

        return (
            <DrawerRepositoryItem
                repository={item.repository}
                depth={item.depth}
                isCollapsed={item.isCollapsed}
                active={item.repository.id === activeRepositoryId}
                onOpenRoot={onOpenRoot}
                onAction={onRepositoryAction}
            />
        )
    }, [
        currentId,
        activeRepositoryId,
        onOpenNote,
        onOpenRoot,
        onRepositoryAction
    ])

    return (
        <>
            <DrawerList
                data={rows}
                keyExtractor={(row) => row.id}
                renderItem={renderItem}
            />

            <DrawerToolbar>
                {toolbarItems.map(({ key, ...item }) => (
                    <DrawerToolbarButton
                        key={key}
                        {...item}
                    />
                ))}

                <DrawerSortMenu
                    sort={sort}
                    onChange={onChangeSort}
                />
            </DrawerToolbar>

            <RenameRepository
                visible={!!editFolderId}
                repositoryId={editFolderId}
                onDismiss={() => setEditFolderId('')}
            />
            <AddSubfolder
                visible={!!subfolderParentId}
                parentId={subfolderParentId}
                onDismiss={() => setSubfolderParentId('')}
            />
            <DeleteRepository
                visible={!!deleteId}
                repositoryId={deleteId}
                onDismiss={() => setDeleteId('')}
            />
        </>
    )
}
