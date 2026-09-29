import { dump, load } from 'js-yaml'

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n*/

export const parseFrontmatter = (rawContent) => {
    const match = rawContent.match(FRONTMATTER_REGEX)
    if (!match) return { frontmatter: {}, body: rawContent, error: false, hasBlock: false }

    const body = rawContent.slice(match[0].length)
    const rawFrontmatter = match[1]

    if (!rawFrontmatter.trim()) return { frontmatter: {}, body, error: false, hasBlock: true, rawFrontmatter }

    try {
        const frontmatter = load(rawFrontmatter)
        if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
            return { frontmatter: {}, body, error: true, hasBlock: true, rawFrontmatter }
        }

        return { frontmatter, body, error: false, hasBlock: true, rawFrontmatter }
    } catch {
        return { frontmatter: {}, body, error: true, hasBlock: true, rawFrontmatter }
    }
}

export const buildNoteFileContent = ({ tags }, body) => {
    const frontmatter = dump({ tags: tags || [] })
    return `---\n${frontmatter}---\n\n${body}`
}
