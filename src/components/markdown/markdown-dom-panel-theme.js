import { SPACING, RADIUS, OPACITY, Z_INDEX, DOM_FONT_SIZE } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export const buildTitleSectionStyle = () => ({
    boxSizing: 'border-box',
    width: '100%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px'
})

export const buildTitleTextareaStyle = ({ colors, typography }) => ({
    display: 'block',
    width: '100%',
    resize: 'none',
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: typography.headingFontFamily,
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.onBackground,
    padding: 0,
    margin: 0
})

export const buildMetaLabelStyle = ({ colors, typography }) => ({
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    fontSize: '9px',
    textTransform: 'uppercase',
    opacity: OPACITY.muted,
    color: colors.onBackground,
    fontFamily: typography.fontFamily
})

export const buildPropertiesToggleStyle = ({ colors }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: SPACING.xxs,
    marginBottom: SPACING.sm,
    fontSize: '10px',
    textTransform: 'uppercase',
    opacity: OPACITY.muted,
    color: colors.onBackground,
    cursor: 'pointer',
    userSelect: 'none',
    width: 'fit-content'
})

export const buildChipStyle = ({ colors, typography }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '22px',
    padding: '0 8px',
    boxSizing: 'border-box',
    borderRadius: '999px',
    backgroundColor: colors.tertiary + TRANSPARENT[20],
    color: colors.tertiary,
    fontFamily: typography.fontFamily,
    fontSize: DOM_FONT_SIZE.small,
    lineHeight: DOM_FONT_SIZE.small,
    cursor: 'pointer'
})

export const buildPropertiesCardStyle = ({ colors }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xxs,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderRadius: '8px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.onBackground + TRANSPARENT[5]}`,
    color: colors.onBackground
})

export const buildPropertyEntryStyle = () => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    minHeight: '32px',
    position: 'relative'
})

export const buildPropertyNameStyle = ({ fill = false } = {}) => ({
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: fill ? 1 : '0 0 30%',
    minHeight: '32px',
    minWidth: 0
})

export const buildPropertyValueStyle = () => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
    boxSizing: 'border-box',
    minHeight: '32px',
    padding: '5px 0',
    minWidth: 0
})

export const buildPropertyInputStyle = ({ colors, typography }, { opacity = 1 } = {}) => ({
    flex: 1,
    minWidth: 0,
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    fontFamily: typography.fontFamily,
    fontSize: DOM_FONT_SIZE.small,
    color: colors.onBackground,
    opacity
})

export const buildPropertyIconButtonStyle = ({ colors }, { opacity = OPACITY.secondary } = {}) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: colors.onBackground,
    opacity,
    cursor: 'pointer'
})

export const buildPropertyAddButtonStyle = ({ colors, typography }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: SPACING.xs,
    width: 'fit-content',
    padding: '4px 0',
    border: 'none',
    background: 'transparent',
    fontFamily: typography.fontFamily,
    fontSize: DOM_FONT_SIZE.small,
    color: colors.onBackground,
    opacity: OPACITY.secondary,
    cursor: 'pointer'
})

export const buildPropertyMenuStyle = ({ colors }) => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: Z_INDEX.dropdown,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    maxHeight: '220px',
    overflowY: 'auto',
    padding: SPACING.xs,
    borderRadius: `${RADIUS.lg}px`,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.onBackground + TRANSPARENT[5]}`
})

export const buildPropertyMenuItemStyle = ({ colors, typography }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: '6px 8px',
    borderRadius: '6px',
    fontFamily: typography.fontFamily,
    fontSize: DOM_FONT_SIZE.small,
    color: colors.onBackground,
    cursor: 'pointer'
})

export const buildInvalidPropertiesBannerStyle = ({ colors, typography }) => ({
    padding: '12px',
    borderRadius: '8px',
    marginBottom: SPACING.lg,
    backgroundColor: colors.errorContainer,
    color: colors.onErrorContainer,
    fontFamily: typography.fontFamily
})

export const buildInvalidPropertiesTitleStyle = () => ({
    fontSize: DOM_FONT_SIZE.small,
    fontWeight: 'bold'
})

export const buildInvalidPropertiesDescriptionStyle = () => ({
    fontSize: DOM_FONT_SIZE.caption,
    opacity: OPACITY.emphasized,
    marginTop: SPACING.xxxs
})
