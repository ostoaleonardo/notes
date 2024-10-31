export const getNotesAsJson = (notes) => {
    return notes.map((item) => ({
        title: item.title,
        note: item.note,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        biometrics: item.biometrics
    }))
}

export const getNotesAsString = (notes) => {
    return notes.map((item) => (
        `title: ${item.title}\n`
        + `note: ${item.note}\n`
        + `categories: ${item.categories}\n`
        + `createdAt: ${item.createdAt}\n`
        + `updatedAt: ${item.updatedAt}\n`
        + `biometrics: ${item.biometrics}\n`
        + `password: ${item.password}\n`
    )).join('\n')
}

export const validateJson = (file) => {
    try {
        if (!Array.isArray(file)) {
            return 'isNotArray'
        }

        for (const note of file) {
            if (typeof note.title !== 'string') {
                return 'errorTitle'
            }

            if (typeof note.note !== 'string') {
                return 'errorNote'
            }

            if (typeof note.createdAt !== 'number') {
                return 'errorCreatedAt'
            }

            if (typeof note.biometrics !== 'boolean') {
                return 'errorBiometrics'
            }
        }

        return 'ok'
    } catch (error) {
        return 'error'
    }
}
