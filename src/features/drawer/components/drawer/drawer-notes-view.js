import { useCallback, useMemo } from 'react'

import { DrawerView } from './drawer-view'
import { DrawerNotesEmpty } from './drawer-empty'
import { DrawerSortMenu } from './drawer-sort-menu'
import { DrawerCurrentAwareNote } from './drawer-level-note'
import { DrawerLevelFolder } from './drawer-level-folder'
import { DrawerLevelHeader } from './drawer-level-header'
import { DrawerFolderDialogs } from './drawer-folder-dialogs'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useNotes } from '@/shared/hooks/use-notes'
import { useNoteSort } from '@/features/drawer/hooks/use-note-sort'
import { useDrawerLevel } from '@/features/drawer/hooks/use-drawer-level'
import { useFolderDialogs } from '@/features/drawer/hooks/use-folder-dialogs'
import { useDrawerToolbar } from '@/features/drawer/hooks/use-drawer-toolbar'
import { openEditor } from '@/shared/utils/open-editor'
import { pushOnce } from '@/shared/utils/navigation'

import { REPOSITORY_ACTIONS } from '@/features/drawer/constants/repository-actions'
import { ROUTES } from '@/shared/constants/routes'
import { DRAWER_ITEM_TYPES } from '@/shared/constants/drawer-views'

export const DrawerNotesView = ({ closeDrawer, drawerOpen }) => {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { sort, onChangeSort } = useNoteSort()
    const dialogs = useFolderDialogs()

    const {
        rows,
        hasFolders,
        folderId,
        isRoot,
        listRef,
        entering,
        onEnterFolder,
        onUpLevel
    } = useDrawerLevel({ sort, drawerOpen })

    const onOpenNote = useCallback((id) => {
        closeDrawer()
        if (id === currentId) return

        openEditor(id, currentId)
    }, [closeDrawer, currentId])

    const onCreateNote = useCallback((targetId) => {
        pushOnce({
            pathname: ROUTES.ADD_NOTE,
            params: { folderId: targetId }
        })
        closeDrawer()
    }, [closeDrawer])

    const { onAddSubfolder, onEdit, onDelete } = dialogs
    const onRepositoryAction = useCallback((action, targetId) => {
        if (action === REPOSITORY_ACTIONS.CREATE_NOTE) return onCreateNote(targetId)
        if (action === REPOSITORY_ACTIONS.ADD_SUBFOLDER) return onAddSubfolder(targetId)
        if (action === REPOSITORY_ACTIONS.EDIT_FOLDER) return onEdit(targetId)
        if (action === REPOSITORY_ACTIONS.DELETE) return onDelete(targetId)
    }, [onCreateNote, onAddSubfolder, onEdit, onDelete])

    const toolbarItems = useDrawerToolbar({ folderId, isRoot, dialogs, onCreateNote, closeDrawer })

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
                listEntering={entering}
            />

            <DrawerFolderDialogs dialogs={dialogs} />
        </>
    )
}
