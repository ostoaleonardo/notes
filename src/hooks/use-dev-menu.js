import { useEffect } from 'react'
import { registerDevMenuItems } from 'expo-dev-menu'
import { useNotes } from './use-notes'
import { useCategories } from './use-categories'
import { usePremium } from './use-premium'

export function useDevMenu() {
    const { deleteAll, addLegacyNotes } = useNotes()
    const { deleteAllCategories } = useCategories()
    const { premium, setPremium } = usePremium()

    useEffect(() => {
        if (!__DEV__) return

        registerDevMenuItems([
            {
                name: 'Delete all notes',
                callback: deleteAll,
                shouldCollapse: true
            },
            {
                name: 'Delete all categories',
                callback: deleteAllCategories,
                shouldCollapse: true
            },
            {
                name: 'Add legacy notes',
                callback: addLegacyNotes,
                shouldCollapse: true
            },
            {
                name: premium ? 'Disable (Pro)' : 'Enable (Pro)',
                callback: () => setPremium(!premium),
                shouldCollapse: true
            }
        ])
    }, [premium])
}
