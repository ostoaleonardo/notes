import { useEffect } from 'react'
import { useTabs } from './use-tabs'

// closeTab() below navigates away (openTab/router.replace), which removes this same
// still-mounted screen a second time and re-fires 'beforeRemove' before the first
// preventDefault() finishes. The `closing` guard lets that second removal proceed
// natively instead of intercepting it again, which would otherwise loop forever.
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
