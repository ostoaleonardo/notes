import { useCallback, useState } from 'react'

export function useMenuAction() {
    const [visible, setVisible] = useState(false)

    const onOpen = useCallback(() => setVisible(true), [])
    const onClose = useCallback(() => setVisible(false), [])

    const trigger = useCallback((action) => {
        setVisible(false)
        action()
    }, [])

    return { visible, onOpen, onClose, trigger }
}
