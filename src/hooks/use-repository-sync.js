import { useCallback } from 'react'

export function useRepositorySync({
    repositories,
    activeRepositoryId,
    busyRef,
    directoryExists,
    listSubdirectories,
    buildRepository,
    discoverSubfolders,
    persistRepositories,
    persistActiveRepository
}) {
    const reconcileTree = useCallback((repository) => {
        if (!directoryExists(repository.uri)) return []

        let diskSubdirectories

        try {
            diskSubdirectories = listSubdirectories(repository.uri)
        } catch {
            diskSubdirectories = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskUris = new Set(diskSubdirectories.map((d) => d.uri))
        const trackedUris = new Set(trackedChildren.map((r) => r.uri))

        const survivingDescendants = trackedChildren
            .filter((child) => diskUris.has(child.uri))
            .flatMap(reconcileTree)

        const newDescendants = diskSubdirectories
            .filter((d) => !trackedUris.has(d.uri))
            .flatMap((d) => {
                const entry = buildRepository(d, repository.id, false)
                return [entry, ...discoverSubfolders(d, entry.id)]
            })

        return [repository, ...survivingDescendants, ...newDescendants]
    }, [
        repositories,
        buildRepository,
        directoryExists,
        listSubdirectories,
        discoverSubfolders
    ])

    const reconcileRepositories = useCallback(async () => {
        if (busyRef.current) return

        const roots = repositories.filter((r) => !r.parentId)
        const reconciled = roots.flatMap(reconcileTree)

        await persistRepositories(reconciled)

        if (activeRepositoryId && !reconciled.some((r) => r.id === activeRepositoryId)) {
            const remainingRoots = reconciled.filter((r) => !r.parentId)
            await persistActiveRepository(remainingRoots[0]?.id || '')
        }
    }, [
        repositories,
        activeRepositoryId,
        reconcileTree,
        persistRepositories,
        persistActiveRepository,
        busyRef
    ])

    return { reconcileRepositories }
}
