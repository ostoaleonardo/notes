import { Fragment, useCallback, useState } from 'react'

import { ModalBottomSheet } from './modal-bottom-sheet'

export const FreshSheet = ({
    sheet,
    snapPoints,
    children
}) => {
    const [openCount, setOpenCount] = useState(0)

    const onChange = useCallback((index) => {
        if (index >= 0) setOpenCount((count) => count + 1)
    }, [])

    return (
        <ModalBottomSheet
            ref={sheet.ref}
            snapPoints={snapPoints}
            onChange={onChange}
        >
            <Fragment key={openCount}>
                {children}
            </Fragment>
        </ModalBottomSheet>
    )
}
