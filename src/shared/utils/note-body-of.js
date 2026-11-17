import { FRONTMATTER_REGEX } from '@/shared/constants/markdown-patterns'

export const bodyOf = (note, bodies) => bodies?.get(note.path) ?? note.note ?? ''

export const splitBody = (content) => {
    const match = content.match(FRONTMATTER_REGEX)

    return match ? content.slice(match[0].length) : content
}
