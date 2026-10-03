import { StyleSheet, TextInput, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS } from '@/constants/radius'
import { FONTS } from '@/constants/fonts'
import { SPACING } from '@/constants/spacing'

export function SmallInput({ background, ...props }) {
    const { colors } = useTheme()

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: background || colors.surface
            }}
        >
            <TextInput
                style={{
                    ...styles.base,
                    color: colors.onBackground
                }}
                cursorColor={colors.onBackground}
                selectionHandleColor={colors.tertiary}
                selectionColor={colors.onBackground + TRANSPARENT[20]}
                placeholderTextColor={colors.onBackground + TRANSPARENT[40]}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        borderRadius: RADIUS.outer,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg
    },
    base: {
        flex: 1,
        padding: 0,
        fontSize: 14,
        textAlignVertical: 'center',
        fontFamily: FONTS.azeretLight
    }
})
