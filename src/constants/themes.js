import { TRANSPARENT } from '@/ui/tokens/transparent'

export const COLORS = {
    base: {
        white: '#f0f2f1',
        red: '#c8102e',
        yellow: '#ffc700',
        blue: '#002f6c',
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

export { TRANSPARENT }

const darkTheme = {
    dark: true,
    colors: {
        ...COLORS.base,

        error: '#ffb4ab',
        errorContainer: '#93000a',
        onErrorContainer: '#ffdad6',

        primary: COLORS.dark.onBackground,
        onPrimary: COLORS.dark.background,

        primaryContainer: COLORS.dark.onBackground,

        secondary: COLORS.dark.foreground,
        onSecondary: COLORS.base.white,

        secondaryContainer: COLORS.dark.foreground,
        onSecondaryContainer: COLORS.dark.onBackground,

        tertiary: COLORS.dark.onBackground,
        onTertiary: COLORS.dark.onBackground,
        accentText: COLORS.dark.onBackground,

        background: COLORS.dark.background,
        onBackground: COLORS.dark.onBackground,

        surface: COLORS.dark.foreground,
        surfaceVariant: COLORS.dark.surfaceVariant,
        onSurface: COLORS.dark.onBackground,
        onSurfaceVariant: COLORS.dark.onBackground,

        outline: COLORS.base.white + TRANSPARENT[10],
        backdrop: COLORS.dark.background + TRANSPARENT[70]
    }
}

const lightTheme = {
    dark: false,
    colors: {
        ...COLORS.base,

        error: '#ba1a1a',
        errorContainer: '#ffdad6',
        onErrorContainer: '#410002',

        primary: COLORS.light.onBackground,
        onPrimary: COLORS.base.white,

        secondary: COLORS.light.foreground,
        onSecondary: COLORS.base.white,

        secondaryContainer: COLORS.base.white,
        onSecondaryContainer: COLORS.light.onBackground,

        tertiary: COLORS.light.onBackground,
        onTertiary: COLORS.base.white,
        accentText: COLORS.light.onBackground,

        background: COLORS.light.background,
        onBackground: COLORS.light.onBackground,

        surface: COLORS.light.foreground,
        surfaceVariant: COLORS.light.surfaceVariant,
        onSurface: COLORS.light.onBackground,
        onSurfaceVariant: COLORS.light.onBackground,

        outline: COLORS.light.onBackground + TRANSPARENT[10],
        backdrop: COLORS.light.onBackground + TRANSPARENT[70]
    }
}

export const THEMES = {
    light: lightTheme,
    dark: darkTheme
}

export const THEME_COLORS = {
    light: {
        color: COLORS.light.background,
        background: COLORS.light.background,
        borderColor: COLORS.light.background
    },
    dark: {
        color: COLORS.dark.onBackground,
        background: COLORS.dark.background,
        borderColor: COLORS.base.white + TRANSPARENT[5]
    },
    system: {
        color: COLORS.dark.onBackground,
        background: COLORS.dark.foreground,
        borderColor: COLORS.base.white + TRANSPARENT[5]
    }
}

export const ACCENT_COLORS = {
    white: {
        background: COLORS.dark.onBackground,
        onBackground: COLORS.dark.background,
        borderColor: COLORS.dark.onBackground
    },
    red: {
        background: COLORS.base.red,
        onBackground: COLORS.dark.onBackground,
        borderColor: COLORS.base.red
    },
    yellow: {
        background: COLORS.base.yellow,
        onBackground: COLORS.dark.background,
        borderColor: COLORS.base.yellow
    },
    blue: {
        background: COLORS.base.blue,
        onBackground: COLORS.dark.onBackground,
        borderColor: COLORS.base.blue
    }
}
