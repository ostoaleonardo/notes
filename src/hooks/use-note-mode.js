import { useCallback, useState } from 'react'

import { useCodeMode } from './use-code-mode'

import { EDITOR_MODES } from '@/constants/editor-modes'

export function useNoteMode({ initialMode, note, setNote, ...codeModeParams }) {
    const [mode, setMode] = useState(initialMode)

    const codeMode = useCodeMode({ note, setNote, ...codeModeParams })
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
        editorValue: isCodeMode ? codeMode.codeBuffer : note,
        onEditorChange: isCodeMode ? codeMode.onChange : setNote
    }
}
