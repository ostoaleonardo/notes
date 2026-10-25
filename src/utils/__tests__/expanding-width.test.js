import { getTargetWidth } from '../expanding-width'
import { CONTROL_SIZE, ICON_TOGGLE } from '@/constants/components'

describe('target width of an expanding button', () => {
    test('collapses to the square button size', () => {
        expect(getTargetWidth(false, 120)).toBe(CONTROL_SIZE.small)
    })

    test('collapses even before the content is measured', () => {
        expect(getTargetWidth(false, null)).toBe(CONTROL_SIZE.small)
    })

    test('expands to the content plus the label padding', () => {
        expect(getTargetWidth(true, 90)).toBe(90 + ICON_TOGGLE.labelPaddingTotal)
    })

    test('waits for the content measure before expanding', () => {
        expect(getTargetWidth(true, null)).toBeNull()
    })
})
