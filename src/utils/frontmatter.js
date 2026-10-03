import { dump, load } from 'js-yaml'

import {
    FRONTMATTER_REGEX,
    LEADING_HASH_PATTERN,
    TAG_SEPARATOR_PATTERN
} from '@/constants/markdown-patterns'

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

const toTagList = (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string') return value.split(TAG_SEPARATOR_PATTERN)
    return []
}

export const normalizeTags = (value) => {
    const names = toTagList(value)
        .map((tag) => String(tag).trim().replace(LEADING_HASH_PATTERN, ''))
        .filter(Boolean)

    return [...new Set(names)]
}

export const extractProperties = (frontmatter) => {
    const properties = { ...frontmatter }
    delete properties.tags
    return properties
}

export const buildNoteFileContent = ({ tags, properties, invalidFrontmatter = null }, body) => {
    const frontmatter = invalidFrontmatter != null
        ? `${invalidFrontmatter}\n`
        : dump({ ...properties, tags: tags || [] })

    return `---\n${frontmatter}---\n\n${body}`
}

export const decomposeNoteFileContent = (content) => {
    const { frontmatter, body, error, rawFrontmatter } = parseFrontmatter(content)

    if (error) return { body, tags: null, properties: null, invalidFrontmatter: rawFrontmatter }

    return {
        body,
        tags: normalizeTags(frontmatter.tags),
        properties: extractProperties(frontmatter),
        invalidFrontmatter: null
    }
}
