import { getBoundaryEdit } from '../table-boundary'

const TABLES = [{ from: 10, to: 40 }]

describe('get boundary edit', () => {
    test('moves text typed at the end of a table to a new paragraph', () => {
        expect(getBoundaryEdit({ from: 40, to: 40, insert: 'x' }, TABLES)).toEqual({
            changes: { from: 40, insert: '\n\nx' },
            cursor: 43
        })
    })

    test('moves text typed at the start of a table above it', () => {
        expect(getBoundaryEdit({ from: 10, to: 10, insert: 'x' }, TABLES)).toEqual({
            changes: { from: 10, insert: 'x\n\n' },
            cursor: 11
        })
    })

    test('lets a line break at the boundary through', () => {
        expect(getBoundaryEdit({ from: 40, to: 40, insert: '\n' }, TABLES)).toBeNull()
    })

    test('ignores edits away from the table and replacements', () => {
        expect(getBoundaryEdit({ from: 20, to: 20, insert: 'x' }, TABLES)).toBeNull()
        expect(getBoundaryEdit({ from: 40, to: 45, insert: 'x' }, TABLES)).toBeNull()
        expect(getBoundaryEdit({ from: 40, to: 40, insert: '' }, TABLES)).toBeNull()
    })
})
