import { Decoration, WidgetType } from '@codemirror/view'

import { isRangeSelected, overlapsAny } from './utils'

import {
    CUSTOM_TASK_BOX_MARGIN,
    CUSTOM_TASK_BOX_RADIUS,
    CUSTOM_TASK_BOX_SIZE,
    CUSTOM_TASK_GLYPH_SIZE,
    CUSTOM_TASK_LIVE_CLASS,
    TASK_UNCHECKED_MARK
} from '@/constants/tasks'

class CustomTaskWidget extends WidgetType {
    constructor(status, from, to) {
        super()
        this.status = status
        this.from = from
        this.to = to
    }

    eq(other) {
        return other.status === this.status && other.from === this.from && other.to === this.to
    }

    toDOM(view) {
        const box = document.createElement('span')
        box.className = CUSTOM_TASK_LIVE_CLASS
        box.textContent = this.status

        box.addEventListener('mousedown', (event) => event.preventDefault())
        box.addEventListener('click', () => {
            view.dispatch({
                changes: { from: this.from, to: this.to, insert: `[${TASK_UNCHECKED_MARK}]` }
            })
        })

        return box
    }
}

export const decorateCustomTasks = ({ customTaskRanges, selection, ranges, codeRanges }) => {
    for (const { from, to, status } of customTaskRanges) {
        if (isRangeSelected(selection, from, to) || overlapsAny(from, to, codeRanges)) continue

        ranges.push(Decoration.replace({ widget: new CustomTaskWidget(status, from, to) }).range(from, to))
    }
}

export const customTasksTheme = ({ colors }) => ({
    [`.${CUSTOM_TASK_LIVE_CLASS}`]: {
        display: 'inline-block',
        boxSizing: 'border-box',
        width: CUSTOM_TASK_BOX_SIZE,
        height: CUSTOM_TASK_BOX_SIZE,
        lineHeight: CUSTOM_TASK_BOX_SIZE,
        textAlign: 'center',
        verticalAlign: 'middle',
        margin: CUSTOM_TASK_BOX_MARGIN,
        borderRadius: CUSTOM_TASK_BOX_RADIUS,
        backgroundColor: colors.tertiary,
        fontSize: CUSTOM_TASK_GLYPH_SIZE,
        fontWeight: 'bold',
        color: colors.background,
        cursor: 'pointer'
    }
})
