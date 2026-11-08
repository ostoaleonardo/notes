import { parseSearchQuery } from '../search-parser'
import {
    getActiveTags,
    getQueryChips,
    groupChips,
    hasQualifier,
    removeChip,
    toggleChipNegation,
    toggleFilesQualifier,
    toggleImagesQualifier,
    togglePinnedQualifier,
    toggleTagQualifier
} from '../search-query'
import { filterNotes, searchNotes } from '../search-filter'
import { MOCK_NOTE_PATHS, MOCK_SEARCH_NOTES } from '../__fixtures__/search-query'

import { NOTE_SORTS } from '@/constants/note-sort'

const run = (query, extra = {}) => filterNotes(
    MOCK_SEARCH_NOTES,
    parseSearchQuery(query),
    { pinned: new Set(), notePaths: MOCK_NOTE_PATHS, ...extra }
).map((note) => note.path)

describe('parse search query', () => {
    test('reads plain words as an implicit and', () => {
        const ast = parseSearchQuery('meeting work')
        expect(ast.children.map((node) => node.value)).toEqual(['meeting', 'work'])
    })

    test('reads an empty query as no children', () => {
        expect(parseSearchQuery('   ').children).toEqual([])
    })

    test('reads a quoted phrase with escaped quotes', () => {
        const [node] = parseSearchQuery('"they said \\"hi\\" to us"').children
        expect(node.value).toBe('they said "hi" to us')
    })

    test('reads or branches', () => {
        const [node] = parseSearchQuery('meeting OR work').children
        expect(node.type).toBe('or')
        expect(node.children).toHaveLength(2)
    })

    test('reads parentheses as a group', () => {
        const [group] = parseSearchQuery('(work OR meetup) personal').children
        expect(group.type).toBe('or')
    })

    test('reads a negated group', () => {
        const [node] = parseSearchQuery('-(work meetup)').children
        expect(node.type).toBe('not')
        expect(node.child.type).toBe('and')
    })

    test('treats a lone dash as text', () => {
        const [node] = parseSearchQuery('-').children
        expect(node.value).toBe('-')
    })

    test('reads operators with a bare, quoted or grouped argument', () => {
        const nodes = parseSearchQuery('file:a path:"x y" line:(a b)').children
        expect(nodes.map((node) => node.name)).toEqual(['file', 'path', 'line'])
        expect(nodes[1].argument.value).toBe('x y')
        expect(nodes[2].argument.type).toBe('and')
    })

    test('treats an unknown operator or an invalid value as text', () => {
        const nodes = parseSearchQuery('http://x has:video is:foo').children
        expect(nodes.map((node) => node.type)).toEqual(['text', 'text', 'text'])
    })

    test('reads a regex only when it is delimited by slashes', () => {
        const nodes = parseSearchQuery('/gu[il]de/ /a/b').children
        expect(nodes[0].type).toBe('regex')
        expect(nodes[1].type).toBe('text')
    })

    test('reads a regex as an operator argument', () => {
        const [node] = parseSearchQuery('path:/\\d{4}/').children
        expect(node.argument.type).toBe('regex')
    })

    test('reads properties with and without a value', () => {
        const [exists, equals] = parseSearchQuery('[status] [status:Draft OR Published]').children
        expect(exists.expression).toBeNull()
        expect(equals.expression.children[0].type).toBe('or')
    })

    test('reads property comparisons and null', () => {
        const [lower, empty] = parseSearchQuery('[duration:<5] [aliases:null]').children
        expect(lower.expression.children[0]).toMatchObject({ type: 'compare', operator: '<', value: '5' })
        expect(empty.expression.children[0].type).toBe('null')
    })

    test('ignores a stray closing parenthesis', () => {
        expect(parseSearchQuery('a) b').children).toHaveLength(2)
    })

    test('keeps source positions for filters', () => {
        const [, filter] = parseSearchQuery('hello tag:work').children
        expect([filter.start, filter.end, filter.raw]).toEqual([6, 14, 'tag:work'])
    })
})

