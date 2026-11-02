import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { Touchable } from '@/ui/touchable'
import { useTheme } from '@/ui/hooks/use-theme'
import { levelRowStyles } from './drawer-level-styles'

import { RADIUS, SPACING } from '@/constants/theme'
import { TRANSPARENT } from '@/constants/themes'

export const DrawerLevelNote = memo(function DrawerLevelNote({
    note,
    depth = 0,
    active,
    onOpenNote
}) {
    const { colors } = useTheme()

    const onPress = useCallback(() => onOpenNote(note.path), [onOpenNote, note.path])

    const color = active ? colors.accentText : colors.onBackground
    const paddingStart = SPACING.md + depth * SPACING.lg

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: active ? colors.tertiary + TRANSPARENT[20] : colors.transparent }
            ]}
        >
            <Touchable
                accessibilityRole='button'
                accessibilityState={{ selected: !!active }}
                onPress={onPress}
                style={[levelRowStyles.touch, levelRowStyles.touchEnd, { paddingStart }]}
            >
                <View style={levelRowStyles.content}>
                    <Typography
                        bold={active}
                        color={color}
                        numberOfLines={1}
                        styleProps={levelRowStyles.label}
                    >
                        {note.title}
                    </Typography>
                </View>
            </Touchable>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl
    }
})
