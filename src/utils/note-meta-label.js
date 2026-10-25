import { META_TOKEN_TYPES } from '@/constants/note-meta'

const { TEXT, FILLED } = META_TOKEN_TYPES

const token = (type, value) => ({ type, value })

const stripCount = (label, count) => label.replace(String(count), '').trim()

const getDateTokens = (timestamp, language, dateLabel) => {
    const date = new Date(timestamp)
    const day = date.toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' })

    return [
        token(TEXT, dateLabel),
        token(TEXT, day),
        token(FILLED, date.toLocaleTimeString(language, { hour: 'numeric', minute: 'numeric' }))
    ]
}

const getCountTokens = (count, label) => [
    token(FILLED, String(count)),
    token(TEXT, stripCount(label, count))
]

export const buildNoteMetaLines = ({
    showDate,
    timestamp,
    dateLabel,
    language,
    words,
    characters,
    wordsLabel,
    charactersLabel
}) => {
    if (showDate) {
        return timestamp ? [getDateTokens(timestamp, language, dateLabel)] : []
    }

    if (words === 0) return []

    return [[
        ...getCountTokens(words, wordsLabel),
        ...getCountTokens(characters, charactersLabel)
    ]]
}
