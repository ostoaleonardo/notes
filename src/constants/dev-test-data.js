import { MIME_TYPES } from '@/constants/mime-types'
import { SYNTAX_IMAGE_BASE64, SYNTAX_IMAGE_FILENAME } from '@/constants/syntax-note'

const lines = (...rows) => rows.join('\n')

const PLACEHOLDER_BYTES_BASE64 = 'AAAAAAAAAAAAAAAA'

const MINIMAL_PDF = lines(
    '%PDF-1.1',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj',
    'trailer<</Root 1 0 R>>',
    '%%EOF'
)

export const DEV_TEST_PINNED_TITLES = ['Test index', 'Linked A']

export const DEV_TEST_NOTES = [
    {
        folder: [],
        title: 'Test index',
        tags: ['test', 'test/index'],
        properties: { status: 'index', priority: 1 },
        body: lines(
            '# Test index',
            '',
            'Entry point of the generated test data. Every feature of the app has something to try here.',
            '',
            '## Links',
            '',
            '- Resolved links: [[Linked A]], [[Linked B]], [[Disambiguation]]',
            '- Unresolved links: [[Unresolved links]]',
            '- Attachments: [[Attachments]]',
            '- Tags: [[Tags playground]]',
            '- Search: [[Search operators]]',
            '- Tasks: [[Tasks]]',
            '- Outline: [[Long outline]]',
            ''
        )
    },
    {
        folder: [],
        title: 'Linked A',
        tags: ['test/links'],
        body: lines('# Linked A', '', 'Mutual link with [[Linked B]]. Back to [[Test index]].', '')
    },
    {
        folder: [],
        title: 'Linked B',
        tags: ['test/links'],
        body: lines('# Linked B', '', 'Mutual link with [[Linked A]].', '')
    },
    {
        folder: [],
        title: 'Orphan A',
        tags: [],
        body: lines('# Orphan A', '', 'Nobody links here and this note links nowhere.', '')
    },
    {
        folder: ['Folder 1'],
        title: 'Orphan B',
        tags: [],
        body: lines('# Orphan B', '', 'Orphan note inside a folder.', '')
    },
    {
        folder: ['Folder 1', 'Subfolder 1.1'],
        title: 'Orphan deep',
        tags: [],
        body: lines('# Orphan deep', '', 'Orphan note inside a subfolder.', '')
    },
    {
        folder: [],
        title: 'Unresolved links',
        tags: ['test/links'],
        body: lines(
            '# Unresolved links',
            '',
            'These targets do not exist: [[Ghost note]], [[Missing idea]] and [[Folder 1/Ghost folder note]].',
            ''
        )
    },
    {
        folder: ['Folder 2'],
        title: 'Unresolved again',
        tags: ['test/links'],
        body: lines('# Unresolved again', '', 'Same missing target from another note: [[Ghost note]].', '')
    },
    {
        folder: [],
        title: 'Mention target',
        tags: ['test/links'],
        body: lines('# Mention target', '', 'Other notes mention this title without linking it.', '')
    },
    {
        folder: ['Folder 2'],
        title: 'Mentions',
        tags: ['test/links'],
        body: lines('# Mentions', '', 'Yesterday I read about Mention target and wrote nothing down.', '')
    },
    {
        folder: [],
        title: 'Duplicate title',
        tags: ['test/duplicates'],
        body: lines('# Duplicate title', '', 'Root copy. The same title exists in Folder 1.', '')
    },
    {
        folder: ['Folder 1'],
        title: 'Duplicate title',
        tags: ['test/duplicates'],
        body: lines('# Duplicate title', '', 'Folder 1 copy.', '')
    },
    {
        folder: [],
        title: 'Disambiguation',
        tags: ['test/duplicates'],
        body: lines(
            '# Disambiguation',
            '',
            'Root note: [[Duplicate title]]',
            '',
            'Folder note: [[Folder 1/Duplicate title]]',
            ''
        )
    },
    {
        folder: [],
        title: 'Tags playground',
        tags: ['project/alpha', 'project/beta', 'personal', 'work/meeting', 'todo'],
        body: lines(
            '# Tags playground',
            '',
            'Frontmatter tags plus inline tags: #inline/tag #todo #ideas/dev',
            ''
        )
    },
    {
        folder: ['Folder 3'],
        title: 'Tags in folder',
        tags: ['project/alpha', 'work/review'],
        body: lines('# Tags in folder', '', 'Shares #project/alpha with other notes.', '')
    },
    {
        folder: [],
        title: 'Tasks',
        tags: ['test/tasks'],
        body: lines(
            '# Tasks',
            '',
            '- [ ] Pending task',
            '- [x] Done task',
            '- [/] In progress',
            '- [-] Cancelled',
            '- [>] Deferred',
            '    - [ ] Nested pending',
            ''
        )
    },
    {
        folder: [],
        title: 'Search operators',
        tags: ['test/search'],
        properties: { status: 'draft', priority: 2, due: '2026-03-01', done: false, rating: 4 },
        body: lines(
            '# Search operators',
            '',
            'Keyword for content search: findme-keyword.',
            '',
            'Try `tag:test/search`, `path:Folder 1`, `[status:draft]`, `task:` and `has:image`.',
            '',
            '![[dev-image.png]]',
            ''
        )
    },
    {
        folder: [],
        title: 'Attachments',
        tags: ['test/files'],
        body: lines(
            '# Attachments',
            '',
            '![[dev-image.png]]',
            '',
            '![[dev-image-2.png|120]]',
            '',
            '[[sample.pdf]] [[sample.txt]] [[sample.mp3]] [[sample.mp4]]',
            ''
        )
    },
    {
        folder: [],
        title: 'Alias target',
        tags: ['test/links'],
        properties: { aliases: ['Alias dev'] },
        body: lines('# Alias target', '', 'This note can be linked through its alias.', '')
    },
    {
        folder: ['Folder 3'],
        title: 'Alias link',
        tags: ['test/links'],
        body: lines('# Alias link', '', 'Linked through the alias: [[Alias dev]].', '')
    },
    {
        folder: [],
        title: 'Long outline',
        tags: ['test/outline'],
        body: lines(
            '# Long outline',
            '',
            '## Section one',
            '',
            'Text of the first section with a few words to count.',
            '',
            '### Subsection 1.1',
            '',
            'More text. More text. More text.',
            '',
            '#### Detail 1.1.1',
            '',
            'Deep content.',
            '',
            '## Section two',
            '',
            'Text of the second section.',
            '',
            '### Subsection 2.1',
            '',
            'Closing text.',
            ''
        )
    }
]

