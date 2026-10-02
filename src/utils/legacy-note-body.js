import { LEGACY_LIST_TYPES, LEGACY_CHECKED_STATUS } from '@/constants/legacy-list'

const LIST_LINE_BUILDERS = {
    [LEGACY_LIST_TYPES.BULLETED]: (item) => `- ${item.value}`,
    [LEGACY_LIST_TYPES.NUMBERED]: (item, index) => `${index + 1}. ${item.value}`,
    [LEGACY_LIST_TYPES.CHECKLIST]: (item) => (
        `- [${item.status === LEGACY_CHECKED_STATUS ? 'x' : ' '}] ${item.value}`
    )
}

const buildListMarkdown = (list) => {
    const items = (list?.items || []).filter((item) => item.value?.trim())
    const buildLine = LIST_LINE_BUILDERS[list?.type] || LIST_LINE_BUILDERS[LEGACY_LIST_TYPES.BULLETED]

    return items.map(buildLine).join('\n')
}

export const buildLegacyNoteBody = (note, imageUris = []) => [
    note.note,
    buildListMarkdown(note.list),
    imageUris.map((uri) => `![](${uri})`).join('\n')
].filter(Boolean).join('\n\n')
