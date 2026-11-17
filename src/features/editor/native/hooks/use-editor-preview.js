import { useBacklinksHtml } from './use-backlinks-html'

import { EDITOR_MODES } from '@/shared/constants/editor-modes'

export function useEditorPreview({ id, mode, value, showBacklinks }) {
    const reading = mode === EDITOR_MODES.READ
    const backlinksHtml = useBacklinksHtml(id, reading && showBacklinks)

    return { readValue: reading ? value : '', backlinksHtml }
}
