import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'

const white = '#f0f2f1'

export const COLORS = {
    common: {
        accent: '#c8102e',
        transparent: 'transparent',
        white: white,
        white15: `${white}26`
    },
    light: {
        background: '#d7d8d8',
        onBackground: '#06080a',
        foreground: '#e7e9e9'
    },
    dark: {
        background: '#06080a',
        onBackground: '#f0f2f2',
        foreground: '#121318'
    }
}

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...COLORS.common,

        primary: COLORS.dark.foreground,
        onPrimary: COLORS.common.white,

        secondary: COLORS.dark.foreground,
        onSecondary: COLORS.common.white,

        tertiary: COLORS.common.accent,
        onTertiary: COLORS.common.white,

        background: COLORS.dark.background,
        onBackground: COLORS.dark.onBackground,

        outline: COLORS.common.white15,
        surface: COLORS.dark.foreground
    }
}

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...COLORS.common,

        primary: COLORS.light.onBackground,
        onPrimary: COLORS.light.background,

        secondary: COLORS.light.foreground,
        onSecondary: COLORS.common.white,

        tertiary: COLORS.common.accent,
        onTertiary: COLORS.common.white,

        background: COLORS.light.background,
        onBackground: COLORS.light.onBackground,

        outline: COLORS.light.onBackground,
        surface: COLORS.light.foreground
    }
}

export const THEMES = {
    light: lightTheme,
    dark: darkTheme
}

export const FONTS = {
    azeretLight: 'AzeretMono-Light',
    azeretMedium: 'AzeretMono-Medium'
}
