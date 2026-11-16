export const MOCK_GROCERIES_DRAFT = {
    title: 'Groceries',
    note: 'milk, eggs',
    tags: [],
    createdAt: 1
}

export const MOCK_DUPLICATE_TITLE_DRAFT = {
    title: 'Groceries',
    note: 'new content',
    tags: [],
    createdAt: 2
}

export const MOCK_GROCERIES_NOTE = {
    path: 'repo-1::Groceries.md',
    filename: 'Groceries.md',
    title: 'Groceries',
    note: 'old content',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_OLD_TITLE_NOTE = {
    path: 'repo-1::Old title.md',
    filename: 'Old title.md',
    title: 'Old title',
    note: 'content',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_GHOST_NOTE = {
    path: 'repo-1::Ghost.md',
    filename: 'Ghost.md',
    title: 'Ghost',
    note: 'x',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_ORPHANED_NOTE = {
    path: 'missing-repo::Orphaned.md',
    filename: 'Orphaned.md',
    title: 'Orphaned',
    note: 'x',
    tags: [],
    repositoryId: 'missing-repo',
    createdAt: 1
}

export const MOCK_UNSAVED_NOTE = {
    title: 'Untitled',
    note: 'quick note content',
    tags: [],
    repositoryId: 'repo-1',
    createdAt: 1
}

export const MOCK_MINIMAL_NOTE = { path: 'repo-1::Groceries.md', title: 'Groceries' }
