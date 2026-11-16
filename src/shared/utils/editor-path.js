import { ANCHOR_PARAM } from '@/shared/constants/block-refs'
import { ROUTES } from '@/shared/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/shared/constants/tabs'

export const getEditorPath = (id, anchor) => {
    if (id.startsWith(TEMPLATE_TAB_PREFIX)) {
        return ROUTES.EDIT_TEMPLATE + encodeURIComponent(id.slice(TEMPLATE_TAB_PREFIX.length))
    }

    const path = ROUTES.EDIT_NOTE + encodeURIComponent(id)
    return anchor ? `${path}?${ANCHOR_PARAM}=${encodeURIComponent(anchor)}` : path
}

export const getEditorNavigation = (id, currentId) => ({
    path: getEditorPath(id),
    replace: !!currentId
})
