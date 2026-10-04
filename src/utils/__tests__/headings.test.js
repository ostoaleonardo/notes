import {
    buildOutline,
    extractSection,
    findHeadingRenames,
    findHeadings,
    getVisibleOutline,
    normalizeHeading,
    renameHeadingLinks
} from '../headings'

const target = { path: 'target', title: 'Plan' }
const notes = [target]

describe('find headings', () => {
    test('returns level, text and offset of each heading', () => {
        const text = '# Title\n\nbody\n## Second ##\n'

        expect(findHeadings(text)).toEqual([
            { level: 1, text: 'Title', from: 0 },
            { level: 2, text: 'Second', from: 14 }
        ])
    })

    test('skips headings inside code blocks', () => {
        const text = '# Real\n```\n# Fake\n```\n'

        expect(findHeadings(text).map((heading) => heading.text)).toEqual(['Real'])
    })

    test('ignores hashes without a following space', () => {
        expect(findHeadings('#tag\n####### seven')).toEqual([])
    })
})

describe('normalize heading', () => {
    test('ignores case and extra whitespace', () => {
        expect(normalizeHeading('  Mi   Sección ')).toBe(normalizeHeading('mi sección'))
    })
})

describe('find heading renames', () => {
    test('pairs headings by position when the structure is unchanged', () => {
        const renames = findHeadingRenames('# A\n## Old\n', '# A\n## New\n')

        expect(renames).toEqual([{ from: 'Old', to: 'New' }])
    })

    test('returns nothing when a heading was added or removed', () => {
        expect(findHeadingRenames('# A\n', '# A\n## B\n')).toEqual([])
    })

    test('returns nothing when only the level changed', () => {
        expect(findHeadingRenames('# A\n', '## A\n')).toEqual([])
    })
})

describe('rename heading links', () => {
    const renames = [{ from: 'Old', to: 'New' }]

    test('rewrites links to the renamed heading of the target note', () => {
        const result = renameHeadingLinks('See [[Plan#Old]] now', 'target', renames, notes)

        expect(result).toBe('See [[Plan#New]] now')
    })

    test('keeps the alias', () => {
        const result = renameHeadingLinks('[[Plan#old|the old one]]', 'target', renames, notes)

        expect(result).toBe('[[Plan#New|the old one]]')
    })

    test('leaves links to other headings, blocks and notes untouched', () => {
        const content = '[[Plan#Other]] [[Plan#^old]] [[Elsewhere#Old]] [[Plan]]'

        expect(renameHeadingLinks(content, 'target', renames, notes)).toBe(content)
    })

    test('leaves links inside code untouched', () => {
        const content = '`[[Plan#Old]]`'

        expect(renameHeadingLinks(content, 'target', renames, notes)).toBe(content)
    })

    test('renames links to a heading of the same note', () => {
        const result = renameHeadingLinks('[[#Old]] and ![[#old|alias]]', 'target', renames, notes)

        expect(result).toBe('[[#New]] and ![[#New|alias]]')
    })

    test('leaves same-note links to other headings and blocks untouched', () => {
        const content = '[[#Other]] [[#^old]]'

        expect(renameHeadingLinks(content, 'target', renames, notes)).toBe(content)
    })
})

describe('build outline', () => {
    const outline = buildOutline(findHeadings('# A\n## B\n### C\n## D\n# E'))

    test('derives depth from nesting', () => {
        expect(outline.map((item) => item.depth)).toEqual([0, 1, 2, 1, 0])
    })

    test('flags headings that contain others', () => {
        expect(outline.map((item) => item.hasChildren)).toEqual([true, true, false, false, false])
    })

    test('does not leave gaps when levels are skipped', () => {
        const skipped = buildOutline(findHeadings('## A\n#### B'))

        expect(skipped.map((item) => item.depth)).toEqual([0, 1])
    })
})

describe('get visible outline', () => {
    const outline = buildOutline(findHeadings('# A\n## B\n### C\n## D\n# E'))

    test('returns everything when nothing is collapsed', () => {
        expect(getVisibleOutline(outline, new Set())).toHaveLength(5)
    })

    test('hides the whole subtree of a collapsed heading', () => {
        const visible = getVisibleOutline(outline, new Set([0]))

        expect(visible.map((item) => item.text)).toEqual(['A', 'E'])
    })

    test('hides only the descendants of a nested collapsed heading', () => {
        const visible = getVisibleOutline(outline, new Set([1]))

        expect(visible.map((item) => item.text)).toEqual(['A', 'B', 'D', 'E'])
    })
})

describe('extract section', () => {
    const text = '# One\n\na\n\n## Sub\n\nb\n\n# Two\n\nc'

    test('returns the heading through the next heading of the same level', () => {
        expect(extractSection(text, 'One')).toBe('# One\n\na\n\n## Sub\n\nb')
    })

    test('returns the last section through the end of the text', () => {
        expect(extractSection(text, 'Two')).toBe('# Two\n\nc')
    })

    test('returns null when the heading does not exist', () => {
        expect(extractSection(text, 'Three')).toBeNull()
    })

    test('ignores headings inside code blocks', () => {
        expect(extractSection('```\n# One\n```', 'One')).toBeNull()
    })
})
