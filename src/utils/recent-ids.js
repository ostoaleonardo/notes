import { TEMPLATE_TAB_PREFIX } from '@/constants'

export const getRecentIds = (pinned, recent, notes, templates) => {
    const ids = [...pinned, ...recent.filter((id) => !pinned.has(id))]

    return ids.filter((id) => {
        if (id.startsWith(TEMPLATE_TAB_PREFIX)) {
            const filename = id.slice(TEMPLATE_TAB_PREFIX.length)
            return templates.some((entry) => entry.filename === filename)
        }

        return notes.some((entry) => entry.id === id)
    })
}
