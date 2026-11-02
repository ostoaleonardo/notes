import { THEMES } from '@/constants/themes'
import { UI_THEME_COLOR_KEYS } from '@/ui/tokens/theme-contract'
import { getButtonColors } from '@/ui/utils/compose-colors'

const BUTTON_VARIANTS = ['text', 'filled', 'tonal']

describe('app themes against the ui contract', () => {
    test.each(Object.keys(THEMES))('the %s theme provides every color the ui reads', (name) => {
        const missing = UI_THEME_COLOR_KEYS.filter((key) => !THEMES[name].colors[key])

        expect(missing).toEqual([])
    })

    test.each(Object.keys(THEMES))('the %s theme builds valid button colors', (name) => {
        BUTTON_VARIANTS.forEach((variant) => {
            const values = Object.values(getButtonColors(THEMES[name].colors, variant))

            expect(values.filter((value) => value.includes('undefined'))).toEqual([])
        })
    })
})
