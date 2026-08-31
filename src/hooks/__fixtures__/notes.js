export const MOCK_GROCERIES_DRAFT = {
    id: 'note-1',
    title: 'Groceries',
    note: 'milk, eggs',
    tags: [],
    createdAt: 1
}

export const MOCK_DUPLICATE_TITLE_DRAFT = {
    id: 'note-2',
    title: 'Groceries',
    note: 'new content',
    tags: [],
    createdAt: 2
}

export const MOCK_GROCERIES_NOTE = {
    id: 'note-1',
    title: 'Groceries',
    note: 'old content',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_OLD_TITLE_NOTE = {
    id: 'note-1',
    title: 'Old title',
    note: 'content',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_GHOST_NOTE = {
    id: 'ghost',
    title: 'Ghost',
    note: 'x',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_MINIMAL_NOTE = { id: 'note-1', title: 'Groceries' }

export const MOCK_GROCERIES_METADATA = {
    'note-1': { filename: 'Groceries.md', tags: [], createdAt: 1, updatedAt: '' }
}

export const MOCK_OLD_TITLE_METADATA = {
    'note-1': { filename: 'Old title.md', tags: [], createdAt: 1, updatedAt: '' }
}
