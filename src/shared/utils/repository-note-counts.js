export const getRepositoryNoteCount = async (uri, scanMarkdownFiles) => (await scanMarkdownFiles(uri)).length

export const getRepositoryNoteCounts = async (folders, scanMarkdownFiles) => (
    Object.fromEntries(await Promise.all(
        folders.map(async (folder) => [
            folder.id,
            await getRepositoryNoteCount(folder.uri, scanMarkdownFiles)
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
