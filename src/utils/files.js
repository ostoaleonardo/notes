import { getFormattedDate } from './getFormattedDate'

export const getNotesAsJson = (notes) => {
    return notes.map((item) => ({
        title: item.title,
        note: item.note,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        biometrics: item.biometrics
    }))
}

export const getNotesAsString = (notes, lan) => {
    return notes.map((item) => {
        let list = ''

        if (item.list && Array.isArray(item.list.items)) {
            list = item.list.items
                .map((it, index) => {
                    console.log(index)
                    switch (item.list.type) {
                        case 'numbered':
                            return `${index + 1}. ${it.value}`
                        case 'bulleted':
                            return `- ${it.value}`
                        case 'checklist':
                            return `[${it.status === 'checked' ? '✅' : '❎'}] ${it.value}`
                        default:
                            return it
                    }
                }).join('\n')
        }

        return (
            `[title]:\n${item.title}\n\n`
            + `[note]:\n${item.note}\n\n`
            + `[list]:\n${list}\n\n`
            + `[createdAt]: ${getFormattedDate(item.createdAt, lan)}\n`
            + `[updatedAt]: ${getFormattedDate(item.updatedAt, lan)}\n`
        )
    }).join('\n')
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
