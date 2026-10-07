import { TABLE_ACTIONS, TABLE_AXES, TABLE_MENU_GROUPS } from '@/constants/table'

export const buildTableLabels = (t) => Object.fromEntries([
    ...Object.values(TABLE_AXES).flatMap((axis) => (
        Object.values(TABLE_ACTIONS).map((action) => [
            `${axis}_${action}`,
            t(`table_menu.${axis}_${action}`)
        ])
    )),
    ...Object.values(TABLE_MENU_GROUPS).map((group) => [`group_${group}`, t(`table_menu.group_${group}`)])
])
