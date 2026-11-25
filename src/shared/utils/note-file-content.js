import { repositoryEngine } from '@/shared/utils/repository-engine'

export const composeNoteFile = ({
    tags,
    properties,
    invalidFrontmatter = null,
    rawFrontmatter = null
}, body) => repositoryEngine.composeNote(
    tags ?? [],
    JSON.stringify(properties ?? {}),
    invalidFrontmatter,
    rawFrontmatter,
    body
)

export const decomposeNoteFile = (content) => {
    const parts = repositoryEngine.decomposeNote(content)

    return {
        body: parts.body,
        tags: parts.tags,
        properties: parts.propertiesJson == null ? null : JSON.parse(parts.propertiesJson),
        invalidFrontmatter: parts.invalidFrontmatter,
        rawFrontmatter: parts.rawFrontmatter
    }
}
