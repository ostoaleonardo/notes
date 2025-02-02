import { randomUUID } from 'expo-crypto'
import * as DocumentPicker from 'expo-document-picker'
import { EncodingType, readAsStringAsync, StorageAccessFramework, writeAsStringAsync } from 'expo-file-system'
import { useNotes } from './useNotes'
import { getNotesAsJson, getNotesAsString, validateJson } from '@/utils'
import { DEFAULT_NOTE_CATEGORIES } from '@/constants'

export function useFiles() {
    const { notes, saveNotes } = useNotes()

    const fileTypes = {
        json: {
            name: 'notes.json',
            content: JSON.stringify(getNotesAsJson(notes))
        },
        txt: {
            name: 'notes.txt',
            content: getNotesAsString(notes)
        }
    }

    const importFile = async () => {
        let code = 'canceled'

        try {
            const { assets, canceled } = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            })

            if (!canceled) {
                const { uri } = assets[0]

                const fileContent = await readAsStringAsync(uri, {
                    encoding: EncodingType.UTF8
                })

                if (fileContent) {
                    let file

                    try {
                        file = JSON.parse(fileContent)
                        code = validateJson(file)
                        console.log('code', code)

                        if (code === 'ok') {
                            const backup = file.map((note) => ({
                                id: randomUUID(),
                                categories: DEFAULT_NOTE_CATEGORIES,
                                ...note
                            }))

                            if (backup.length) {
                                saveNotes(backup)
                            }
                        }
                    } catch (error) {
                        code = 'error'
                    }
                }
            }

            return code
        } catch (error) {
            return 'error'
        }
    }

    const exportFile = async (type) => {
        let code = 'canceled'

        const { fileName, fileContent } = getFileBackup(type)

        try {
            const { directoryUri, granted } = await StorageAccessFramework.requestDirectoryPermissionsAsync()

            if (granted) {
                await StorageAccessFramework
                    .createFileAsync(directoryUri, fileName, EncodingType.UTF8)
                    .then(async (fileUri) => {
                        await writeAsStringAsync(fileUri, fileContent, {
                            encoding: EncodingType.UTF8
                        })
                    })
                    .then(() => code = 'ok')
                    .catch(e => console.log(e))
            }

            return code
        } catch (error) {
            return 'error'
        }
    }

    const getFileBackup = (type) => {
        switch (type) {
            case 'json':
                return {
                    fileName: 'notes.json',
                    fileContent: JSON.stringify(getNotesAsJson(notes))
                }
            case 'txt':
                return {
                    fileName: 'notes.txt',
                    fileContent: getNotesAsString(notes)
                }
            default:
                return null
        }
    }

    return { importFile, exportFile }
}
