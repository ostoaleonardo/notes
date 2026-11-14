export const mergeLoadedNotes = (loaded, snapshot, current) => {
    if (current === snapshot) return loaded

    const snapshotByPath = new Map(snapshot.map((note) => [note.path, note]))
    const currentByPath = new Map(current.map((note) => [note.path, note]))
    const loadedPaths = new Set(loaded.map((note) => note.path))

    const createdMeanwhile = current.filter((note) => (
        !snapshotByPath.has(note.path) && !loadedPaths.has(note.path)
    ))

    const reconciled = loaded.flatMap((note) => {
        const live = currentByPath.get(note.path)
        const before = snapshotByPath.get(note.path)

        if (!live) return before ? [] : [note]
        return [live === before ? note : live]
    })

    return [...createdMeanwhile, ...reconciled]
}
