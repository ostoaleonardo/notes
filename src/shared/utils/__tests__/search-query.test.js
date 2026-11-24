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
import { getChipLabelKey, getChipText } from '@/features/search/utils/search-chip-label'
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

    test('exposes the operator group and the shown value of each chip', () => {
        const chips = getQueryChips(parseSearchQuery('tag:#Work path:"my docs" [status:draft] task-done: line:(a b)'))
        expect(chips.map((chip) => [chip.group, chip.value])).toEqual([
            ['tag', 'work'],
            ['path', 'my docs'],
            ['property', 'status:draft'],
            ['task-done', null],
            ['line', 'a b']
        ])
    })

    test('uses a translation key for the filters without a typed value', () => {
        const chips = getQueryChips(parseSearchQuery('has:images tag:work'))
        const t = (key) => `t:${key}`
        expect(getChipLabelKey(chips[0])).toBe('search.filters.images')
        expect(getChipText(chips[0], t)).toBe('t:search.filters.images')
        expect(getChipText(chips[1], t)).toBe('work')
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
