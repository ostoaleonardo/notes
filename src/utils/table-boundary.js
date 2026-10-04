import { TABLE_BOUNDARY_GAP } from '../constants/table'

export const getBoundaryEdit = ({ from, to, insert }, tables) => {
    if (from !== to || !insert || insert.startsWith('\n')) return null

    if (tables.some((table) => table.to === from)) {
        return {
            changes: { from, insert: TABLE_BOUNDARY_GAP + insert },
            cursor: from + TABLE_BOUNDARY_GAP.length + insert.length
        }
    }

    if (tables.some((table) => table.from === from)) {
        return {
            changes: { from, insert: insert + TABLE_BOUNDARY_GAP },
            cursor: from + insert.length
        }
    }

    return null
}
