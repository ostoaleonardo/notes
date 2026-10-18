import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { levelRowStyles } from './drawer-level-styles'

import { DRAWER_ITEM } from '@/constants/components'
import { TRANSPARENT } from '@/constants/themes'

export const DrawerLevelNote = memo(function DrawerLevelNote({ note, active, onOpenNote }) {
    const { colors } = useTheme()

    const onPress = useCallback(() => onOpenNote(note.path), [onOpenNote, note.path])

    const color = active ? colors.accentText : colors.onBackground

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
                style={[levelRowStyles.touch, levelRowStyles.touchEnd]}
            >
                <View style={levelRowStyles.content}>
                    <Typography bold={active} color={color} numberOfLines={1} styleProps={levelRowStyles.label}>
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
        borderRadius: DRAWER_ITEM.radius,
        marginBottom: DRAWER_ITEM.rowGap
    }
})
