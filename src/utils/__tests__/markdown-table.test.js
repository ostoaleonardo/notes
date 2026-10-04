import {
    applyTableAction,
    deleteCol,
    deleteRow,
    duplicateCol,
    duplicateRow,
    getTableLength,
    insertCol,
    insertRow,
    moveCol,
    moveRow,
    moveTableItem,
    parseTable,
    serializeTable,
    setAlign,
    setCell
} from '../markdown-table'

const SOURCE = '| a | b |\n| :--- | ---: |\n| 1 | 2 |\n| 3 | 4 |'

describe('parse table', () => {
    test('reads cells and alignments', () => {
        expect(parseTable(SOURCE)).toEqual({
            rows: [['a', 'b'], ['1', '2'], ['3', '4']],
            aligns: ['left', 'right']
        })
    })

    test('keeps escaped pipes inside a cell', () => {
        const table = parseTable('| a \\| b | c |\n| --- | --- |\n| 1 | 2 |')
        expect(table.rows[0]).toEqual(['a \\| b', 'c'])
    })

    test('pads short rows to the widest row', () => {
        const table = parseTable('| a | b |\n| --- | --- |\n| 1 |')
        expect(table.rows[1]).toEqual(['1', ''])
    })

    test('reads center alignment', () => {
        expect(parseTable('| a |\n| :---: |').aligns).toEqual(['center'])
    })

    test('returns null without a delimiter row', () => {
        expect(parseTable('| a |')).toBeNull()
    })

    test('stops at the first line without a pipe', () => {
        const table = parseTable('| a | b |\n| --- | --- |\n| 1 | 2 |\nhi')
        expect(table.rows).toEqual([['a', 'b'], ['1', '2']])
    })
})

describe('get table length', () => {
    test('covers only the lines that belong to the table', () => {
        const source = '| a | b |\n| --- | --- |\n| 1 | 2 |'
        expect(getTableLength(`${source}\nhi`)).toBe(source.length)
        expect(getTableLength(source)).toBe(source.length)
    })
})

describe('serialize table', () => {
    test('round-trips a parsed table', () => {
        expect(serializeTable(parseTable(SOURCE))).toBe(
            '| a | b |\n| :--- | ---: |\n| 1 | 2 |\n| 3 | 4 |'
        )
    })

    test('escapes bare pipes and flattens newlines', () => {
        const table = setCell(parseTable(SOURCE), 1, 0, 'x|y\nz')
        expect(serializeTable(table)).toContain('| x\\|y z | 2 |')
    })
})

describe('row operations', () => {
    const table = parseTable(SOURCE)

    test('inserts a blank row never above the header', () => {
        expect(insertRow(table, 0).rows[1]).toEqual(['', ''])
        expect(insertRow(table, 2).rows[2]).toEqual(['', ''])
    })

    test('deletes a body row but not the header or the last body row', () => {
        expect(deleteRow(table, 1).rows).toEqual([['a', 'b'], ['3', '4']])
        expect(deleteRow(table, 0)).toBe(table)
        expect(deleteRow(deleteRow(table, 1), 1).rows).toHaveLength(2)
    })

    test('moves a row within the table', () => {
        expect(moveRow(table, 1, 1).rows[1]).toEqual(['3', '4'])
        expect(moveRow(table, 1, -1).rows[0]).toEqual(['1', '2'])
        expect(moveRow(table, 2, 1)).toBe(table)
    })

    test('duplicates a body row below itself', () => {
        expect(duplicateRow(table, 1).rows[2]).toEqual(['1', '2'])
        expect(duplicateRow(table, 0)).toBe(table)
    })
})

describe('column operations', () => {
    const table = parseTable(SOURCE)

    test('inserts a blank column with default alignment', () => {
        const next = insertCol(table, 1)
        expect(next.rows[0]).toEqual(['a', '', 'b'])
        expect(next.aligns).toEqual(['left', 'none', 'right'])
    })

    test('deletes a column unless it is the last one', () => {
        expect(deleteCol(table, 0).rows[0]).toEqual(['b'])
        expect(deleteCol(deleteCol(table, 0), 0).rows[0]).toEqual(['b'])
    })

    test('moves a column with its alignment', () => {
        const next = moveCol(table, 0, 1)
        expect(next.rows[0]).toEqual(['b', 'a'])
        expect(next.aligns).toEqual(['right', 'left'])
        expect(moveCol(table, 0, -1)).toBe(table)
    })

    test('duplicates a column next to itself', () => {
        const next = duplicateCol(table, 0)
        expect(next.rows[1]).toEqual(['1', '1', '2'])
        expect(next.aligns).toEqual(['left', 'left', 'right'])
    })

    test('sets the alignment of one column', () => {
        expect(setAlign(table, 0, 'center').aligns).toEqual(['center', 'right'])
    })
})

describe('apply table action', () => {
    const table = parseTable(SOURCE)

    test('routes row and column actions to their operations', () => {
        expect(applyTableAction(table, 'row', 1, 'insert_after').rows).toHaveLength(4)
        expect(applyTableAction(table, 'col', 0, 'delete').aligns).toEqual(['right'])
        expect(applyTableAction(table, 'col', 1, 'align_center').aligns).toEqual(['left', 'center'])
    })

    test('returns the same table when the action is not possible', () => {
        expect(applyTableAction(table, 'row', 0, 'insert_before')).toBe(table)
        expect(applyTableAction(table, 'row', 0, 'delete')).toBe(table)
        expect(applyTableAction(table, 'col', 0, 'move_before')).toBe(table)
        expect(applyTableAction(table, 'row', 1, 'align_left')).toBe(table)
    })
})

describe('move table item', () => {
    const table = parseTable('| a | b | c |\n| --- | --- | --- |\n| 1 | 2 | 3 |\n| 4 | 5 | 6 |\n| 7 | 8 | 9 |')

    test('moves a row to any target index', () => {
        expect(moveTableItem(table, 'row', 1, 3).rows.map((row) => row[0])).toEqual(['a', '4', '7', '1'])
        expect(moveTableItem(table, 'row', 3, 1).rows.map((row) => row[0])).toEqual(['a', '7', '1', '4'])
    })

    test('moves the header row like any other row', () => {
        expect(moveTableItem(table, 'row', 0, 2).rows.map((row) => row[0])).toEqual(['1', '4', 'a', '7'])
        expect(moveTableItem(table, 'row', 3, 0).rows.map((row) => row[0])).toEqual(['7', 'a', '1', '4'])
    })

    test('moves a column to any target index', () => {
        expect(moveTableItem(table, 'col', 0, 2).rows[0]).toEqual(['b', 'c', 'a'])
        expect(moveTableItem(table, 'col', 2, 0).rows[0]).toEqual(['c', 'a', 'b'])
    })

    test('returns the same table when the move is not possible', () => {
        expect(moveTableItem(table, 'row', 0, 9)).toBe(table)
        expect(moveTableItem(table, 'row', 1, -1)).toBe(table)
        expect(moveTableItem(table, 'col', 1, 5)).toBe(table)
    })
})
