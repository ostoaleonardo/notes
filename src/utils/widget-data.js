import { WIDGET_EXTRACT_LIMIT, WIDGET_NOTE_LINK_PREFIX } from '@/constants/widgets'

const HEADING_PATTERN = /^#{1,6}\s+/
const MARKUP_PATTERN = /[*_`>#=[\]]/g

export const buildExtract = (text, limit = WIDGET_EXTRACT_LIMIT) => (
    (text || '')
        .split('\n')
        .filter((line) => line.trim() && !HEADING_PATTERN.test(line))
        .join(' ')
        .replace(MARKUP_PATTERN, '')
        .trim()
        .slice(0, limit)
)

export const buildPinnedNote = (notes, pinned, limit = WIDGET_EXTRACT_LIMIT) => {
    const note = notes
        .filter((entry) => pinned.has(entry.path))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0]

    if (!note) return null

    return {
        title: note.title || '',
        extract: buildExtract(note.note, limit),
        link: WIDGET_NOTE_LINK_PREFIX + encodeURIComponent(note.path)
    }
}
