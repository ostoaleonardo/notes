export const NOTE_SORTS = {
    NAME_ASC: 'name-asc',
    NAME_DESC: 'name-desc',
    MODIFIED_DESC: 'modified-desc',
    MODIFIED_ASC: 'modified-asc',
    CREATED_DESC: 'created-desc',
    CREATED_ASC: 'created-asc'
}
export const DEFAULT_NOTE_SORT = NOTE_SORTS.NAME_ASC
export const NOTE_SORT_LABELS = {
    [NOTE_SORTS.NAME_ASC]: 'drawer.sort_name_asc',
    [NOTE_SORTS.NAME_DESC]: 'drawer.sort_name_desc',
    [NOTE_SORTS.MODIFIED_DESC]: 'drawer.sort_modified_desc',
    [NOTE_SORTS.MODIFIED_ASC]: 'drawer.sort_modified_asc',
    [NOTE_SORTS.CREATED_DESC]: 'drawer.sort_created_desc',
    [NOTE_SORTS.CREATED_ASC]: 'drawer.sort_created_asc'
}
