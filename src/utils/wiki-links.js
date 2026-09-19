import { WIKI_LINK_SCHEME } from '@/constants/wiki-links'

const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const resolveWikiLinks = (value, notes) => value.replace(
    WIKI_LINK_PATTERN,
    (match, title, alias) => {
        const trimmedTitle = title.trim()
        const label = escapeHtml((alias || trimmedTitle).trim())

        const target = notes.find((note) => (
            note.title?.trim().toLowerCase() === trimmedTitle.toLowerCase()
        ))

        if (!target) return `<span class="wiki-link-broken">${label}</span>`

        return `<a href="${WIKI_LINK_SCHEME}${target.id}" class="wiki-link">${label}</a>`
    }
)
