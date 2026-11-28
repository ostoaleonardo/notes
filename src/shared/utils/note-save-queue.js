export const createNoteSaveQueue = () => {
    const queues = new Map()
    const stamps = new Map()

    const enqueue = (key, task) => {
        const next = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(task)

        queues.set(key, next)
        next.catch(() => {}).finally(() => {
            if (queues.get(key) === next) queues.delete(key)
        })

        return next
    }

    const withLatestStamp = (previous) => {
        const stamp = previous && stamps.get(previous.path)

        return stamp && stamp.updatedAt >= previous.updatedAt ? { ...previous, ...stamp } : previous
    }

    const rememberStamp = (oldPath, newPath, times) => {
        stamps.delete(oldPath)
        stamps.set(newPath, { updatedAt: times.updatedAt, fileUri: times.fileUri })
    }

    return { enqueue, withLatestStamp, rememberStamp }
}
