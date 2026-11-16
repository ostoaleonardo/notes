import { useCallback, useState } from 'react'

import { useCodeMode } from './use-code-mode'

import { EDITOR_MODES } from '@/constants/editor-modes'

export function useNoteMode({ initialMode, content, update, setNote }) {
    const [mode, setMode] = useState(initialMode)

    const codeMode = useCodeMode({ content, update })
    const { enter } = codeMode

    const onSetMode = useCallback((nextMode) => {
        if (nextMode === mode) return

        if (nextMode === EDITOR_MODES.CODE) enter()

        setMode(nextMode)
    }, [mode, enter])

    const isCodeMode = mode === EDITOR_MODES.CODE

    return {
        mode,
        onSetMode,
        editorValue: isCodeMode ? codeMode.codeBuffer : content.note,
        onEditorChange: isCodeMode ? codeMode.onChange : setNote
    }
}
