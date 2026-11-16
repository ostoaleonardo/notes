export const withBusy = async (busyRef, fn) => {
    busyRef.current = true

    try {
        return await fn()
    } finally {
        busyRef.current = false
    }
}
