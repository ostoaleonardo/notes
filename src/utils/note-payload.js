export const buildNotePayload = ({ path, title, note, tags, createdAt, repositoryId, invalidFrontmatter = null }) => ({
    path,
    title: title.trim(),
    note: note.trim(),
    tags,
    createdAt,
    repositoryId,
    invalidFrontmatter
})
