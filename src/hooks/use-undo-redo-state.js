import { useCallback, useState } from 'react'

export const useUndoRedoState = () => {
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    const onHistoryChange = useCallback(({ canUndo, canRedo }) => {
        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    return { canUndo, canRedo, onHistoryChange }
}
