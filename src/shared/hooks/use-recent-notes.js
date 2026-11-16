import { useContext } from 'react'

import { RecentNotesContext } from '@/shared/context/recent-notes-context'

export function useRecentNotes() {
    return useContext(RecentNotesContext)
}
