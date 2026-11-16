export const MOCK_SEARCH_NOTES = [
    {
        path: 'note-1',
        title: 'Weekly standup',
        filename: 'Weekly standup.md',
        tags: ['work'],
        properties: { status: 'draft', duration: 4, aliases: [] },
        rawFrontmatter: 'status: draft\nduration: 4\ndue: 2026-03-01',
        note: '# Agenda\nAgenda for the week\n\n## Tasks\n- [ ] call Ana\n- [x] email Bob',
        createdAt: new Date('2026-01-01T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-05T10:00:00Z').getTime()
    },
    {
        path: 'note-2',
        title: 'Grocery list',
        filename: 'Grocery list.md',
        tags: ['personal', 'home/shopping'],
        properties: { status: 'done', duration: 10 },
        note: 'Milk, eggs\n![receipt](file:///receipt.jpg)\nSee ![[menu.pdf]]',
        createdAt: new Date('2026-01-02T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-02T10:00:00Z').getTime()
    },
    {
        path: 'note-3',
        title: 'Untagged idea',
        filename: 'Untagged idea.md',
        tags: [],
        properties: {},
        note: 'A random thought about HappyCat and a happy cat',
        createdAt: new Date('2026-01-03T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-03T10:00:00Z').getTime()
    }
]

export const MOCK_NOTE_PATHS = new Map([
    ['note-1', 'Work/Meetings'],
    ['note-2', 'Home'],
    ['note-3', '']
])
