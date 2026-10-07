export const MAX_TABLE_ROWS = 7
export const MAX_TABLE_COLS = 7
export const TABLE_CELL_SIZE = 32
export const TABLE_CELL_GAP = 6
export const TABLE_PIPE = '|'
export const TABLE_BODY_START_LINE = 2
export const TABLE_RULE_NAME = 'table'
export const TABLE_BOUNDARY_GAP = '\n\n'
export const TABLE_END_LINE = '\n'
export const TABLE_BOUNDARY_INPUT_EVENTS = ['input', 'paste']

export const TABLE_ALIGNS = {
    NONE: 'none',
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
}

export const TABLE_AXES = {
    ROW: 'row',
    COL: 'col'
}

export const TABLE_ACTIONS = {
    INSERT_BEFORE: 'insert_before',
    INSERT_AFTER: 'insert_after',
    MOVE_BEFORE: 'move_before',
    MOVE_AFTER: 'move_after',
    DUPLICATE: 'duplicate',
    DELETE: 'delete',
    ALIGN_LEFT: 'align_left',
    ALIGN_CENTER: 'align_center',
    ALIGN_RIGHT: 'align_right'
}

export const TABLE_MENU_GROUPS = {
    INSERT: 'insert',
    MOVE: 'move',
    ALIGN: 'align'
}

const TABLE_MENU_FOOTER = {
    items: [
        { action: TABLE_ACTIONS.DUPLICATE, icon: 'CONTENT_COPY' },
        { action: TABLE_ACTIONS.DELETE, icon: 'DELETE' }
    ]
}

export const TABLE_MENU_LAYOUT = {
    [TABLE_AXES.ROW]: [
        {
            group: TABLE_MENU_GROUPS.INSERT,
            items: [
                { action: TABLE_ACTIONS.INSERT_BEFORE, icon: 'ARROW_UPWARD' },
                { action: TABLE_ACTIONS.INSERT_AFTER, icon: 'ARROW_DOWNWARD' }
            ]
        },
        {
            group: TABLE_MENU_GROUPS.MOVE,
            items: [
                { action: TABLE_ACTIONS.MOVE_BEFORE, icon: 'ARROW_UPWARD' },
                { action: TABLE_ACTIONS.MOVE_AFTER, icon: 'ARROW_DOWNWARD' }
            ]
        },
        TABLE_MENU_FOOTER
    ],
    [TABLE_AXES.COL]: [
        {
            group: TABLE_MENU_GROUPS.INSERT,
            items: [
                { action: TABLE_ACTIONS.INSERT_BEFORE, icon: 'ARROW_BACK' },
                { action: TABLE_ACTIONS.INSERT_AFTER, icon: 'ARROW_FORWARD' }
            ]
        },
        {
            group: TABLE_MENU_GROUPS.MOVE,
            items: [
                { action: TABLE_ACTIONS.MOVE_BEFORE, icon: 'ARROW_BACK' },
                { action: TABLE_ACTIONS.MOVE_AFTER, icon: 'ARROW_FORWARD' }
            ]
        },
        {
            group: TABLE_MENU_GROUPS.ALIGN,
            items: [
                { action: TABLE_ACTIONS.ALIGN_LEFT, icon: 'FORMAT_ALIGN_LEFT' },
                { action: TABLE_ACTIONS.ALIGN_CENTER, icon: 'FORMAT_ALIGN_CENTER' },
                { action: TABLE_ACTIONS.ALIGN_RIGHT, icon: 'FORMAT_ALIGN_RIGHT' }
            ]
        },
        TABLE_MENU_FOOTER
    ]
}

export const DEFAULT_TABLE_SIZE = {
    cols: 2,
    rows: 1
}
