import { WidgetType } from '@codemirror/view'

import { renderInlineHtml } from '../markdown-dom-render-html'

import {
    applyTableAction,
    moveTableItem,
    parseTable,
    serializeTable,
    setCell
} from '@/utils/markdown-table'

import { ICON_FILL, ICON_VIEW_BOX } from '@/constants/icon-size'
import {
    TABLE_AXES,
    TABLE_GRIP_ICON_PATH,
    TABLE_MENU_ICON_PATHS,
    TABLE_MENU_LAYOUT
} from '@/constants/table'
import {
    TABLE_CLASSES,
    TABLE_DRAG_THRESHOLD,
    TABLE_DROP_THICKNESS,
    TABLE_HOLD_DELAY,
    TABLE_MENU_ICON_SIZE,
    TABLE_SCROLL_END_TOLERANCE
} from '@/constants/table-widget'

const SVG_NS = 'http://www.w3.org/2000/svg'

const buildSvg = (path, size) => {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('width', size)
    svg.setAttribute('height', size)
    svg.setAttribute('viewBox', ICON_VIEW_BOX)
    svg.setAttribute('fill', ICON_FILL)

    const shape = document.createElementNS(SVG_NS, 'path')
    shape.setAttribute('d', path)
    svg.appendChild(shape)

    return svg
}

const buildElement = (tag, className, parent) => {
    const element = document.createElement(tag)
    element.className = className
    parent?.appendChild(element)
    return element
}

const keepFocus = (event) => event.preventDefault()

