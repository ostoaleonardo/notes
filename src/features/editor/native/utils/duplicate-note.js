export const buildDuplicateNote = (note, { createdAt, copySuffix }) => ({
    ...note,
    title: `${note.title} ${copySuffix}`,
    createdAt,
    updatedAt: ''
})
