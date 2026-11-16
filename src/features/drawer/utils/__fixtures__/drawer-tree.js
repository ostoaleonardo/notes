export const MOCK_REPOSITORY_LIST = [
    { id: 'root', parentId: null },
    { id: 'child-b', parentId: 'root' },
    { id: 'child-a', parentId: 'root' },
    { id: 'grandchild', parentId: 'child-a' }
]

export const MOCK_NOTES_BY_REPOSITORY = new Map([
    ['root', [{ path: 'note-zebra', title: 'Zebra' }, { path: 'note-apple', title: 'Apple' }]],
    ['grandchild', [{ path: 'note-nested', title: 'Nested note' }]]
])
