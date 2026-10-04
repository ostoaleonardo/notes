export const TASK_CHECKBOX_SELECTOR = 'input.task-list-item-checkbox'
export const TASK_CONTENT_PATTERN = /^\[[^\]\n]\]\s/
export const CUSTOM_TASK_PATTERN = /^\[([^\sxX\]])\]\s/
export const TASK_STATUS_ATTRIBUTE = 'data-task'
export const TASK_LINE_PATTERN = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[)([^\]\n])(\])/
export const TASK_CHECKED_MARK = 'x'
export const TASK_UNCHECKED_MARK = ' '
export const NON_NEWLINE_PATTERN = /[^\n]/g
export const CUSTOM_TASK_LINE_PATTERN = /^([ \t]*(?:>[ \t]*)*(?:[-*+]|\d+[.)])[ \t]+)\[([^\sxX\]])\](?=\s)/gm
export const CUSTOM_TASK_LIVE_CLASS = 'cm-live-task-status'
export const CUSTOM_TASK_MARKER_LENGTH = 3
export const CUSTOM_TASK_STATUS_ATTRIBUTE = 'data-status'
export const CUSTOM_TASK_BOX_SIZE = '16px'
export const CUSTOM_TASK_BOX_RADIUS = '3px'
export const CUSTOM_TASK_GLYPH_SIZE = '12px'
export const CUSTOM_TASK_BOX_MARGIN = '3px 0.5em 3px 4px'
export const TASK_CHECKBOX_TAG_PATTERN = '<input class="task-list-item-checkbox"'
