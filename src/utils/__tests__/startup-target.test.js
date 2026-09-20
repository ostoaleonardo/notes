import { getStartupTarget } from '../startup-target'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'
import { ROUTES } from '@/constants/routes'

test('home behavior never navigates to a note', () => {
    expect(getStartupTarget(STARTUP_BEHAVIORS.HOME, 'note-1')).toBe(null)
})

test('new note behavior always opens the new note screen', () => {
    expect(getStartupTarget(STARTUP_BEHAVIORS.NEW_NOTE, 'note-1')).toBe(ROUTES.ADD_NOTE)
})

test('daily note behavior always opens the daily note route', () => {
    expect(getStartupTarget(STARTUP_BEHAVIORS.DAILY_NOTE, 'note-1')).toBe(ROUTES.DAILY_NOTE)
})

test('last opened behavior opens the editor path for the current note', () => {
    expect(getStartupTarget(STARTUP_BEHAVIORS.LAST_OPENED, 'note-1')).toBe('/notes/note-1')
})

test('last opened behavior with no current note resolves to nothing', () => {
    expect(getStartupTarget(STARTUP_BEHAVIORS.LAST_OPENED, '')).toBe(null)
})
