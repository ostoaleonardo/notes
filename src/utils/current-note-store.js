let currentId = ''
const listeners = new Set()

export const getCurrentNoteId = () => currentId

export const setCurrentNoteId = (next) => {
    if (next === currentId) return

    currentId = next
    listeners.forEach((listener) => listener())
}

export const subscribeCurrentNoteId = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}
