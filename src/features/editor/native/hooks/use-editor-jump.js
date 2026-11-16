import { useCallback, useState } from 'react'

export function useEditorJump(anchor) {
    const [jump, setJump] = useState(null)

    const onSelectHeading = useCallback((index) => {
        setJump((prev) => ({ index, nonce: (prev?.nonce ?? 0) + 1 }))
    }, [])

    const onJumpToAnchor = useCallback((value) => {
        setJump((prev) => ({ anchor: value, nonce: (prev?.nonce ?? 0) + 1 }))
    }, [])

    return {
        anchor: jump ? jump.anchor : anchor,
        headingIndex: jump?.index,
        jumpNonce: jump?.nonce,
        onSelectHeading,
        onJumpToAnchor
    }
}
