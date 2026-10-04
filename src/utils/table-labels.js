import { TABLE_ACTIONS, TABLE_AXES } from '../constants/table'

export const buildTableLabels = (t) => Object.fromEntries(
    Object.values(TABLE_AXES).flatMap((axis) => (
        Object.values(TABLE_ACTIONS).map((action) => [
            `${axis}_${action}`,
            t(`table_menu.${axis}_${action}`)
        ])
    ))
)
