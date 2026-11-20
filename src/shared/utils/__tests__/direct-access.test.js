import { shouldPromptDirectAccess } from '../direct-access'

const MIN_NOTES = 500

const prompt = (overrides) => shouldPromptDirectAccess({
    granted: false,
    dismissed: false,
    noteCount: MIN_NOTES,
    minNotes: MIN_NOTES,
    ...overrides
})

describe('direct access prompt', () => {
    test('shows for a large folder without the permission', () => {
        expect(prompt()).toBe(true)
    })

    test('stays hidden once the permission is granted', () => {
        expect(prompt({ granted: true })).toBe(false)
    })

    test('stays hidden after the user dismissed it', () => {
        expect(prompt({ dismissed: true })).toBe(false)
    })

    test('stays hidden for small repositories', () => {
        expect(prompt({ noteCount: MIN_NOTES - 1 })).toBe(false)
    })
})
