import { useContext } from 'react'

import { ThemeContext } from '@/components/markdown/markdown-dom-theme-context'

import { ICON_FILL, ICON_SIZE, ICON_VIEW_BOX, OPACITY } from '@/constants/theme'

export const DomIcon = ({ path, size = ICON_SIZE.md, color, style, onClick }) => (
    <svg
        width={size}
        height={size}
        viewBox={ICON_VIEW_BOX}
        fill={ICON_FILL}
        style={{ color, flexShrink: 0, ...style }}
        onClick={onClick}
    >
        <path d={path} />
    </svg>
)

export const PropertyIcon = ({ path }) => {
    const theme = useContext(ThemeContext)
    const { colors } = theme

    return <DomIcon path={path} color={colors.onBackground} style={{ opacity: OPACITY.secondary }} />
}
