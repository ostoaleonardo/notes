export const resolveDefaultNoteFolder = ({ storedId, activeFolder, descendants }) => {
    const folder = descendants.find((folder) => folder.id === storedId)

    return folder ? folder.id : activeFolder.id
}
