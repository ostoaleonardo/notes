import { router } from 'expo-router'

import { getEditorNavigation } from '@/utils/editor-path'
import { pushOnce } from '@/utils/navigation'

export const openEditor = (id, currentId) => {
    const { path, replace } = getEditorNavigation(id, currentId)
    replace ? router.replace(path) : pushOnce(path)
}