describe('search notes by text', () => {
    test('matches the note content by default', () => {
        expect(run('agenda')).toEqual(['note-1'])
    })

    test('matches the title and file name', () => {
        expect(run('grocery')).toEqual(['note-2'])
    })

    test('matches the folder path', () => {
        expect(run('meetings')).toEqual(['note-1'])
    })

    test('requires every word in the same note, in any place', () => {
        expect(run('milk receipt')).toEqual(['note-2'])
        expect(run('milk agenda')).toEqual([])
    })

    test('matches an exact phrase only', () => {
        expect(run('"milk, eggs"')).toEqual(['note-2'])
        expect(run('"eggs milk"')).toEqual([])
    })

    test('matches either side of or', () => {
        expect(run('agenda OR milk')).toEqual(['note-1', 'note-2'])
    })

    test('honors parentheses precedence', () => {
        expect(run('(agenda OR milk) week')).toEqual(['note-1'])
    })

    test('excludes words and groups', () => {
        expect(run('-agenda')).toEqual(['note-2', 'note-3'])
        expect(run('-(milk receipt)')).toEqual(['note-1', 'note-3'])
        expect(run('-(milk agenda)')).toEqual(['note-1', 'note-2', 'note-3'])
    })

    test('matches regular expressions', () => {
        expect(run('/gro[cs]ery/')).toEqual(['note-2'])
    })

    test('is case insensitive unless match case is on', () => {
        expect(run('happycat')).toEqual(['note-3'])
        expect(run('HappyCat', { matchCase: true })).toEqual(['note-3'])
        expect(run('happycat', { matchCase: true })).toEqual([])
    })

    test('match-case and ignore-case override the global option', () => {
        expect(run('match-case:HappyCat')).toEqual(['note-3'])
        expect(run('match-case:happycat')).toEqual([])
        expect(run('ignore-case:HAPPYCAT', { matchCase: true })).toEqual(['note-3'])
    })
})

describe('search notes with operators', () => {
    test('file matches only the file name', () => {
        expect(run('file:standup')).toEqual(['note-1'])
        expect(run('file:agenda')).toEqual([])
    })

    test('path matches the folder and name', () => {
        expect(run('path:work/meetings')).toEqual(['note-1'])
        expect(run('path:"home/grocery"')).toEqual(['note-2'])
    })

    test('content ignores the title and path', () => {
        expect(run('content:grocery')).toEqual([])
        expect(run('content:milk')).toEqual(['note-2'])
    })

    test('tag matches the tag and its nested tags', () => {
        expect(run('tag:work')).toEqual(['note-1'])
        expect(run('tag:#home')).toEqual(['note-2'])
        expect(run('tag:home/shopping')).toEqual(['note-2'])
        expect(run('-tag:work')).toEqual(['note-2', 'note-3'])
    })

    test('line requires every term in one line', () => {
        expect(run('line:(milk eggs)')).toEqual(['note-2'])
        expect(run('line:(milk receipt)')).toEqual([])
        expect(run('-line:(milk eggs)')).toEqual(['note-1', 'note-3'])
    })

    test('block requires every term in one block', () => {
        expect(run('block:(agenda week)')).toEqual(['note-1'])
        expect(run('block:(agenda call)')).toEqual([])
    })

    test('section requires every term in one section', () => {
        expect(run('section:(call bob)')).toEqual(['note-1'])
        expect(run('section:(agenda bob)')).toEqual([])
    })

    test('task variants match task lines by status', () => {
        expect(run('task:call')).toEqual(['note-1'])
        expect(run('task-todo:call')).toEqual(['note-1'])
        expect(run('task-done:call')).toEqual([])
        expect(run('task-done:(call OR bob)')).toEqual(['note-1'])
        expect(run('task:')).toEqual(['note-1'])
    })

    test('has images and has files detect attachments', () => {
        expect(run('has:images')).toEqual(['note-2'])
        expect(run('has:files')).toEqual(['note-2'])
        expect(run('-has:images')).toEqual(['note-1', 'note-3'])
    })

    test('is pinned uses the pinned set', () => {
        expect(run('is:pinned', { pinned: new Set(['note-3']) })).toEqual(['note-3'])
    })
})

