import { WIDGET_PALETTES } from './widget-palette'

export const buildWidgetProps = ({ mode, headingFont, glass, alpha, labels, note }) => ({
    palettes: WIDGET_PALETTES,
    mode,
    headingFont,
    glass: { enabled: glass, alpha },
    labels,
    note
})
