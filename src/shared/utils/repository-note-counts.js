export const getRepositoryNoteCount = async (uri, scanMarkdownFiles) => (await scanMarkdownFiles(uri)).length

export const getRepositoryNoteCounts = async (repositories, scanMarkdownFiles) => (
    Object.fromEntries(await Promise.all(
        repositories.map(async (repository) => [
            repository.id,
            await getRepositoryNoteCount(repository.uri, scanMarkdownFiles)
        ])
    ))
)

export const getChildFolderCounts = (descendants) => {
    const counts = {}

    descendants.forEach(({ parentId }) => {
        if (parentId) counts[parentId] = (counts[parentId] || 0) + 1
    })

    return counts
}