export const DEV_TEST_TEMPLATES = [
    {
        folder: [],
        filename: 'Dev placeholders.md',
        content: lines('# {{title}}', '', 'Date: {{date}}', 'Time: {{time}}', '', '## Notes', '')
    },
    {
        folder: ['Dev folder'],
        filename: 'Dev nested template.md',
        content: lines('# {{title}}', '', '- [ ] First item', '- [ ] Second item', '')
    }
]

export const DEV_TEST_FILES = [
    { filename: SYNTAX_IMAGE_FILENAME, mimeType: MIME_TYPES.PNG, base64: SYNTAX_IMAGE_BASE64 },
    { filename: 'dev-image.png', mimeType: MIME_TYPES.PNG, base64: SYNTAX_IMAGE_BASE64 },
    { filename: 'dev-image-2.png', mimeType: MIME_TYPES.PNG, base64: SYNTAX_IMAGE_BASE64 },
    { filename: 'sample.txt', mimeType: MIME_TYPES.TEXT, text: 'Plain text attachment.' },
    { filename: 'sample.pdf', mimeType: MIME_TYPES.PDF, text: MINIMAL_PDF },
    { filename: 'sample.mp3', mimeType: MIME_TYPES.MP3, base64: PLACEHOLDER_BYTES_BASE64 },
    { filename: 'sample.mp4', mimeType: MIME_TYPES.MP4, base64: PLACEHOLDER_BYTES_BASE64 }
]
