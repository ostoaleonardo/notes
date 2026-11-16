export const getSearchText = (note) => {
    const frontmatter = note.rawFrontmatter || note.invalidFrontmatter || ''
    const body = note.note || ''

    return frontmatter ? `${frontmatter}\n${body}` : body
}
