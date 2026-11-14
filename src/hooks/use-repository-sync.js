import { useCallback, useRef } from 'react'

export function useRepositorySync({
    repositories,
    activeRepositoryId,
    busyRef,
    directoryExists,
    scanSubdirectories,
    buildRepository,
    discoverSubfolders,
    deleteRepositoryIndex,
    persistRepositories,
    persistActiveRepository
}) {
    const repositoriesRef = useRef(repositories)
    repositoriesRef.current = repositories

    const reconcileTree = useCallback(async (repository) => {
        if (!directoryExists(repository.uri)) return []

        let diskSubdirectories

        try {
            diskSubdirectories = await scanSubdirectories(repository.uri)
        } catch {
            diskSubdirectories = []
        }

        const trackedChildren = repositories.filter((r) => r.parentId === repository.id)
        const diskUris = new Set(diskSubdirectories.map((d) => d.uri))
        const trackedUris = new Set(trackedChildren.map((r) => r.uri))

        const survivingDescendants = await Promise.all(
            trackedChildren
                .filter((child) => diskUris.has(child.uri))
                .map(reconcileTree)
        )

        const newDescendants = diskSubdirectories
            .filter((d) => !trackedUris.has(d.uri))
            .flatMap((d) => {
                const entry = buildRepository(d, repository.id, false)
                return [entry, ...discoverSubfolders(d, entry.id)]
            })

        return [repository, ...survivingDescendants.flat(), ...newDescendants]
    }, [
        repositories,
        buildRepository,
        directoryExists,
        scanSubdirectories,
        discoverSubfolders
    ])

    const reconcileRepositories = useCallback(async () => {
        if (busyRef.current) return

        const roots = repositories.filter((r) => !r.parentId)
        const reconciled = (await Promise.all(roots.map(reconcileTree))).flat()
        if (busyRef.current || repositoriesRef.current !== repositories) return

        if (JSON.stringify(reconciled) !== JSON.stringify(repositories)) {
            const keptIds = new Set(reconciled.map((repository) => repository.id))

            repositories
                .filter((repository) => !keptIds.has(repository.id))
                .forEach((repository) => deleteRepositoryIndex(repository.id))

            await persistRepositories(reconciled)
        }

        if (activeRepositoryId && !reconciled.some((r) => r.id === activeRepositoryId)) {
            const remainingRoots = reconciled.filter((r) => !r.parentId)
            await persistActiveRepository(remainingRoots[0]?.id || '')
        }
    }, [
        repositories,
        activeRepositoryId,
        reconcileTree,
        deleteRepositoryIndex,
        persistRepositories,
        persistActiveRepository,
        busyRef
    ])

    return { reconcileRepositories }
}
