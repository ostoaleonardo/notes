export const DATE_QUALIFIER_REGEX = /\b(modified|created):(\d{4}-\d{2}-\d{2})\b/i
export const TAG_QUALIFIER_REGEX = /\btag:"([^"]+)"|\btag:(\S+)/gi
export const PATH_QUALIFIER_REGEX = /\bpath:"([^"]+)"|\bpath:(\S+)/gi
export const FILE_QUALIFIER_REGEX = /\bfile:"([^"]+)"|\bfile:(\S+)/gi
export const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\([^)]+\)/
export const PINNED_QUALIFIER_REGEX = /\bis:pinned\b/i
export const IMAGE_QUALIFIER_REGEX = /\bhas:image\b/i
export const CONTENT_QUALIFIER_REGEX = /\bin:content\b/i

export const DATE_KEY_LENGTH = 10

export const PINNED_QUALIFIER = 'is:pinned'
export const IMAGE_QUALIFIER = 'has:image'
export const CONTENT_QUALIFIER = 'in:content'
