import { useState } from 'react'
import { MoreMenu } from '@/components'

export function MoreAction() {
    const [visible, setVisible] = useState(false)

    const onOpenMenu = () => setVisible(true)
    const onCloseMenu = () => setVisible(false)

    return (
        <MoreMenu
            visible={visible}
            onOpen={onOpenMenu}
            onClose={onCloseMenu}
        />
    )
}
