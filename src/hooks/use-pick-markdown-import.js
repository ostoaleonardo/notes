import * as DocumentPicker from 'expo-document-picker'

import { useImportMarkdown } from './use-import-markdown'
import { useSingleFlight } from './use-single-flight'

export const usePickMarkdownImport = (repositoryId) => {
    const { importFile } = useImportMarkdown()

    return useSingleFlight(async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        importFile(result.assets[0].uri, result.assets[0].name, repositoryId)
    })
}
