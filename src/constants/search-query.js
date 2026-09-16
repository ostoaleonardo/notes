export const DATE_QUALIFIER_REGEX = /\b(modified|created):(\d{4}-\d{2}-\d{2})\b/i
export const TAG_QUALIFIER_REGEX = /\btag:"([^"]+)"|\btag:(\S+)/gi
export const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\([^)]+\)/
export const PINNED_QUALIFIER_REGEX = /\bis:pinned\b/i
export const IMAGE_QUALIFIER_REGEX = /\bhas:image\b/i

export const PINNED_QUALIFIER = 'is:pinned'
export const IMAGE_QUALIFIER = 'has:image'
