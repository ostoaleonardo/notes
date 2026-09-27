export const buildNotePayload = ({ path, title, note, tags, createdAt, repositoryId, updatedAt }) => ({
    path,
    title: title.trim(),
    note: note.trim(),
    tags,
    createdAt,
    repositoryId,
    updatedAt
})
