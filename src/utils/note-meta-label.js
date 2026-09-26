import { getFormattedDate } from './formatted-date'

export const buildNoteMetaLabel = ({
    showDate,
    timestamp,
    dateLabel,
    language,
    words,
    wordsLabel,
    charactersLabel
}) => {
    if (showDate) {
        if (!timestamp) return ''
        return `${dateLabel} ${getFormattedDate(timestamp, language)}`
    }

    if (words === 0) return ''
    return `${wordsLabel} · ${charactersLabel}`
}
