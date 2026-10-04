export const getDailyNoteTitle = (date = new Date()) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

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
