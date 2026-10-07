import { buildElement, setLaneHighlight } from './table-dom'

import { TABLE_AXES } from '@/constants/table'
import {
    TABLE_CLASSES,
    TABLE_DRAG_THRESHOLD,
    TABLE_DROP_THICKNESS,
    TABLE_HOLD_DELAY
} from '@/constants/table-widget'

const getDropTarget = (wrap, axis, point) => {
    const isRow = axis === TABLE_AXES.ROW
    const lanes = wrap.cells.filter((cell) => (isRow ? cell.col === 0 : cell.row === 0))
    const rects = lanes.map((cell) => cell.getBoundingClientRect())
    const position = isRow ? point.y : point.x
    const found = rects.findIndex((rect) => position < (isRow ? rect.bottom : rect.right))
    const index = found === -1 ? lanes.length - 1 : found

    return { index, rect: rects[index] }
}

const drawDrop = (wrap, axis, scroll, from, target) => {
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

export const bindTableDrag = ({ wrap, grip, axis, scroll, onHold, onStart, onDrop }) => {
    let drag = null
    let holdTimer = null

    const finish = (commit) => {
        clearTimeout(holdTimer)
        if (!drag) return

        const { from, to, moving } = drag
        drag = null
        wrap.drop?.remove()
        wrap.drop = null
        if (moving) setLaneHighlight(wrap, axis, from, false)
        if (moving && commit && to !== null && to !== from) onDrop(from, to)
        setTimeout(() => { wrap.suppressClick = false })
    }

    grip.addEventListener('pointerdown', (event) => {
        if (!wrap.active) return

        const from = axis === TABLE_AXES.ROW ? wrap.active.row : wrap.active.col
        drag = { from, to: null, moving: false, x: event.clientX, y: event.clientY }
        grip.setPointerCapture(event.pointerId)

        holdTimer = setTimeout(() => {
            wrap.suppressClick = true
            onHold()
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
            onStart()
            setLaneHighlight(wrap, axis, drag.from, true)
            wrap.drop = buildElement('div', TABLE_CLASSES.DROP, wrap)
        }

        const target = getDropTarget(wrap, axis, { x: event.clientX, y: event.clientY })
        drag.to = target.index
        drawDrop(wrap, axis, scroll, drag.from, target)
    })

    grip.addEventListener('pointerup', () => finish(true))
    grip.addEventListener('pointercancel', () => finish(false))
}
