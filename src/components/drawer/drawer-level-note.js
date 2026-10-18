import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { levelRowStyles } from './drawer-level-styles'

import { DRAWER_ITEM } from '@/constants/components'
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
    const paddingStart = DRAWER_ITEM.paddingHorizontal + depth * SPACING.lg

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: active ? colors.tertiary + TRANSPARENT[20] : colors.transparent }
            ]}
        >
            <TouchableRipple
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
            </TouchableRipple>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl,
        marginBottom: DRAWER_ITEM.rowGap
    }
})
