import { useContext } from 'react'
import { ImportContext } from '@/context'

export function useImportMarkdown() {
    return useContext(ImportContext)
}
