import { useContext } from 'react'

import { ImportContext } from '@/context/import-context'

export function useImportMarkdown() {
    return useContext(ImportContext)
}
