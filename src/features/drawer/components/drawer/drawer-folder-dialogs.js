import { RenameFolderDialog } from '@/shared/components/rename-folder-dialog'
import { DeleteFolderDialog } from '@/shared/components/delete-folder-dialog'
import { AddSubfolder } from '@/features/drawer/screens/dialogs/add-subfolder'

export const DrawerFolderDialogs = ({ dialogs }) => (
    <>
        <RenameFolderDialog
            visible={!!dialogs.editFolderId}
            folderId={dialogs.editFolderId}
            onDismiss={dialogs.onDismissEdit}
        />
        <AddSubfolder
            visible={!!dialogs.subfolderParentId}
            parentId={dialogs.subfolderParentId}
            onDismiss={dialogs.onDismissSubfolder}
        />
        <DeleteFolderDialog
            visible={!!dialogs.deleteId}
            folderId={dialogs.deleteId}
            onDismiss={dialogs.onDismissDelete}
        />
    </>
)
