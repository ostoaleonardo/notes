export const getFolderNoteCount = async (uri, scanMarkdownFiles) => (await scanMarkdownFiles(uri)).length

export const getFolderNoteCounts = async (folders, scanMarkdownFiles) => (
    Object.fromEntries(await Promise.all(
        folders.map(async (folder) => [
            folder.id,
            await getFolderNoteCount(folder.uri, scanMarkdownFiles)
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
