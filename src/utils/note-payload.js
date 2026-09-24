export const buildNotePayload = ({ id, title, note, tags, createdAt, repositoryId, updatedAt }) => ({
    id,
    title: title.trim(),
    note: note.trim(),
    tags,
    createdAt,
    repositoryId,
    updatedAt
})
