import { TABLE_AXES } from '@/constants/table'
import { TABLE_CLASSES } from '@/constants/table-widget'
import { ICON_FILL, ICON_VIEW_BOX } from '@/constants/theme'

const SVG_NS = 'http://www.w3.org/2000/svg'

export const buildSvg = (path, size) => {
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

export const buildElement = (tag, className, parent) => {
    const element = document.createElement(tag)
    element.className = className
    parent?.appendChild(element)
    return element
}

export const placeCaretAtEnd = (element) => {
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)

    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
}

const getAxisPosition = (cell, axis) => (axis === TABLE_AXES.ROW ? cell.row : cell.col)

export const setLaneHighlight = (wrap, axis, index, on) => wrap.cells.forEach((cell) => {
    if (getAxisPosition(cell, axis) === index) cell.classList.toggle(TABLE_CLASSES.HIGHLIGHT, on)
})
