import { Decoration } from '@codemirror/view'

import { decorateHtml } from './html'
import { TableWidget } from './table-widget'

import { getTableLength, parseTable } from '@/utils/markdown-table'

import {
    TABLE_BLEED,
    TABLE_CELL_MAX_WIDTH,
    TABLE_CELL_MIN_WIDTH,
    TABLE_CLASSES,
    TABLE_GUTTER,
    TABLE_MENU_MIN_WIDTH
} from '@/constants/table-widget'
import { TRANSPARENT } from '@/constants/themes'
import { RADIUS } from '@/constants/radius'
import { SPACING } from '@/constants/spacing'

export const decorateTable = (node, context) => {
    const { doc, ranges, tableLabels } = context
    const raw = doc.sliceString(node.from, node.to)
    const to = node.from + getTableLength(raw)
    const source = raw.slice(0, to - node.from)
    const isTopLevel = node.node.parent?.name === 'Document' && doc.lineAt(node.from).from === node.from

    if (!isTopLevel || !parseTable(source)) return decorateHtml(node, context)
    ranges.push(
        Decoration.replace({ widget: new TableWidget(source, tableLabels), block: true }).range(node.from, to)
    )
    return true
}

export const tableTheme = ({ colors, typography }) => {
    const accent = colors.tertiary
    const border = `1px solid ${colors.onBackground + TRANSPARENT[20]}`

    return {
        [`.${TABLE_CLASSES.WRAP}`]: {
            position: 'relative',
            contain: 'inline-size',
            margin: `0 -${TABLE_BLEED}px`,
            padding: `${TABLE_GUTTER}px 0`
        },
        [`.${TABLE_CLASSES.SCROLL}`]: { overflowX: 'auto', padding: `0 ${TABLE_BLEED + TABLE_GUTTER}px` },
        [`.${TABLE_CLASSES.TABLE}`]: { borderCollapse: 'collapse', width: 'max-content', minWidth: '100%' },
        [`.${TABLE_CLASSES.CELL}`]: {
            border,
            padding: '6px 10px',
            minWidth: `${TABLE_CELL_MIN_WIDTH}px`,
            maxWidth: `${TABLE_CELL_MAX_WIDTH}px`,
            outline: 'none',
            textAlign: 'left',
            verticalAlign: 'top',
            overflowWrap: 'break-word'
        },
        [`th.${TABLE_CLASSES.CELL}`]: { fontWeight: 'bold' },
        [`.${TABLE_CLASSES.CELL}:focus`]: { boxShadow: `inset 0 0 0 2px ${accent}` },
        [`.${TABLE_CLASSES.CELL} a`]: { color: accent },
        [`.${TABLE_CLASSES.CELL} code`]: {
            backgroundColor: colors.codeBackground,
            borderRadius: '4px',
            padding: '0.1em 0.3em',
            fontFamily: 'monospace'
        },
        [`.${TABLE_CLASSES.HIGHLIGHT}`]: { backgroundColor: accent + TRANSPARENT[10] },
        [`.${TABLE_CLASSES.GRIP}`]: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.onBackground,
            opacity: 0.6,
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
        },
        [`.${TABLE_CLASSES.DROP}`]: {
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: accent
        },
        [`.${TABLE_CLASSES.ROW_GRIP}`]: { left: `${TABLE_BLEED}px`, width: `${TABLE_GUTTER}px` },
        [`.${TABLE_CLASSES.COL_GRIP}`]: { top: 0, height: `${TABLE_GUTTER}px` },
        [`.${TABLE_CLASSES.COL_GRIP} svg`]: { transform: 'rotate(90deg)' },
        [`.${TABLE_CLASSES.ADD}`]: {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.onBackground,
            opacity: 0.4,
            cursor: 'pointer'
        },
        [`.${TABLE_CLASSES.ADD_ROW}`]: {
            left: `${TABLE_BLEED + TABLE_GUTTER}px`,
            right: `${TABLE_BLEED + TABLE_GUTTER}px`,
            bottom: 0,
            height: `${TABLE_GUTTER}px`
        },
        [`.${TABLE_CLASSES.ADD_COL}`]: {
            right: `${TABLE_BLEED}px`,
            top: `${TABLE_GUTTER}px`,
            bottom: `${TABLE_GUTTER}px`,
            width: `${TABLE_GUTTER}px`
        },
        [`.${TABLE_CLASSES.HIDDEN}`]: { display: 'none' },
        [`.${TABLE_CLASSES.MENU}`]: {
            position: 'absolute',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            minWidth: `${TABLE_MENU_MIN_WIDTH}px`,
            gap: `${SPACING.xxs}px`,
            padding: `${SPACING.xs}px`
        },
        [`.${TABLE_CLASSES.MENU_GROUP}`]: {
            overflow: 'hidden',
            borderRadius: `${RADIUS.inner}px`,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.onBackground + TRANSPARENT[5]}`
        },
        [`.${TABLE_CLASSES.MENU_GROUP}:first-child`]: {
            borderTopLeftRadius: `${RADIUS.outer}px`,
            borderTopRightRadius: `${RADIUS.outer}px`
        },
        [`.${TABLE_CLASSES.MENU_GROUP}:last-child`]: {
            borderBottomLeftRadius: `${RADIUS.outer}px`,
            borderBottomRightRadius: `${RADIUS.outer}px`
        },
        [`.${TABLE_CLASSES.MENU_ITEM}`]: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            fontFamily: typography.fontFamily,
            fontSize: '14px',
            color: colors.onBackground,
            cursor: 'pointer'
        },
        [`.${TABLE_CLASSES.MENU_LABEL}`]: {
            padding: '8px 10px 2px',
            fontFamily: typography.fontFamily,
            fontSize: '12px',
            color: colors.onBackground + TRANSPARENT[50]
        },
        [`.${TABLE_CLASSES.DISABLED}`]: { opacity: 0.35, pointerEvents: 'none' }
    }
}
