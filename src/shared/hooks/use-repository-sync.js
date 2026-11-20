import { useCallback, useRef } from 'react'

export function useRepositorySync({
    folders,
    activeFolderId,
    busyRef,
    directoryExists,
    scanSubdirectories,
    buildFolder,
    discoverSubfolders,
    deleteFolderIndex,
    persistFolders,
    persistActiveFolder
}) {
    const foldersRef = useRef(folders)
    foldersRef.current = folders

    const reconcileTree = useCallback(async (folder) => {
        if (!directoryExists(folder.uri)) return []

        let diskSubdirectories

        try {
            diskSubdirectories = await scanSubdirectories(folder.uri)
        } catch {
            diskSubdirectories = []
        }

        const trackedChildren = folders.filter((r) => r.parentId === folder.id)
        const diskUris = new Set(diskSubdirectories.map((d) => d.uri))
        const trackedUris = new Set(trackedChildren.map((r) => r.uri))

        const survivingDescendants = await Promise.all(
            trackedChildren
                .filter((child) => diskUris.has(child.uri))
                .map(reconcileTree)
        )

        const newDescendants = await Promise.all(
            diskSubdirectories
                .filter((d) => !trackedUris.has(d.uri))
                .map(async (d) => {
                    const entry = buildFolder(d, folder.id, false)
                    return [entry, ...await discoverSubfolders(d, entry.id)]
                })
        )

        return [folder, ...survivingDescendants.flat(), ...newDescendants.flat()]
    }, [
        folders,
        buildFolder,
        directoryExists,
        scanSubdirectories,
        discoverSubfolders
    ])

    const reconcileFolders = useCallback(async () => {
        if (busyRef.current) return

        const roots = folders.filter((r) => !r.parentId)
        const reconciled = (await Promise.all(roots.map(reconcileTree))).flat()
        if (busyRef.current || foldersRef.current !== folders) return

        if (JSON.stringify(reconciled) !== JSON.stringify(folders)) {
            const keptIds = new Set(reconciled.map((folder) => folder.id))

            folders
                .filter((folder) => !keptIds.has(folder.id))
                .forEach((folder) => deleteFolderIndex(folder.id))

            await persistFolders(reconciled)
        }

        if (activeFolderId && !reconciled.some((r) => r.id === activeFolderId)) {
            const remainingRoots = reconciled.filter((r) => !r.parentId)
            await persistActiveFolder(remainingRoots[0]?.id || '')
        }
    }, [
        folders,
        activeFolderId,
        reconcileTree,
        deleteFolderIndex,
        persistFolders,
        persistActiveFolder,
        busyRef
    ])

    return { reconcileFolders }
}
