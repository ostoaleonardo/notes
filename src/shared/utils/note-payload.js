export const buildNotePayload = ({
    path,
    title,
    note,
    tags,
    properties,
    repositoryId,
    invalidFrontmatter = null,
    rawFrontmatter = null
}) => ({
    path,
    title: title.trim(),
    note: note.trim(),
    tags,
    properties,
    repositoryId,
    invalidFrontmatter,
    rawFrontmatter
})
