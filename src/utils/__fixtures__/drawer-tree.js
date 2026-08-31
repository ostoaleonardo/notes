export const MOCK_REPOSITORY_LIST = [
    { id: 'root', parentId: null },
    { id: 'child-b', parentId: 'root' },
    { id: 'child-a', parentId: 'root' },
    { id: 'grandchild', parentId: 'child-a' }
]

export const MOCK_NOTES_BY_REPOSITORY = new Map([
    ['root', [{ title: 'Zebra' }, { title: 'Apple' }]],
    ['grandchild', [{ title: 'Nested note' }]]
])
