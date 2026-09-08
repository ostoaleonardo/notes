import { isAccentAllowed, revertAccentOnProRevoke, toggleAccentSelection } from '../accent'

describe('isAccentAllowed', () => {
    test('allows any accent for a pro user', () => {
        expect(isAccentAllowed('red', true)).toBe(true)
    })

    test('allows the free accent for a non-pro user', () => {
        expect(isAccentAllowed('white', false)).toBe(true)
    })

    test('blocks a paid accent for a non-pro user', () => {
        expect(isAccentAllowed('red', false)).toBe(false)
    })
})

describe('toggleAccentSelection', () => {
    test('deselects the currently active color back to the free accent', () => {
        expect(toggleAccentSelection('red', 'red')).toBe('white')
    })

    test('selects a different color', () => {
        expect(toggleAccentSelection('blue', 'red')).toBe('blue')
    })
})

describe('revertAccentOnProRevoke', () => {
    test('resets a paid accent to the free one when pro is revoked', () => {
        expect(revertAccentOnProRevoke(true, false, 'red')).toBe('white')
    })

    test('keeps the free accent unchanged when pro is revoked', () => {
        expect(revertAccentOnProRevoke(true, false, 'white')).toBe('white')
    })

    test('does not reset while pro is still active', () => {
        expect(revertAccentOnProRevoke(true, true, 'red')).toBe('red')
    })

    test('does not reset on the initial unresolved state (never was pro)', () => {
        expect(revertAccentOnProRevoke(false, false, 'red')).toBe('red')
    })
})
