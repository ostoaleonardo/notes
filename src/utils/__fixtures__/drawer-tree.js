export const MOCK_REPOSITORY_LIST = [
    { id: 'root', parentId: null },
    { id: 'child-b', parentId: 'root' },
    { id: 'child-a', parentId: 'root' },
    { id: 'grandchild', parentId: 'child-a' }
]

export const MOCK_NOTES_BY_REPOSITORY = new Map([
    ['root', [{ id: 'note-zebra', title: 'Zebra' }, { id: 'note-apple', title: 'Apple' }]],
    ['grandchild', [{ id: 'note-nested', title: 'Nested note' }]]
])
