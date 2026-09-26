import { getEditorNavigation, getEditorPath } from '../editor-path'

import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

describe('get editor path', () => {
    test('builds a note editor path for a plain id', () => {
        expect(getEditorPath('note-1')).toBe(ROUTES.EDIT_NOTE + 'note-1')
    })

    test('builds a template editor path for a prefixed id', () => {
        const path = getEditorPath(`${TEMPLATE_TAB_PREFIX}Weekly.md`)

        expect(path).toBe(ROUTES.EDIT_TEMPLATE + encodeURIComponent('Weekly.md'))
    })

    test('encodes special characters in the template filename', () => {
        const path = getEditorPath(`${TEMPLATE_TAB_PREFIX}My Template.md`)

        expect(path).toBe(ROUTES.EDIT_TEMPLATE + encodeURIComponent('My Template.md'))
    })
})

describe('get editor navigation', () => {
    test('replaces when a note is already open', () => {
        expect(getEditorNavigation('note-1', 'note-2')).toEqual({ path: ROUTES.EDIT_NOTE + 'note-1', replace: true })
    })

    test('pushes when no note is open yet', () => {
        expect(getEditorNavigation('note-1', '')).toEqual({ path: ROUTES.EDIT_NOTE + 'note-1', replace: false })
    })
})
