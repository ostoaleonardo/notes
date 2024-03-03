const THEMES = {
    Orange: {
        background: '#09090b',
        foreground: '#18181b',
        primary: '#fb471f',
        text: '#ffffff',
    },
    Violet: {
        background: '#09090b',
        foreground: '#18181b',
        primary: '#8a63d2',
        text: '#ffffff',
    },
    Teal: {
        background: '#09090b',
        foreground: '#18181b',
        primary: '#00bfa5',
        text: '#ffffff',
    },
}

export function getTheme(color) {
    return THEMES[color]
}
