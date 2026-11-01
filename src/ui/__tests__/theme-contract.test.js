import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import { UI_THEME_COLOR_KEYS } from '../tokens/theme-contract'

const COLOR_KEY_PATTERN = /\bcolors\.([a-zA-Z]+)/g
const UI_ROOT = join(__dirname, '..')

const listSources = () => readdirSync(UI_ROOT, { recursive: true })
    .filter((name) => name.endsWith('.js') && !name.includes('__tests__'))
    .map((name) => join(UI_ROOT, name))

const readColorKeys = () => new Set(
    listSources().flatMap((file) => (
        [...readFileSync(file, 'utf8').matchAll(COLOR_KEY_PATTERN)].map((match) => match[1])
    ))
)

describe('ui theme contract', () => {
    test('lists every theme color the components read', () => {
        const missing = [...readColorKeys()].filter((key) => !UI_THEME_COLOR_KEYS.includes(key))

        expect(missing).toEqual([])
    })

    test('has no key that no component reads', () => {
        const used = readColorKeys()
        const unused = UI_THEME_COLOR_KEYS.filter((key) => !used.has(key))

        expect(unused).toEqual([])
    })
})
