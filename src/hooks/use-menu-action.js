import { useCallback, useState } from 'react'

export function useMenuAction() {
    const [visible, setVisible] = useState(false)

    const onOpen = useCallback(() => setVisible(true), [])
    const onClose = useCallback(() => setVisible(false), [])

    const trigger = useCallback((action) => {
        setVisible(false)

        if (typeof action === 'function') action()
    }, [])

    return { visible, onOpen, onClose, trigger }
}