const placeCaretAtEnd = (element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}

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

        rowGrip.appendChild(buildSvg(TABLE_GRIP_ICON_PATH, TABLE_MENU_ICON_SIZE))
        colGrip.appendChild(buildSvg(TABLE_GRIP_ICON_PATH, TABLE_MENU_ICON_SIZE))
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
            const next = cell.textContent.replace(/\n/g, ' ')
            const changed = next !== cell.raw
            this.fillCell(cell, next)
            if (changed) this.commit(view, wrap, setCell(wrap.table, cell.row, cell.col, next))
        })

        cell.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return
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
            const value = document.activeElement === cell ? cell.textContent.replace(/\n/g, ' ') : cell.raw
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

    getDropTarget(wrap, axis, point) {
        const isRow = axis === TABLE_AXES.ROW
        const lanes = wrap.cells.filter((cell) => (isRow ? cell.col === 0 : cell.row === 0))
        const rects = lanes.map((cell) => cell.getBoundingClientRect())
        const position = isRow ? point.y : point.x
        const found = rects.findIndex((rect) => position < (isRow ? rect.bottom : rect.right))
        const index = found === -1 ? lanes.length - 1 : found

        return { index, rect: rects[index] }
    }

    drawDrop(wrap, axis, scroll, from, target) {
        const isRow = axis === TABLE_AXES.ROW
        const { drop } = wrap
        drop.classList.toggle(TABLE_CLASSES.HIDDEN, target.index === from)

        const wrapRect = wrap.getBoundingClientRect()
        const scrollRect = scroll.getBoundingClientRect()
        const after = target.index > from
        const half = TABLE_DROP_THICKNESS / 2

        if (isRow) {
            const edge = after ? target.rect.bottom : target.rect.top
            drop.style.left = `${scrollRect.left - wrapRect.left}px`
            drop.style.width = `${scroll.clientWidth}px`
            drop.style.top = `${edge - wrapRect.top - half}px`
            drop.style.height = `${TABLE_DROP_THICKNESS}px`
        } else {
            const edge = after ? target.rect.right : target.rect.left
            drop.style.top = `${scrollRect.top - wrapRect.top}px`
            drop.style.height = `${scroll.clientHeight}px`
            drop.style.left = `${edge - wrapRect.left - half}px`
            drop.style.width = `${TABLE_DROP_THICKNESS}px`
        }
    }

    bindDrag(view, wrap, grip, axis, scroll) {
        let drag = null
        let holdTimer = null

        const highlight = (index, on) => wrap.cells.forEach((cell) => {
            const position = axis === TABLE_AXES.ROW ? cell.row : cell.col
            if (position === index) cell.classList.toggle(TABLE_CLASSES.HIGHLIGHT, on)
        })

        const finish = (commit) => {
            clearTimeout(holdTimer)
            if (!drag) return

            const { from, to, moving } = drag
            drag = null
            wrap.drop?.remove()
            wrap.drop = null
            if (moving) highlight(from, false)
            if (moving && commit && to !== null && to !== from) this.moveItem(view, wrap, axis, from, to)
            setTimeout(() => { wrap.suppressClick = false })
        }

        grip.addEventListener('pointerdown', (event) => {
            if (!wrap.active) return

            const from = axis === TABLE_AXES.ROW ? wrap.active.row : wrap.active.col
            drag = { from, to: null, moving: false, x: event.clientX, y: event.clientY }
            grip.setPointerCapture(event.pointerId)

            holdTimer = setTimeout(() => {
                wrap.suppressClick = true
                this.openMenu(view, wrap, axis, grip)
            }, TABLE_HOLD_DELAY)
        })

        grip.addEventListener('pointermove', (event) => {
            if (!drag) return

            if (!drag.moving) {
                const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
                if (distance < TABLE_DRAG_THRESHOLD) return

                clearTimeout(holdTimer)

                drag.moving = true
                wrap.suppressClick = true
                this.closeMenu(wrap)
                highlight(drag.from, true)
                wrap.drop = buildElement('div', TABLE_CLASSES.DROP, wrap)
            }

            const target = this.getDropTarget(wrap, axis, { x: event.clientX, y: event.clientY })
            drag.to = target.index
            this.drawDrop(wrap, axis, scroll, drag.from, target)
        })

        grip.addEventListener('pointerup', () => finish(true))
        grip.addEventListener('pointercancel', () => finish(false))
    }

    openMenu(view, wrap, axis, grip) {
        this.closeMenu(wrap)

        const { active, labels } = wrap
        if (!active) return

        const index = axis === TABLE_AXES.ROW ? active.row : active.col
        const current = this.readTable(wrap)
        const menu = buildElement('div', TABLE_CLASSES.MENU, wrap)
        wrap.menu = menu
        wrap.menuAxis = axis

        wrap.cells.forEach((cell) => {
            const position = axis === TABLE_AXES.ROW ? cell.row : cell.col
            if (position === index) cell.classList.add(TABLE_CLASSES.HIGHLIGHT)
        })

        TABLE_MENU_LAYOUT[axis].forEach(({ group, items }) => {
            const section = buildElement('div', TABLE_CLASSES.MENU_GROUP, menu)
            if (group) buildElement('div', TABLE_CLASSES.MENU_LABEL, section).textContent = labels[`group_${group}`] || group

            items.forEach(({ action, icon }) => {
                const disabled = applyTableAction(current, axis, index, action) === current
                const item = buildElement('div', TABLE_CLASSES.MENU_ITEM, section)
                item.appendChild(buildSvg(TABLE_MENU_ICON_PATHS[icon], TABLE_MENU_ICON_SIZE))
                buildElement('span', '', item).textContent = labels[`${axis}_${action}`] || action
                if (disabled) item.classList.add(TABLE_CLASSES.DISABLED)

                item.addEventListener('mousedown', keepFocus)
                item.addEventListener('click', () => {
                    if (disabled) return
                    this.closeMenu(wrap)
                    this.runAction(view, wrap, axis, index, action)
                })
            })
        })

        const gripRect = grip.getBoundingClientRect()
        const wrapRect = wrap.getBoundingClientRect()
        const left = axis === TABLE_AXES.ROW ? gripRect.right - wrapRect.left : gripRect.left - wrapRect.left
        const top = axis === TABLE_AXES.ROW ? gripRect.top - wrapRect.top : gripRect.bottom - wrapRect.top
        menu.style.left = `${Math.max(0, Math.min(left, wrap.clientWidth - menu.offsetWidth))}px`
        menu.style.top = `${top}px`
    }

    closeMenu(wrap) {
        wrap.menu?.remove()
        wrap.menu = null
        wrap.cells.forEach((cell) => cell.classList.remove(TABLE_CLASSES.HIGHLIGHT))
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
