import { router } from 'expo-router'

import { getEditorNavigation } from '@/utils/editor-path'

export const openEditor = (id, currentId) => {
    const { path, replace } = getEditorNavigation(id, currentId)
    replace ? router.replace(path) : router.push(path)
}
