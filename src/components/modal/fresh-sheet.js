import { Fragment, useCallback, useState } from 'react'

import { ModalSheet } from './modal-sheet'

export function FreshSheet({ sheet, snapPoints, children }) {
    const [openCount, setOpenCount] = useState(0)

    const onChange = useCallback((index) => {
        if (index >= 0) setOpenCount((count) => count + 1)
    }, [])

    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={snapPoints}
            onChange={onChange}
        >
            <Fragment key={openCount}>
                {children}
            </Fragment>
        </ModalSheet>
    )
}
