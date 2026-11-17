import { bodyOf } from '@/shared/utils/note-body-of'

import { WIDGET_EXTRACT_LIMIT, WIDGET_NOTE_LINK_PREFIX } from '@/shared/constants/widgets'

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

export const findPinnedNote = (notes, pinned) => (
    notes
        .filter((entry) => pinned.has(entry.path))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0]
)

export const buildPinnedNote = (notes, pinned, limit = WIDGET_EXTRACT_LIMIT, bodies) => {
    const note = findPinnedNote(notes, pinned)

    if (!note) return null

    return {
        title: note.title || '',
        extract: buildExtract(bodyOf(note, bodies), limit),
        link: WIDGET_NOTE_LINK_PREFIX + encodeURIComponent(note.path)
    }
}
