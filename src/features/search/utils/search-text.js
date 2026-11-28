import { bodyOf } from '@/shared/utils/note-body-of'

export const getSearchText = (note, bodies) => {
    const frontmatter = note.rawFrontmatter || note.invalidFrontmatter || ''
    const body = bodyOf(note, bodies)

    return frontmatter ? `${frontmatter}\n${body}` : body
}
