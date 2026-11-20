export const buildNotePayload = ({
    path,
    title,
    note,
    tags,
    properties,
    folderId,
    invalidFrontmatter = null,
    rawFrontmatter = null
}) => ({
    path,
    title: title.trim(),
    note: note.trim(),
    tags,
    properties,
    folderId,
    invalidFrontmatter,
    rawFrontmatter
})
