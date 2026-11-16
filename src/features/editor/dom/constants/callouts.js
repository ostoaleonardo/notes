export const CALLOUT_PATTERN = /^\[!([\w-]+)\]([+-])?[ \t]*(.*)$/
export const CALLOUT_QUOTE_HEAD_PATTERN = /^>\s*(\[!([\w-]+)\][+-]?)/

export const CALLOUT_CLASS = 'callout'
export const CALLOUT_TITLE_CLASS = 'callout-title'
export const CALLOUT_TYPE_CLASS_PREFIX = 'callout-'
export const CALLOUT_LIVE_CLASS = 'cm-live-callout'
export const CALLOUT_LIVE_TITLE_CLASS = 'cm-live-callout-title'
export const CALLOUT_LIVE_TYPE_CLASS_PREFIX = 'cm-live-callout-'

export const CALLOUT_DEFAULT_TYPE = 'note'
export const CALLOUT_FOLD_OPEN = '+'

export const CALLOUT_TYPE_ALIASES = {
    summary: 'abstract',
    tldr: 'abstract',
    hint: 'tip',
    important: 'tip',
    check: 'success',
    done: 'success',
    help: 'question',
    faq: 'question',
    caution: 'warning',
    attention: 'warning',
    fail: 'failure',
    missing: 'failure',
    error: 'danger',
    cite: 'quote'
}

export const CALLOUT_COLORS = {
    note: '#448aff',
    abstract: '#00b0ff',
    info: '#00b8d4',
    todo: '#00b8d4',
    tip: '#00bfa5',
    success: '#00c853',
    question: '#64dd17',
    warning: '#ff9100',
    failure: '#ff5252',
    danger: '#ff1744',
    bug: '#f50057',
    example: '#7c4dff',
    quote: '#9e9e9e'
}
