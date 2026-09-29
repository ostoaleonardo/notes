export const MOCK_SEARCH_NOTES = [
    {
        path: 'note-1',
        title: 'Weekly standup',
        tags: ['work'],
        note: 'Agenda for the week',
        createdAt: new Date('2026-01-01T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-05T10:00:00Z').getTime()
    },
    {
        path: 'note-2',
        title: 'Grocery list',
        tags: ['personal'],
        note: 'Milk, eggs\n![receipt](file:///receipt.jpg)',
        createdAt: new Date('2026-01-02T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-02T10:00:00Z').getTime()
    },
    {
        path: 'note-3',
        title: 'Untagged idea',
        tags: [],
        note: 'A random thought',
        createdAt: new Date('2026-01-03T10:00:00Z').getTime(),
        updatedAt: new Date('2026-01-03T10:00:00Z').getTime()
    }
]
