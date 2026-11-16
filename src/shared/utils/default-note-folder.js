export const resolveDefaultNoteFolder = ({ storedId, activeRepository, descendants }) => {
    const folder = descendants.find((repository) => repository.id === storedId)

    return folder ? folder.id : activeRepository.id
}
