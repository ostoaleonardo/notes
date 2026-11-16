import * as DocumentPicker from 'expo-document-picker'

import { useImportMarkdown } from '../../../hooks/use-import-markdown'
import { useSingleFlight } from '../../../hooks/use-single-flight'

export const usePickMarkdownImport = (repositoryId) => {
    const { importFile } = useImportMarkdown()

    return useSingleFlight(async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        if (result.canceled) return

        importFile(result.assets[0].uri, result.assets[0].name, repositoryId)
    })
}
