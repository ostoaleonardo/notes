import RepositoryFs from 'repository-fs'

export const composeNoteFile = ({
    tags,
    properties,
    invalidFrontmatter = null,
    rawFrontmatter = null
}, body) => RepositoryFs.composeNote(
    tags ?? [],
    JSON.stringify(properties ?? {}),
    invalidFrontmatter,
    rawFrontmatter,
    body
)

export const decomposeNoteFile = (content) => {
    const parts = RepositoryFs.decomposeNote(content)

    return {
        body: parts.body,
        tags: parts.tags,
        properties: parts.propertiesJson == null ? null : JSON.parse(parts.propertiesJson),
        invalidFrontmatter: parts.invalidFrontmatter,
        rawFrontmatter: parts.rawFrontmatter
    }
}
