import { expandSelected, getMinWidth } from '../toggle-group'
import { ICON_TOGGLE } from '@/constants/components'

describe('expand the selected button', () => {
    const buttons = [
        { label: 'One', selected: true },
        { label: 'Two' }
    ]

    test('shows the label only on the selected button', () => {
        expect(expandSelected(buttons).map((button) => button.showLabel)).toEqual([true, false])
    })

    test('keeps the icon size constant on every button', () => {
        const sizes = expandSelected(buttons).map((button) => button.iconSize)

        expect(sizes).toEqual([ICON_TOGGLE.iconSize, ICON_TOGGLE.iconSize])
    })

    test('flags every button as expandable', () => {
        expect(expandSelected(buttons).every((button) => button.expandable)).toBe(true)
    })

    test('does not mutate the original buttons', () => {
        expandSelected(buttons)

        expect(buttons[0]).toEqual({ label: 'One', selected: true })
    })
})

describe('minimum width shared by labeled buttons', () => {
    const buttons = [
        { label: 'One', showLabel: true },
        { label: 'Two', showLabel: true },
        { label: 'Icon', showLabel: false }
    ]

    test('uses the widest measured labeled button', () => {
        expect(getMinWidth(buttons, { One: 80, Two: 120, Icon: 300 })).toBe(120)
    })

    test('ignores buttons that have not been measured yet', () => {
        expect(getMinWidth(buttons, { One: 80 })).toBe(80)
    })

    test('is zero when nothing is measured', () => {
        expect(getMinWidth(buttons, {})).toBe(0)
    })
})
