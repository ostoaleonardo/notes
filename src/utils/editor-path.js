import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export const getEditorPath = (id) => (
    id.startsWith(TEMPLATE_TAB_PREFIX)
        ? ROUTES.EDIT_TEMPLATE + encodeURIComponent(id.slice(TEMPLATE_TAB_PREFIX.length))
        : ROUTES.EDIT_NOTE + id
)

export const getEditorNavigation = (id, currentId) => ({
    path: getEditorPath(id),
    replace: !!currentId
})
