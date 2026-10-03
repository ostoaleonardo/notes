import { useRef, useState } from 'react'

import { useMenuAction } from './use-menu-action'

export function useMenuAnchor() {
    const rowRef = useRef(null)
    const menu = useMenuAction()
    const [anchor, setAnchor] = useState({ x: 0, y: 0 })

    const onPressRow = () => {
        rowRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x: x + width, y: y + height })
            menu.onOpen()
        })
    }

    return { rowRef, anchor, onPressRow, ...menu }
}
