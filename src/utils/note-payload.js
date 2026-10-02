export const buildNotePayload = ({ path, title, note, tags, repositoryId, invalidFrontmatter = null }) => ({
    path,
    title: title.trim(),
    note: note.trim(),
    tags,
    repositoryId,
    invalidFrontmatter
})
