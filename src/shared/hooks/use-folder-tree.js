import { useCallback, useMemo } from 'react'

export function useFolderTree({ folders, activeFolder }) {
    const getRootRepository = useCallback((folder) => {
        let current = folder

        while (current.parentId) {
            const parent = folders.find((r) => r.id === current.parentId)
            if (!parent) break
            current = parent
        }

        return current
    }, [folders])

    const buildSubtree = useCallback((parentId, depth = 0) => (
        folders
            .filter((folder) => (folder.parentId || null) === parentId)
            .flatMap((folder) => [{ ...folder, depth }, ...buildSubtree(folder.id, depth + 1)])
    ), [folders])

    const getDescendants = useCallback((rootId) => buildSubtree(rootId, 0), [buildSubtree])

    const isAncestorOf = useCallback((ancestorId, folder) => {
        let current = folder

        while (current) {
            if (current.id === ancestorId) return true
            current = folders.find((r) => r.id === current.parentId)
        }

        return false
    }, [folders])

    const activeFolderTree = useMemo(() => {
        if (!activeFolder) return []
        const root = getRootRepository(activeFolder)
        return [{ ...root, depth: 0 }, ...buildSubtree(root.id, 1)]
    }, [
        activeFolder,
        getRootRepository,
        buildSubtree
    ])

    return {
        getRootRepository,
        buildSubtree,
        getDescendants,
        isAncestorOf,
        activeFolderTree
    }
}
