import { useCallback, useMemo } from 'react'

export function useRepositoryTree({ repositories, activeRepository }) {
    const getRootRepository = useCallback((repository) => {
        let current = repository

        while (current.parentId) {
            const parent = repositories.find((r) => r.id === current.parentId)
            if (!parent) break
            current = parent
        }

        return current
    }, [repositories])

    const buildSubtree = useCallback((parentId, depth = 0) => (
        repositories
            .filter((repository) => (repository.parentId || null) === parentId)
            .flatMap((repository) => [{ ...repository, depth }, ...buildSubtree(repository.id, depth + 1)])
    ), [repositories])

    const getDescendants = useCallback((rootId) => buildSubtree(rootId, 0), [buildSubtree])

    const isAncestorOf = useCallback((ancestorId, repository) => {
        let current = repository

        while (current) {
            if (current.id === ancestorId) return true
            current = repositories.find((r) => r.id === current.parentId)
        }

        return false
    }, [repositories])

    const activeRepositoryTree = useMemo(() => {
        if (!activeRepository) return []
        const root = getRootRepository(activeRepository)
        return [{ ...root, depth: 0 }, ...buildSubtree(root.id, 1)]
    }, [
        repositories,
        activeRepository,
        getRootRepository,
        buildSubtree
    ])

    return {
        getRootRepository,
        buildSubtree,
        getDescendants,
        isAncestorOf,
        activeRepositoryTree
    }
}
