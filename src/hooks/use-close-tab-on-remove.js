import { useEffect } from 'react'
import { useTabs } from './use-tabs'

export function useCloseTabOnRemove(navigation, id) {
    const { closeTab } = useTabs()

    useEffect(() => {
        let closing = false

        const unsubscribe = navigation.addListener('beforeRemove', (event) => {
            if (closing) return

            event.preventDefault()
            closing = true
            closeTab(id)
        })

        return unsubscribe
    }, [navigation, id])
}
