export const getRepositoryNoteCount = (uri, listMarkdownFiles) => listMarkdownFiles(uri).length

export const getRepositoryNoteCounts = (repositories, listMarkdownFiles) => (
    Object.fromEntries(
        repositories.map((repository) => [repository.id, getRepositoryNoteCount(repository.uri, listMarkdownFiles)])
    )
)

export const getChildFolderCounts = (descendants) => {
    const counts = {}

    descendants.forEach(({ parentId }) => {
        if (parentId) counts[parentId] = (counts[parentId] || 0) + 1
    })

    return counts
}
