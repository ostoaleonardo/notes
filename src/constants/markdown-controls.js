import { AttachFile } from '@/icons/attach-file'
import { CalendarToday } from '@/icons/calendar-today'
import { Checklist } from '@/icons/checklist'
import { CollapseContent } from '@/icons/collapse-content'
import { Code } from '@/icons/code'
import { DataArray } from '@/icons/data-array'
import { FormaQuote } from '@/icons/forma-quote'
import { FormatBold } from '@/icons/format-bold'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { FormatListNumbered } from '@/icons/format-list-numbered'
import { FormatIndentDecrease } from '@/icons/format-indent-decrease'
import { FormatIndentIncrease } from '@/icons/format-indent-increase'
import { FormatH1 } from '@/icons/format-h1'
import { FormatH2 } from '@/icons/format-h2'
import { FormatH3 } from '@/icons/format-h3'
import { FormatH4 } from '@/icons/format-h4'
import { FormatH5 } from '@/icons/format-h5'
import { FormatH6 } from '@/icons/format-h6'
import { FormatItalic } from '@/icons/format-italic'
import { FormatStrikethrough } from '@/icons/format-strikethrough'
import { HorizontalRule } from '@/icons/horizontal-rule'
import { Link } from '@/icons/link'
import { Picture } from '@/icons/picture'
import { Schedule } from '@/icons/schedule'
import { Table } from '@/icons/table'
import { Title } from '@/icons/title'

import { TEMPLATE_SCOPE } from '@/constants/toolbar'
import { MARKDOWN_ACTIONS } from '@/constants/markdown-actions'

const MARKDOWN_GROUP_KEYS = {
    HEADING: 'heading',
    LIST: 'list',
    INSERT: 'insert'
}

export const MARKDOWN_GROUPS = {
    [MARKDOWN_GROUP_KEYS.HEADING]: {
        Icon: FormatH1,
        items: [
            { action: MARKDOWN_ACTIONS.H0, Icon: Title },
            { action: MARKDOWN_ACTIONS.H1, Icon: FormatH1 },
            { action: MARKDOWN_ACTIONS.H2, Icon: FormatH2 },
            { action: MARKDOWN_ACTIONS.H3, Icon: FormatH3 },
            { action: MARKDOWN_ACTIONS.H4, Icon: FormatH4 },
            { action: MARKDOWN_ACTIONS.H5, Icon: FormatH5 },
            { action: MARKDOWN_ACTIONS.H6, Icon: FormatH6 }
        ]
    },
    [MARKDOWN_GROUP_KEYS.LIST]: {
        Icon: FormatListBulleted,
        items: [
            { action: MARKDOWN_ACTIONS.LIST_BULLET, Icon: FormatListBulleted },
            { action: MARKDOWN_ACTIONS.LIST_ORDERED, Icon: FormatListNumbered },
            { action: MARKDOWN_ACTIONS.LIST_CHECKLIST, Icon: Checklist }
        ]
    },
    [MARKDOWN_GROUP_KEYS.INSERT]: {
        Icon: AttachFile,
        items: [
            { action: MARKDOWN_ACTIONS.IMAGE, Icon: Picture },
            { action: MARKDOWN_ACTIONS.LINK, Icon: Link },
            { action: MARKDOWN_ACTIONS.TABLE, Icon: Table }
        ]
    }
}

export const MARKDOWN_CONTROLS = [
    { action: MARKDOWN_ACTIONS.WIKI_LINK, Icon: DataArray },
    { action: MARKDOWN_ACTIONS.FOLD, Icon: CollapseContent },
    { divider: true },
    { group: MARKDOWN_GROUP_KEYS.HEADING },
    { action: MARKDOWN_ACTIONS.BOLD, Icon: FormatBold },
    { action: MARKDOWN_ACTIONS.ITALIC, Icon: FormatItalic },
    { action: MARKDOWN_ACTIONS.STRIKE, Icon: FormatStrikethrough },
    { divider: true },
    { group: MARKDOWN_GROUP_KEYS.LIST },
    { action: MARKDOWN_ACTIONS.OUTDENT, Icon: FormatIndentDecrease },
    { action: MARKDOWN_ACTIONS.INDENT, Icon: FormatIndentIncrease },
    { divider: true },
    { group: MARKDOWN_GROUP_KEYS.INSERT },
    { action: MARKDOWN_ACTIONS.CODE, Icon: Code },
    { action: MARKDOWN_ACTIONS.QUOTE, Icon: FormaQuote },
    { action: MARKDOWN_ACTIONS.HR, Icon: HorizontalRule },
    { divider: true, scope: TEMPLATE_SCOPE },
    { action: MARKDOWN_ACTIONS.INSERT_DATE, Icon: CalendarToday, scope: TEMPLATE_SCOPE },
    { action: MARKDOWN_ACTIONS.INSERT_TIME, Icon: Schedule, scope: TEMPLATE_SCOPE },
    { action: MARKDOWN_ACTIONS.INSERT_TITLE, Icon: Title, scope: TEMPLATE_SCOPE }
]
