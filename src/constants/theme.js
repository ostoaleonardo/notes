import { getTheme } from '../utils'

const theme = getTheme()

const PRIMARY = '#fb471f'
const TEXT = '#ffffff'
const BACKGROUND = '#09090b'
const FOREGROUND = '#18181b'

export const colors = {
    background: BACKGROUND,
    foreground: FOREGROUND,

    primary: PRIMARY,
    primary15: `${PRIMARY}26`,

    text: TEXT,
    text50: `${TEXT}80`,
    text15: `${TEXT}26`,
    text5: `${TEXT}0D`
}

export const fonts = {
    mono: 'Roboto-Mono',
}
