import { ROUTES, TEMPLATE_TAB_PREFIX } from '@/constants'

export const getEditorPath = (id) => (
    id.startsWith(TEMPLATE_TAB_PREFIX)
        ? ROUTES.EDIT_TEMPLATE + encodeURIComponent(id.slice(TEMPLATE_TAB_PREFIX.length))
        : ROUTES.EDIT_NOTE + id
)
