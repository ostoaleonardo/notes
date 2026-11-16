const note = (path, title, body, tags = []) => ({
    path,
    title,
    filename: `${title}.md`,
    note: body,
    tags
})

export const MOCK_CONNECTION_NOTES = [
    note('r::Index.md', 'Index', 'See [[Alpha]] and [[Ghost]] ![[photo.png]]', ['work', 'ideas']),
    note('r::Alpha.md', 'Alpha', 'Back to [[Index]]', ['work']),
    note('p::Beta.md', 'Beta', 'Plain note'),
    note('d::Gamma.md', 'Gamma', 'Links [[Alpha]] and [[spec.pdf]]', ['ideas']),
    note('r::Lonely.md', 'Lonely', '')
]

export const MOCK_CONNECTION_NOTE_PATHS = new Map([
    ['r::Index.md', ''],
    ['r::Alpha.md', ''],
    ['p::Beta.md', 'Projects'],
    ['d::Gamma.md', 'Projects/Deep'],
    ['r::Lonely.md', '']
])

export const MOCK_CONNECTION_FILES = [
    { id: 'file:photo', filename: 'photo.png', folder: 'attachments' },
    { id: 'file:spec', filename: 'spec.pdf', folder: 'Projects' }
]
