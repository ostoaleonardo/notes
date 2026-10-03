export const TAG_PATH_SEPARATOR = '/'
export const TAG_WORD_JOINER = '-'
export const TAG_LINK_SCHEME = 'tag://'
export const TAG_PROPERTY_KEYS = ['tags', 'tag']
export const TAG_SORTS = {
    NAME_ASC: 'name-asc',
    NAME_DESC: 'name-desc',
    COUNT_DESC: 'count-desc',
    COUNT_ASC: 'count-asc'
}
export const DEFAULT_TAG_SORT = TAG_SORTS.NAME_ASC
export const TAG_SORT_LABELS = {
    [TAG_SORTS.NAME_ASC]: 'drawer.sort_name_asc',
    [TAG_SORTS.NAME_DESC]: 'drawer.sort_name_desc',
    [TAG_SORTS.COUNT_DESC]: 'drawer.sort_count_desc',
    [TAG_SORTS.COUNT_ASC]: 'drawer.sort_count_asc'
}
export const INLINE_TAG_CLASS = 'cm-inline-tag'
