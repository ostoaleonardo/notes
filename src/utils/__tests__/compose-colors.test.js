import { getCheckboxColors, getSwitchColors, getTextFieldColors } from '../compose-colors'

import { TRANSPARENT } from '@/constants/themes'

const colors = {
    tertiary: '#f0f2f1',
    surface: '#111418',
    surfaceVariant: '#1e2124',
    onSurfaceVariant: '#f0f2f1',
    outline: '#ffffff1a',
    background: '#06080a',
    onBackground: '#f0f2f1',
    accentText: '#ff0000'
}

describe('switch colors', () => {
    test('paints the checked track with the accent', () => {
        expect(getSwitchColors(colors).checkedTrackColor).toBe(colors.tertiary)
    })

    test('hides the border of a checked switch', () => {
        expect(getSwitchColors(colors).checkedBorderColor).toBe(TRANSPARENT.color)
    })

    test('outlines an unchecked switch with the theme outline', () => {
        expect(getSwitchColors(colors).uncheckedBorderColor).toBe(colors.outline)
    })

    test('uses the surface variant for the unchecked track', () => {
        expect(getSwitchColors(colors).uncheckedTrackColor).toBe(colors.surfaceVariant)
    })
})

describe('checkbox colors', () => {
    test('fills a checked box with the text color and a contrasting mark', () => {
        const result = getCheckboxColors(colors)

        expect(result.checkedColor).toBe(colors.onBackground)
        expect(result.checkmarkColor).toBe(colors.background)
    })

    test('fades the border of an unchecked box', () => {
        const result = getCheckboxColors(colors)

        expect(result.uncheckedColor).toBe(colors.onBackground + TRANSPARENT[20])
    })
})

describe('text field colors', () => {
    test('keeps the same container in every state', () => {
        const result = getTextFieldColors(colors)

        expect(result.focusedContainerColor).toBe(colors.surfaceVariant)
        expect(result.unfocusedContainerColor).toBe(colors.surfaceVariant)
    })

    test('highlights the indicator, label and cursor with the accent text color', () => {
        const result = getTextFieldColors(colors)

        expect(result.focusedIndicatorColor).toBe(colors.accentText)
        expect(result.focusedLabelColor).toBe(colors.accentText)
        expect(result.cursorColor).toBe(colors.accentText)
    })

    test('mutes the indicator and label when unfocused', () => {
        const result = getTextFieldColors(colors)

        expect(result.unfocusedIndicatorColor).toBe(colors.onBackground + TRANSPARENT[50])
        expect(result.unfocusedLabelColor).toBe(colors.onBackground + TRANSPARENT[60])
    })
})
