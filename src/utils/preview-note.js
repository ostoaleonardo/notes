export const getPreviewNote = (note) => {
    return note.split('\n').slice(0, 5).join('\n').length > 150
        ? note.split('\n').slice(0, 5).join('\n').slice(0, 150) + '...'
        : note.split('\n').slice(0, 5).join('\n')
}
