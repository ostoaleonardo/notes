import { SYNTAX_PALETTES, SYNTAX_COMMENT_OPACITY } from '@/features/editor/constants/syntax-highlighting'

export const buildSyntaxColors = ({ colors, dark }) => ({
    ...(dark ? SYNTAX_PALETTES.dark : SYNTAX_PALETTES.light),
    comment: colors.onBackground + SYNTAX_COMMENT_OPACITY
})
