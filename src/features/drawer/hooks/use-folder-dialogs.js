import { useCallback, useMemo, useState } from 'react'

export const useFolderDialogs = () => {
    const [editFolderId, setEditFolderId] = useState('')
    const [subfolderParentId, setSubfolderParentId] = useState('')
    const [deleteId, setDeleteId] = useState('')

    const onDismissEdit = useCallback(() => setEditFolderId(''), [])
    const onDismissSubfolder = useCallback(() => setSubfolderParentId(''), [])
    const onDismissDelete = useCallback(() => setDeleteId(''), [])

    return useMemo(() => ({
        editFolderId,
        subfolderParentId,
        deleteId,
        onEdit: setEditFolderId,
        onAddSubfolder: setSubfolderParentId,
        onDelete: setDeleteId,
        onDismissEdit,
        onDismissSubfolder,
        onDismissDelete
    }), [editFolderId, subfolderParentId, deleteId, onDismissEdit, onDismissSubfolder, onDismissDelete])
}