describe('search notes by property', () => {
    test('matches a property that exists', () => {
        expect(run('[status]')).toEqual(['note-1', 'note-2'])
    })

    test('matches a value, an or and a regex', () => {
        expect(run('[status:draft]')).toEqual(['note-1'])
        expect(run('[status:draft OR done]')).toEqual(['note-1', 'note-2'])
        expect(run('[status:/^dr/]')).toEqual(['note-1'])
    })

    test('matches an empty property with null', () => {
        expect(run('[aliases:null]')).toEqual(['note-1'])
        expect(run('[status:null]')).toEqual([])
    })

    test('compares numbers', () => {
        expect(run('[duration:<5]')).toEqual(['note-1'])
        expect(run('[duration:>=10]')).toEqual(['note-2'])
    })

    test('negates a property', () => {
        expect(run('-[status:draft]')).toEqual(['note-2', 'note-3'])
    })
})

describe('sort search results', () => {
    test('sorts by name ascending by default', () => {
        const ast = parseSearchQuery('-zzz')
        const result = searchNotes(MOCK_SEARCH_NOTES, ast, { pinned: new Set() })
        expect(result.map((note) => note.path)).toEqual(['note-2', 'note-3', 'note-1'])
    })

    test('sorts by the chosen option', () => {
        const ast = parseSearchQuery('-zzz')
        const result = searchNotes(MOCK_SEARCH_NOTES, ast, { pinned: new Set() }, NOTE_SORTS.MODIFIED_DESC)
        expect(result.map((note) => note.path)).toEqual(['note-1', 'note-3', 'note-2'])
    })
})

describe('edit the query from filters', () => {
    test('toggles a tag qualifier on and off', () => {
        expect(toggleTagQualifier('', 'work')).toBe('tag:work')
        expect(toggleTagQualifier('tag:work', 'work')).toBe('')
        expect(toggleTagQualifier('hello tag:work', 'work')).toBe('hello')
        expect(toggleTagQualifier('tag:#Work hi', 'work')).toBe('hi')
    })

    test('quotes tags with spaces', () => {
        expect(toggleTagQualifier('hi', 'my tag')).toBe('hi tag:"my tag"')
    })

    test('toggles the pinned, images and files qualifiers', () => {
        expect(togglePinnedQualifier('hi')).toBe('hi is:pinned')
        expect(togglePinnedQualifier('hi is:pinned')).toBe('hi')
        expect(toggleImagesQualifier('')).toBe('has:images')
        expect(toggleFilesQualifier('has:files x')).toBe('x')
    })

    test('reads active tags and qualifiers', () => {
        const ast = parseSearchQuery('tag:work tag:#home has:images')
        expect(getActiveTags(ast)).toEqual(['work', 'home'])
        expect(hasQualifier(ast, 'has', 'images')).toBe(true)
        expect(hasQualifier(ast, 'has', 'files')).toBe(false)
    })
})

describe('filter chips', () => {
    test('lists filters and negated filters, not plain text', () => {
        const chips = getQueryChips(parseSearchQuery('hello tag:work -path:old [status:draft]'))
        expect(chips.map((chip) => [chip.label, chip.negate])).toEqual([
            ['tag:work', false],
            ['path:old', true],
            ['[status:draft]', false]
        ])
    })

    test('groups chips of the same filter in one row', () => {
        const query = 'has:images task-done: tag:one has:files [a:1] tag:two [b:2]'
        const groups = groupChips(getQueryChips(parseSearchQuery(query)))

        expect(groups.map((group) => group.map((chip) => chip.label))).toEqual([
            ['has:images', 'has:files'],
            ['task-done:'],
            ['tag:one', 'tag:two'],
            ['[a:1]', '[b:2]']
        ])
    })

    test('groups a negated chip with its filter', () => {
        const groups = groupChips(getQueryChips(parseSearchQuery('tag:one -tag:two')))
        expect(groups).toHaveLength(1)
        expect(groups[0].map((chip) => chip.negate)).toEqual([false, true])
    })

    test('removes a chip from the query', () => {
        const query = 'hello tag:work world'
        const [chip] = getQueryChips(parseSearchQuery(query))
        expect(removeChip(query, chip)).toBe('hello world')
    })

    test('switches a chip between include and exclude', () => {
        const query = 'hello tag:work'
        const [chip] = getQueryChips(parseSearchQuery(query))
        const negated = toggleChipNegation(query, chip)
        expect(negated).toBe('hello -tag:work')

        const [again] = getQueryChips(parseSearchQuery(negated))
        expect(toggleChipNegation(negated, again)).toBe('hello tag:work')
    })
})
