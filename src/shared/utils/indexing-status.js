let status = null
const listeners = new Set()

export const getIndexingStatus = () => status

export const setIndexingStatus = (next) => {
    status = next
    listeners.forEach((listener) => listener())
}

export const subscribeIndexingStatus = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}
