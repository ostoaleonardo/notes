import { useContext } from 'react'

import { RecentNotesContext } from '@/context/recent-notes-context'

export function useRecentNotes() {
    return useContext(RecentNotesContext)
}
