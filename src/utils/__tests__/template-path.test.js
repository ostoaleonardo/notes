import {
    flattenTemplateTree,
    getTemplateName,
    joinTemplatePath,
    splitTemplatePath
} from '../template-path'

describe('template path', () => {
    test('joins a folder and a name', () => {
        expect(joinTemplatePath('a/b', 'x.md')).toBe('a/b/x.md')
        expect(joinTemplatePath('', 'x.md')).toBe('x.md')
    })

    test('splits a path into folder and file name', () => {
        expect(splitTemplatePath('a/b/x.md')).toEqual({ dir: 'a/b', base: 'x.md' })
        expect(splitTemplatePath('x.md')).toEqual({ dir: '', base: 'x.md' })
    })

    test('derives the display name without folder or extension', () => {
        expect(getTemplateName('a/b/Meeting.md')).toBe('Meeting')
    })
})

describe('flatten template tree', () => {
    const templates = [
        { filename: 'Z.md', name: 'Z', folder: '' },
        { filename: 'A.md', name: 'A', folder: '' },
        { filename: 'work/Plan.md', name: 'Plan', folder: 'work' },
        { filename: 'work/q1/Goals.md', name: 'Goals', folder: 'work/q1' }
    ]
    const folders = ['work', 'work/q1', 'empty']

    test('lists own templates before subfolders, sorted, with nested depth', () => {
        const rows = flattenTemplateTree(templates, folders, new Set())

        expect(rows.map((row) => [row.type, row.id, row.depth])).toEqual([
            ['template', 'template:A.md', 0],
            ['template', 'template:Z.md', 0],
            ['folder', 'template-folder:empty', 0],
            ['folder', 'template-folder:work', 0],
            ['template', 'template:work/Plan.md', 1],
            ['folder', 'template-folder:work/q1', 1],
            ['template', 'template:work/q1/Goals.md', 2]
        ])
    })

    test('hides the contents of collapsed folders', () => {
        const rows = flattenTemplateTree(templates, folders, new Set(['template-folder:work']))

        expect(rows.map((row) => row.id)).toEqual([
            'template:A.md',
            'template:Z.md',
            'template-folder:empty',
            'template-folder:work'
        ])
        expect(rows.find((row) => row.id === 'template-folder:work').isCollapsed).toBe(true)
    })
})
