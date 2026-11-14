import { DATE_PART_PAD_LENGTH, DATE_PART_PAD_CHAR } from '@/constants/date-format'
import { DAILY_NOTE_TITLE_PATTERN, DAILY_DIRECTIONS } from '@/constants/daily-note'

export const getDailyNoteTitle = (date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(DATE_PART_PAD_LENGTH, DATE_PART_PAD_CHAR)
    const day = String(date.getDate()).padStart(DATE_PART_PAD_LENGTH, DATE_PART_PAD_CHAR)

    return `${year}-${month}-${day}`
}

const resolveDailyNoteRepository = ({ folderId, activeRepository, descendants }, directoryExists) => {
    const selected = [activeRepository, ...descendants].find((repository) => repository.id === folderId)

    if (selected && directoryExists(selected.uri)) return selected

    return directoryExists(activeRepository.uri) ? activeRepository : null
}

export const planDailyNote = ({ title, notes, folderId, activeRepository, descendants }, directoryExists) => {
    const repository = resolveDailyNoteRepository({ folderId, activeRepository, descendants }, directoryExists)
    if (!repository) return null

    const existing = notes.find((note) => note.repositoryId === repository.id && note.title === title)

    return { repository, existing }
}

export const isDailyNoteTitle = (title) => DAILY_NOTE_TITLE_PATTERN.test(title)

export const findAdjacentDailyNote = (notes, current, direction) => {
    if (!current || !isDailyNoteTitle(current.title)) return null

    const dailies = notes.filter((note) => (
        note.repositoryId === current.repositoryId && isDailyNoteTitle(note.title)
    ))

    const isPrevious = direction === DAILY_DIRECTIONS.PREVIOUS
    const candidates = dailies.filter((note) => (
        isPrevious ? note.title < current.title : note.title > current.title
    ))

    if (candidates.length === 0) return null

    return candidates.reduce((best, note) => {
        const isCloser = isPrevious ? note.title > best.title : note.title < best.title
        return isCloser ? note : best
    })
}

export const pickRandomNote = (notes, excludedId, random = Math.random) => {
    const candidates = notes.filter((note) => note.path !== excludedId)
    if (candidates.length === 0) return null

    return candidates[Math.floor(random() * candidates.length)]
}
