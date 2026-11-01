import { MD3LightTheme } from 'react-native-paper'

export const SPACING = {
    xxxs: 2,
    xxs: 4,
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40
}

export const RADIUS = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 16,
    xl: 24,
    full: 999
}

export const ICON_SIZE = {
    xs: 10,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 22,
    xxl: 24
}

export const FONT_SIZE = {
    xs: 11,
    sm: 12
}

export const OPACITY = {
    divider: 0.1,
    disabled: 0.4,
    muted: 0.5,
    secondary: 0.6,
    pressed: 0.7,
    emphasized: 0.8,
    strong: 0.85
}

export const BORDER_WIDTH = {
    thin: 1,
    thick: 2
}

export const ANIMATION_DURATION = 200

export const PROGRESS_RANGE = [0, 1]

export const ICON_VIEW_BOX = '0 -960 960 960'

export const ICON_FILL = 'currentColor'

export const FONTS = {
    azeretLight: 'AzeretMono-Light',
    azeretMedium: 'AzeretMono-Medium',
    nType82Headline: 'NType82-Headline',
    geistMedium: 'Geist-Medium'
}

export const DEFAULT_HEADING_FAMILY = FONTS.nType82Headline

export const TYPOGRAPHY_SIZE_VARIANTS = Object.fromEntries(
    Object.entries(MD3LightTheme.fonts).map(([variant, font]) => [variant, font.fontSize])
)

export const BLUR = {
    method: 'dimezisBlurViewSdk31Plus',
    intensity: 80
}
