import { WidgetType } from '@codemirror/view'

import { bindTableDrag } from './table-drag'
import { buildElement, buildSvg, placeCaretAtEnd } from './table-dom'
import { closeTableMenu, openTableMenu } from './table-menu'
import { renderInlineHtml } from '@/components/markdown/markdown-dom-render-html'

import { keepFocus } from '@/utils/keep-focus'
import {
    applyTableAction,
    moveTableItem,
    parseTable,
    serializeTable,
    setCell
} from '@/utils/markdown-table'

import { NEWLINE_PATTERN } from '@/constants/markdown-patterns'
import { KEYBOARD_KEYS } from '@/constants/keyboard-keys'
import { DRAG_INDICATOR_ICON_PATH, TABLE_MENU_ICON_PATHS } from '@/constants/icon-paths'
import { TABLE_AXES } from '@/constants/table'
import {
    TABLE_CLASSES,
    TABLE_MENU_ICON_SIZE,
    TABLE_SCROLL_END_TOLERANCE
} from '@/constants/table-widget'

const getShape = (table) => `${table.rows.length}x${table.aligns.length}:${table.aligns.join(',')}`

export class TableWidget extends WidgetType {
    constructor(source, labels) {
        super()
        this.source = source
        this.labels = labels
    }

    eq(other) {
        return other.source === this.source && other.labels === this.labels
    }

    ignoreEvent() {
        return true
    }

    toDOM(view) {
        const wrap = buildElement('div', TABLE_CLASSES.WRAP)
        wrap.labels = this.labels
        this.build(view, wrap, parseTable(this.source))
        return wrap
    }

    updateDOM(wrap, view) {
        const table = parseTable(this.source)
        if (!table || wrap.shape !== getShape(table)) return false

        wrap.source = this.source
        wrap.labels = this.labels
        wrap.cells.forEach((cell) => {
            if (document.activeElement === cell) return
            this.fillCell(cell, table.rows[cell.row][cell.col])
        })
        wrap.table = table
        this.applyAligns(wrap)
        view.requestMeasure()
        return true
    }

    fillCell(cell, raw) {
        cell.raw = raw
        cell.innerHTML = renderInlineHtml(raw)
    }

    applyAligns(wrap) {
        wrap.cells.forEach((cell) => {
            const align = wrap.table.aligns[cell.col]
            cell.style.textAlign = align === 'none' ? '' : align
        })
    }

    build(view, wrap, table) {
        wrap.source = this.source
        wrap.table = table
        wrap.shape = getShape(table)
        wrap.cells = []

        const scroll = buildElement('div', TABLE_CLASSES.SCROLL, wrap)
        const element = buildElement('table', TABLE_CLASSES.TABLE, scroll)
        const rowGrip = buildElement('div', `${TABLE_CLASSES.GRIP} ${TABLE_CLASSES.ROW_GRIP}`, wrap)
        const colGrip = buildElement('div', `${TABLE_CLASSES.GRIP} ${TABLE_CLASSES.COL_GRIP}`, wrap)
        const addRow = buildElement('div', `${TABLE_CLASSES.ADD} ${TABLE_CLASSES.ADD_ROW}`, wrap)
        const addCol = buildElement('div', `${TABLE_CLASSES.ADD} ${TABLE_CLASSES.ADD_COL}`, wrap)

        rowGrip.appendChild(buildSvg(DRAG_INDICATOR_ICON_PATH, TABLE_MENU_ICON_SIZE))
        colGrip.appendChild(buildSvg(DRAG_INDICATOR_ICON_PATH, TABLE_MENU_ICON_SIZE))
        addRow.appendChild(buildSvg(TABLE_MENU_ICON_PATHS.ADD, TABLE_MENU_ICON_SIZE))
        addCol.appendChild(buildSvg(TABLE_MENU_ICON_PATHS.ADD, TABLE_MENU_ICON_SIZE))
        rowGrip.classList.add(TABLE_CLASSES.HIDDEN)
        colGrip.classList.add(TABLE_CLASSES.HIDDEN)

        table.rows.forEach((cells, row) => {
            const tr = buildElement('tr', '', element)

            cells.forEach((raw, col) => {
                const cell = buildElement(row === 0 ? 'th' : 'td', TABLE_CLASSES.CELL, tr)
                cell.row = row
                cell.col = col
                cell.contentEditable = 'plaintext-only'
                cell.enterKeyHint = 'next'
                this.fillCell(cell, raw)
                this.bindCell(view, wrap, cell, { rowGrip, colGrip })
                wrap.cells.push(cell)
            })
        })

        this.applyAligns(wrap)
        this.bindControls(view, wrap, { rowGrip, colGrip, addRow, addCol, scroll })
    }

    bindCell(view, wrap, cell, grips) {
        cell.addEventListener('focus', () => {
            cell.textContent = cell.raw
            placeCaretAtEnd(cell)
            this.showGrips(wrap, cell, grips)
        })

        cell.addEventListener('blur', () => {
            const next = cell.textContent.replace(NEWLINE_PATTERN, ' ')
            const changed = next !== cell.raw
            this.fillCell(cell, next)
            if (changed) this.commit(view, wrap, setCell(wrap.table, cell.row, cell.col, next))
        })

        cell.addEventListener('keydown', (event) => {
            if (event.key !== KEYBOARD_KEYS.ENTER) return
            event.preventDefault()
            cell.blur()
        })

        cell.addEventListener('click', (event) => {
            if (event.target.closest('a')) event.preventDefault()
        })
    }

