import { useState } from 'react'
import { SortMenu } from '@/components'

export function SortAction() {
    const [visible, setVisible] = useState(false)

    const onOpenMenu = () => setVisible(true)
    const onCloseMenu = () => setVisible(false)

    return (
        <SortMenu
            visible={visible}
            onOpen={onOpenMenu}
            onClose={onCloseMenu}
        />
    )
}
