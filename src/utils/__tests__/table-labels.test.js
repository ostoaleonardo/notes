import { buildTableLabels } from '../table-labels'
import { TABLE_ACTIONS, TABLE_AXES, TABLE_MENU_GROUPS } from '@/constants/table'

describe('build table labels', () => {
    const t = (key) => `label:${key}`
    const labels = buildTableLabels(t)

    test('creates one label per axis and action', () => {
        const expected = Object.keys(TABLE_AXES).length * Object.keys(TABLE_ACTIONS).length

        const axisKeys = Object.keys(labels).filter((key) => !key.startsWith('group_'))

        expect(axisKeys).toHaveLength(expected)
    })

    test('translates axis actions with the table menu namespace', () => {
        expect(labels.row_insert_before).toBe('label:table_menu.row_insert_before')
        expect(labels.col_align_center).toBe('label:table_menu.col_align_center')
    })

    test('creates one label per menu group', () => {
        Object.values(TABLE_MENU_GROUPS).forEach((group) => {
            expect(labels[`group_${group}`]).toBe(`label:table_menu.group_${group}`)
        })
    })
})