    showGrips(wrap, cell, { rowGrip, colGrip }) {
        wrap.active = { row: cell.row, col: cell.col }
        this.positionGrips(wrap, { rowGrip, colGrip })
        rowGrip.classList.remove(TABLE_CLASSES.HIDDEN)
        colGrip.classList.remove(TABLE_CLASSES.HIDDEN)
    }

    positionGrips(wrap, { rowGrip, colGrip }) {
        const { active } = wrap
        if (!active) return

        const cell = wrap.cells.find((item) => item.row === active.row && item.col === active.col)
        if (!cell) return

        const wrapRect = wrap.getBoundingClientRect()
        const rect = cell.getBoundingClientRect()

        rowGrip.style.top = `${rect.top - wrapRect.top}px`
        rowGrip.style.height = `${rect.height}px`
        colGrip.style.left = `${rect.left - wrapRect.left}px`
        colGrip.style.width = `${rect.width}px`
    }

    commit(view, wrap, table) {
        const from = view.posAtDOM(wrap)
        const insert = serializeTable(table)
        if (insert === wrap.source) return

        view.dispatch({ changes: { from, to: from + wrap.source.length, insert } })
    }

    readTable(wrap) {
        const rows = []

        wrap.cells.forEach((cell) => {
            const value = document.activeElement === cell ? cell.textContent.replace(NEWLINE_PATTERN, ' ') : cell.raw
            if (!rows[cell.row]) rows[cell.row] = []
            rows[cell.row][cell.col] = value
        })

        return { ...wrap.table, rows }
    }

    applyChange(view, wrap, current, next) {
        if (next === current) return

        document.activeElement?.blur?.()
        wrap.table = next
        this.commit(view, wrap, next)
    }

    runAction(view, wrap, axis, index, action) {
        const current = this.readTable(wrap)
        this.applyChange(view, wrap, current, applyTableAction(current, axis, index, action))
    }


    moveItem(view, wrap, axis, from, to) {
        const current = this.readTable(wrap)
        this.applyChange(view, wrap, current, moveTableItem(current, axis, from, to))
    }

    bindDrag(view, wrap, grip, axis, scroll) {
        bindTableDrag({
            wrap,
            grip,
            axis,
            scroll,
            onHold: () => this.openMenu(view, wrap, axis, grip),
            onStart: () => this.closeMenu(wrap),
            onDrop: (from, to) => this.moveItem(view, wrap, axis, from, to)
        })
    }

    openMenu(view, wrap, axis, grip) {
        openTableMenu({
            wrap,
            axis,
            grip,
            current: this.readTable(wrap),
            onAction: (index, action) => this.runAction(view, wrap, axis, index, action)
        })
    }

    closeMenu(wrap) {
        closeTableMenu(wrap)
    }

    bindControls(view, wrap, { rowGrip, colGrip, addRow, addCol, scroll }) {
        const toggleMenu = (axis, grip) => {
            if (wrap.menu && wrap.menuAxis === axis) this.closeMenu(wrap)
            else this.openMenu(view, wrap, axis, grip)
        }

        const bindGrip = (grip, axis) => {
            this.bindDrag(view, wrap, grip, axis, scroll)
            grip.addEventListener('mousedown', keepFocus)
            grip.addEventListener('selectstart', keepFocus)
            grip.addEventListener('click', () => {
                if (!wrap.suppressClick) toggleMenu(axis, grip)
            })
            grip.addEventListener('contextmenu', (event) => {
                event.preventDefault()
                this.openMenu(view, wrap, axis, grip)
            })
        }

        bindGrip(rowGrip, TABLE_AXES.ROW)
        bindGrip(colGrip, TABLE_AXES.COL)

        const bindAdd = (button, axis) => {
            button.addEventListener('mousedown', keepFocus)
            button.addEventListener('click', () => {
                const table = this.readTable(wrap)
                const last = axis === TABLE_AXES.ROW ? table.rows.length - 1 : table.aligns.length - 1
                this.runAction(view, wrap, axis, last, 'insert_after')
            })
        }

        bindAdd(addRow, TABLE_AXES.ROW)
        bindAdd(addCol, TABLE_AXES.COL)

        const updateAddCol = () => {
            const atEnd = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - TABLE_SCROLL_END_TOLERANCE
            addCol.classList.toggle(TABLE_CLASSES.HIDDEN, !atEnd)
        }

        scroll.addEventListener('scroll', () => {
            this.positionGrips(wrap, { rowGrip, colGrip })
            updateAddCol()
        })

        wrap.resizeObserver = new ResizeObserver(updateAddCol)
        wrap.resizeObserver.observe(scroll)
        wrap.resizeObserver.observe(scroll.firstChild)

        wrap.outsideHandler = (event) => {
            if (wrap.menu && !wrap.menu.contains(event.target)
                && !rowGrip.contains(event.target) && !colGrip.contains(event.target)) this.closeMenu(wrap)
        }
        document.addEventListener('mousedown', wrap.outsideHandler, true)

        wrap.addEventListener('focusout', () => {
            requestAnimationFrame(() => {
                if (wrap.contains(document.activeElement) || wrap.menu) return
                rowGrip.classList.add(TABLE_CLASSES.HIDDEN)
                colGrip.classList.add(TABLE_CLASSES.HIDDEN)
            })
        })
    }

    destroy(wrap) {
        document.removeEventListener('mousedown', wrap.outsideHandler, true)
        wrap.resizeObserver?.disconnect()
    }
}
