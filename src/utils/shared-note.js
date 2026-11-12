import { SHARED_NOTE_SEPARATOR, TRAILING_SPACE_PATTERN } from '@/constants/shared-note'

export const buildSharedContent = (shareIntent) => {
    const text = shareIntent?.text?.trim()
    if (!text) return ''

    const url = shareIntent.webUrl
    if (url && text === url) return `[${shareIntent.meta?.title || url}](${url})`

    return text
}

export const appendSharedContent = (note, content) => {
    const base = (note || '').replace(TRAILING_SPACE_PATTERN, '')

    return base ? `${base}${SHARED_NOTE_SEPARATOR}${content}` : content
}
