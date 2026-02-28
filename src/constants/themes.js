import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

export const COLORS = {
    base: {
        white: '#f0f2f1',
        accent: '#c8102e',
        transparent: 'transparent'
    },
    light: {
        background: '#d7d8d8',
        onBackground: '#06080a',
        foreground: '#e7e9e9',
        surfaceVariant: '#d7d8d8'
    },
    dark: {
        background: '#06080a',
        onBackground: '#f0f2f1',
        foreground: '#121318',
        surfaceVariant: '#1e2124'
    }
}

export const TRANSPARENT = {
    'color': 'transparent',
    '0': '00',
    '5': '0d',
    '10': '1a',
    '20': '33',
    '30': '4d',
    '40': '66',
    '50': '80',
    '60': '99',
    '70': 'b3',
    '80': 'cc',
    '90': 'e6',
    '95': 'f2',
    '100': 'ff'
}

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...COLORS.base,

        primary: COLORS.dark.onBackground,
        onPrimary: COLORS.dark.background,

        primaryContainer: COLORS.dark.onBackground,

        secondary: COLORS.dark.foreground,
        onSecondary: COLORS.base.white,

        secondaryContainer: COLORS.dark.foreground,
        onSecondaryContainer: COLORS.dark.onBackground,

        tertiary: COLORS.base.accent,
        onTertiary: COLORS.dark.onBackground,

        background: COLORS.dark.background,
        onBackground: COLORS.dark.onBackground,

        surface: COLORS.dark.foreground,
        surfaceVariant: COLORS.dark.surfaceVariant,
        onSurface: COLORS.dark.onBackground,
        onSurfaceVariant: COLORS.dark.onBackground,

        outline: COLORS.base.white + TRANSPARENT[10],
        backdrop: COLORS.dark.background + TRANSPARENT[70],

        elevation: {
            level3: COLORS.dark.foreground
        }
    }
}

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...COLORS.base,

        primary: COLORS.light.onBackground,
        onPrimary: COLORS.base.white,

        secondary: COLORS.light.foreground,
        onSecondary: COLORS.base.white,

        secondaryContainer: COLORS.base.white,
        onSecondaryContainer: COLORS.light.onBackground,

        tertiary: COLORS.base.accent,
        onTertiary: COLORS.base.white,

        background: COLORS.light.background,
        onBackground: COLORS.light.onBackground,

        surface: COLORS.light.foreground,
        surfaceVariant: COLORS.light.surfaceVariant,
        onSurface: COLORS.light.onBackground,
        onSurfaceVariant: COLORS.light.onBackground,

        outline: COLORS.light.onBackground,
        outlineVariant: COLORS.light.onBackground,
        backdrop: COLORS.light.onBackground + TRANSPARENT[70],

        elevation: {
            level3: COLORS.light.foreground
        }
    }
}

export const COMMONS = {
    radius: 16
}

export const THEMES = {
    light: lightTheme,
    dark: darkTheme
}

export const FONTS = {
    azeretLight: 'AzeretMono-Light',
    azeretMedium: 'AzeretMono-Medium',
    azeretItalic: 'AzeretMono-Italic',
    nType82Headline: 'NType82-Headline'
}
