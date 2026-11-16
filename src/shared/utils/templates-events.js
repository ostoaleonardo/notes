const listeners = new Set()

export const subscribeTemplatesChanged = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export const notifyTemplatesChanged = () => {
    listeners.forEach((listener) => listener())
}
