import { dump, load } from 'js-yaml'

import { FRONTMATTER_REGEX } from '@/constants/markdown-patterns'

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

export const buildNoteFileContent = ({ tags, invalidFrontmatter = null }, body) => {
    const frontmatter = invalidFrontmatter != null
        ? `${invalidFrontmatter}\n`
        : dump({ tags: tags || [] })

    return `---\n${frontmatter}---\n\n${body}`
}

export const decomposeNoteFileContent = (content) => {
    const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(content)

    if (error) return { body, tags: null, invalidFrontmatter: rawFrontmatter }

    return {
        body,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        invalidFrontmatter: null
    }
}
