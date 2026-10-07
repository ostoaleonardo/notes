import { buildElement, buildSvg, setLaneHighlight } from './table-dom'

import { applyTableAction } from '@/utils/markdown-table'
import { keepFocus } from '@/utils/keep-focus'
import { TABLE_MENU_ICON_PATHS } from '@/constants/icon-paths'
import { TABLE_AXES, TABLE_MENU_LAYOUT } from '@/constants/table'
import { TABLE_CLASSES, TABLE_MENU_ICON_SIZE } from '@/constants/table-widget'

export const closeTableMenu = (wrap) => {
    wrap.menu?.remove()
    wrap.menu = null
    wrap.cells.forEach((cell) => cell.classList.remove(TABLE_CLASSES.HIGHLIGHT))
}

export const openTableMenu = ({ wrap, axis, grip, current, onAction }) => {
    closeTableMenu(wrap)

    const { active, labels } = wrap
    if (!active) return

    const index = axis === TABLE_AXES.ROW ? active.row : active.col
    const menu = buildElement('div', TABLE_CLASSES.MENU, wrap)
    wrap.menu = menu
    wrap.menuAxis = axis

    setLaneHighlight(wrap, axis, index, true)

    TABLE_MENU_LAYOUT[axis].forEach(({ group, items }) => {
        const section = buildElement('div', TABLE_CLASSES.MENU_GROUP, menu)

        if (group) {
            const label = buildElement('div', TABLE_CLASSES.MENU_LABEL, section)
            label.textContent = labels[`group_${group}`] || group
        }

        items.forEach(({ action, icon }) => {
            const disabled = applyTableAction(current, axis, index, action) === current
            const item = buildElement('div', TABLE_CLASSES.MENU_ITEM, section)
            item.appendChild(buildSvg(TABLE_MENU_ICON_PATHS[icon], TABLE_MENU_ICON_SIZE))
            buildElement('span', '', item).textContent = labels[`${axis}_${action}`] || action
            if (disabled) item.classList.add(TABLE_CLASSES.DISABLED)

            item.addEventListener('mousedown', keepFocus)
            item.addEventListener('click', () => {
                if (disabled) return
                closeTableMenu(wrap)
                onAction(index, action)
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
