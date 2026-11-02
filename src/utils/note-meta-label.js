const getDateItems = (timestamp, language, dateLabel) => {
    const date = new Date(timestamp)
    const day = date.toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' })
    const time = date.toLocaleTimeString(language, { hour: 'numeric', minute: 'numeric' })

    return [dateLabel, day, time]
}

export const buildNoteMetaLines = ({
    showDate,
    timestamp,
    dateLabel,
    language,
    words,
    wordsLabel,
    charactersLabel
}) => {
    if (showDate) {
        return timestamp ? [getDateItems(timestamp, language, dateLabel)] : []
    }

    if (words === 0) return []

    return [[wordsLabel, charactersLabel]]
}
