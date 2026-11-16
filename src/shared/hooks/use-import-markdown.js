import { useContext } from 'react'

import { ImportContext } from '@/shared/context/import-context'

export function useImportMarkdown() {
    return useContext(ImportContext)
}
