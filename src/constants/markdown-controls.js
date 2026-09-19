import { CalendarToday } from '@/icons/calendar-today'
import { Checklist } from '@/icons/checklist'
import { CollapseContent } from '@/icons/collapse-content'
import { Code } from '@/icons/code'
import { DataArray } from '@/icons/data-array'
import { FormaQuote } from '@/icons/forma-quote'
import { FormatBold } from '@/icons/format-bold'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { FormatListNumbered } from '@/icons/format-list-numbered'
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

export const MARKDOWN_CONTROLS = [
    { action: 'wiki-link', Icon: DataArray },
    { action: 'fold', Icon: CollapseContent },
    { divider: true },
    { action: 'bold', Icon: FormatBold },
    { action: 'italic', Icon: FormatItalic },
    { action: 'strike', Icon: FormatStrikethrough },
    { action: 'h1', Icon: FormatH1 },
    { action: 'h2', Icon: FormatH2 },
    { action: 'h3', Icon: FormatH3 },
    { action: 'h4', Icon: FormatH4 },
    { action: 'h5', Icon: FormatH5 },
    { action: 'h6', Icon: FormatH6 },
    { divider: true },
    { action: 'list-bullet', Icon: FormatListBulleted },
    { action: 'list-ordered', Icon: FormatListNumbered },
    { action: 'list-checklist', Icon: Checklist },
    { divider: true },
    { action: 'quote', Icon: FormaQuote },
    { action: 'code', Icon: Code },
    { action: 'hr', Icon: HorizontalRule },
    { action: 'image', Icon: Picture },
    { action: 'link', Icon: Link },
    { action: 'table', Icon: Table },
    { divider: true, scope: 'template' },
    { action: 'insert-date', Icon: CalendarToday, scope: 'template' },
    { action: 'insert-time', Icon: Schedule, scope: 'template' },
    { action: 'insert-title', Icon: Title, scope: 'template' }
]
