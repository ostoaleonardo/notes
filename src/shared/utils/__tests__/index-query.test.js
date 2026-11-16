import { createIndexQuery, toRows } from '../index-query'

jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

describe('index query rows', () => {
    test('turns columns into one object per row', () => {
        const rows = toRows({
            columns: ['id', 'title'],
            values: [[1, 2], ['a', 'b']]
        })

        expect(rows).toEqual([{ id: 1, title: 'a' }, { id: 2, title: 'b' }])
    })

    test('returns no rows when the columns are empty', () => {
        expect(toRows({ columns: ['id', 'title'], values: [[], []] })).toEqual([])
    })

    test('returns no rows when there are no columns', () => {
        expect(toRows({ columns: [], values: [] })).toEqual([])
    })

    test('keeps null values', () => {
        expect(toRows({ columns: ['a'], values: [[null]] })).toEqual([{ a: null }])
    })
})

describe('index query function', () => {
    test('sends the sql and the parameters to the native module', async () => {
        const fs = { queryIndex: jest.fn(async () => ({ columns: ['n'], values: [[7]] })) }
        const query = createIndexQuery(fs)

        const rows = await query('SELECT ?', 'x', 3)

        expect(fs.queryIndex).toHaveBeenCalledWith('SELECT ?', ['x', 3])
        expect(rows).toEqual([{ n: 7 }])
    })

    test('sends an empty parameter list when there are none', async () => {
        const fs = { queryIndex: jest.fn(async () => ({ columns: [], values: [] })) }

        await createIndexQuery(fs)('SELECT 1')

        expect(fs.queryIndex).toHaveBeenCalledWith('SELECT 1', [])
    })
})
