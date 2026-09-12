export const buildDuplicateNote = (note, { id, createdAt, copySuffix }) => ({
    ...note,
    id,
    title: `${note.title} ${copySuffix}`,
    createdAt,
    updatedAt: ''
})
