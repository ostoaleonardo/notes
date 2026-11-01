import { THEMES } from '@/constants/themes'
import { UI_THEME_COLOR_KEYS } from '@/ui/tokens/theme-contract'

describe('app themes against the ui contract', () => {
    test.each(Object.keys(THEMES))('the %s theme provides every color the ui reads', (name) => {
        const missing = UI_THEME_COLOR_KEYS.filter((key) => !THEMES[name].colors[key])

        expect(missing).toEqual([])
    })
})
