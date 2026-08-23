import { getFormattedDate } from './formatted-date'

export const getNotesAsString = (notes, lan) => {
    return notes.map((item) => {
        return (
            `[title]:\n${item.title}\n\n`
            + `[note]:\n${item.note}\n\n`
            + `[createdAt]: ${getFormattedDate(item.createdAt, lan)}\n`
            + `[updatedAt]: ${getFormattedDate(item.updatedAt, lan)}\n`
        )
    }).join('\n')
}
