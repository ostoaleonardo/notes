export const getRepositoryNoteCount = (uri, listMarkdownFiles) => listMarkdownFiles(uri).length

export const getRepositoryNoteCounts = (repositories, listMarkdownFiles) => (
    Object.fromEntries(
        repositories.map((repository) => [repository.id, getRepositoryNoteCount(repository.uri, listMarkdownFiles)])
    )
)
